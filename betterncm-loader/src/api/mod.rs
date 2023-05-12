use cef::*;
use tracing::*;

mod app;
mod audio;
mod fs;
mod internal;
mod native_plugin;
mod util;

fn init_native_api(ctx: &NativeAPIInitContext) {
    ctx.define_api(internal::get_framework_css);
    ctx.define_api(util::execute_java_script);
    ctx.define_api(audio::get_fft_data);
    ctx.define_api(audio::acquire_fft_data);
    ctx.define_api(audio::release_fft_data);
    ctx.define_api(app::crash);
    ctx.define_api(app::restart);
    ctx.define_api(app::read_config);
    ctx.define_api(app::write_config);
    ctx.define_api(app::reload_ignore_cache);
    ctx.define_api(app::version);
    ctx.define_api(app::get_ncm_path);
    ctx.define_api(app::get_data_path);
    ctx.define_api(app::show_console);
    ctx.define_api(app::exec);
    ctx.define_api(app::restart_plugins);
    ctx.define_api(app::set_rounded_corner);
    ctx.define_api(fs::read_dir);
    ctx.define_api(fs::read_file);
    ctx.define_api(fs::read_file_text);
    ctx.define_api(fs::rename);
    ctx.define_api(fs::exists);
    ctx.define_api(fs::write_file);
    ctx.define_api(fs::write_file_text);
    ctx.define_api(fs::remove);
    ctx.define_api(fs::mkdir);
    ctx.define_api(fs::watch_directory);
    ctx.define_api(fs::get_properties);
    ctx.define_api(fs::read_dir_with_details);
    ctx.define_api(fs::get_disks);
    ctx.define_api(native_plugin::get_registered_apis);
    ctx.define_api(native_plugin::call_native_api);
}

pub(super) fn threaded_promise<T, F>(
    this: CefV8Value,
    resolve: CefV8Function,
    reject: CefV8Function,
    callback: F,
) where
    T: TryInto<CefV8Value> + Send + 'static,
    F: FnOnce() -> anyhow::Result<T> + Send + 'static,
    T::Error: std::fmt::Debug,
{
    let ctx = CefV8Context::current();
    rayon::spawn(move || match callback() {
        Result::Ok(result) => {
            ctx.post_task(move || {
                if let Ok(result) = result.try_into() {
                    resolve.execute_function(Some(this), &[result]);
                } else if let Ok(err) = "转换返回值类型出错".try_into() {
                    reject.execute_function(Some(this), &[err]);
                } else {
                    reject.execute_function(Some(this), &[]);
                }
            });
        }
        Result::Err(err) => {
            let err = format!("{:?}", err);
            ctx.post_task(move || {
                if let Ok(err) = err.try_into() {
                    reject.execute_function(Some(this), &[err]);
                } else {
                    reject.execute_function(Some(this), &[]);
                }
            });
        }
    });
}

pub(super) fn optional_threaded_promise<T, F>(
    this: CefV8Value,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
    callback: F,
) -> anyhow::Result<CefV8Value>
where
    T: TryInto<CefV8Value> + Send + 'static,
    F: FnOnce() -> anyhow::Result<T> + Send + 'static,
    T::Error: std::fmt::Debug + std::error::Error + Send + Sync,
{
    if let Some(resolve) = resolve {
        if let Some(reject) = reject {
            let ctx = CefV8Context::current();
            rayon::spawn(move || match callback() {
                Result::Ok(result) => {
                    ctx.post_task(move || {
                        if let Ok(result) = result.try_into() {
                            resolve.execute_function(Some(this), &[result]);
                        } else if let Ok(err) = "转换返回值类型出错".try_into() {
                            reject.execute_function(Some(this), &[err]);
                        } else {
                            reject.execute_function(Some(this), &[]);
                        }
                    });
                }
                Result::Err(err) => {
                    let err = format!("{:?}", err);
                    ctx.post_task(move || {
                        if let Ok(err) = err.try_into() {
                            reject.execute_function(Some(this), &[err]);
                        } else {
                            reject.execute_function(Some(this), &[]);
                        }
                    });
                }
            });
            return Ok(().try_into()?);
        }
    }
    let result = callback()?;
    Ok(result.try_into()?)
}

pub struct NativeAPIDesc {
    pub name: &'static str,
    pub this_object: bool,
    pub function: fn(&[*mut cef_sys::cef_v8value_t]) -> anyhow::Result<CefV8Value>,
}

struct NativeAPIInitContext(cef::CefV8Value);

impl NativeAPIInitContext {
    pub fn define_api(&self, desc: fn() -> NativeAPIDesc) {
        self.define_api_directly(desc())
    }

    pub fn define_api_directly(&self, desc: NativeAPIDesc) {
        let def_name = desc.name;
        let mut path = desc.name.split('.').collect::<Vec<_>>();
        let name = path.pop();

        if let Some(name) = name {
            let mut cur_obj = unsafe { CefV8Value::from_raw(self.0.as_raw()) };
            for sub_path in path {
                let has_key = cur_obj.has_value_bykey(sub_path);
                if !has_key {
                    cur_obj.set_value_bykey(sub_path, cef::CefV8Value::new_object());
                }

                cur_obj = cur_obj.get_value_bykey(sub_path);
            }

            #[repr(C)]
            struct APIHandler {
                handler: cef_sys::cef_v8handler_t,
                desc: NativeAPIDesc,
            }

            unsafe extern "stdcall" fn on_execute(
                this: *mut cef_sys::cef_v8handler_t,
                _name: *const cef_sys::cef_string_t,
                object: *mut cef_sys::cef_v8value_t,
                arguments_count: usize,
                arguments: *const *mut cef_sys::_cef_v8value_t,
                retval: *mut *mut cef_sys::cef_v8value_t,
                exception: *mut cef_sys::cef_string_t,
            ) -> ::core::ffi::c_int {
                let handler = (std::mem::transmute::<_, *mut APIHandler>(this))
                    .as_ref()
                    .unwrap();

                let mut args = Vec::with_capacity(arguments_count + 1);

                if handler.desc.this_object {
                    args.push(object);
                }

                args.extend_from_slice(std::slice::from_raw_parts(arguments, arguments_count));

                match (handler.desc.function)(&args) {
                    Ok(value) => {
                        *retval = value.as_raw();
                    }
                    Err(err) => {
                        let err = format!("调用 {} 出错: {:?}", handler.desc.name, err);
                        *exception = *CefString::from(err.as_str()).to_raw();
                    }
                }

                1
            }

            unsafe {
                let func_value = cef_sys::cef_v8value_create_function(
                    CefString::from(desc.name).to_raw(),
                    Box::leak(Box::new(APIHandler {
                        handler: cef_sys::cef_v8handler_t {
                            base: cef::create_once_ref::<APIHandler>(),
                            execute: Some(on_execute),
                        },
                        desc,
                    })) as *mut _ as _,
                );

                cur_obj.set_value_bykey(name, CefV8Value::from_raw(func_value));
            }
            debug!("已注册原生函数：{}", def_name);
        } else {
            warn!("警告：原生函数 API 路径定义有误：{}", desc.name);
        }
    }

    pub fn finish(self) -> cef::CefV8Value {
        self.0
    }
}

#[instrument]
pub fn setup_native_api(mut global_this: cef::CefV8Value) {
    if !global_this.has_value_bykey("betterncm_native") {
        info!("正在初始化 MWBNCM 原生 API");

        let betterncm_native_obj = NativeAPIInitContext(cef::CefV8Value::new_object());

        init_native_api(&betterncm_native_obj);

        global_this.set_value_bykey("betterncm_native", betterncm_native_obj.finish());
    }

    // global_this.set_value_bykey("betterncm_native", cef::CefV8Value::from("testing"));
}
