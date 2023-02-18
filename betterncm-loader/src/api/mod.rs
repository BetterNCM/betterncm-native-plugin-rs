use betterncm_macro::*;
use cef::*;
use cef_sys::cef_v8context_get_current_context;
use tracing::*;

mod scheme;

#[betterncm_native_api(name = "test.func")]
#[instrument]
fn test_func(arg: String, callback: CefV8Function) {
    std::thread::spawn(move || {
        let arg = format!("added {arg}");
        callback.execute_function(&[arg.into()]);
    });
}

#[betterncm_native_api(name = "util.executeJavaScript")]
#[instrument]
fn test_func_2(code: String, script_url: String, start_line: ::core::ffi::c_int) {
    unsafe {
        let ctx = cef_v8context_get_current_context().as_mut().unwrap();
        let frame = ctx.get_frame.unwrap()(ctx).as_mut().unwrap();

        let code = CefString::from(code.as_str()).to_raw();
        let script_url = CefString::from(script_url.as_str()).to_raw();

        frame.execute_java_script.unwrap()(frame, code, script_url, start_line);
    }
}

fn init_native_api(ctx: &NativeAPIInitContext) {
    ctx.define_api(test_func);
    ctx.define_api(test_func_2);
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
                        let err = format!("{:#?}", err);
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
pub fn setup_native_api(global_this: cef::CefV8Value) {
    if !global_this.has_value_bykey("betterncm_native") {
        info!("正在初始化 MWBNCM 原生 API");

        let betterncm_native_obj = NativeAPIInitContext(cef::CefV8Value::new_object());

        init_native_api(&betterncm_native_obj);

        global_this.set_value_bykey("betterncm_native", betterncm_native_obj.finish());
    }

    // global_this.set_value_bykey("betterncm_native", cef::CefV8Value::from("testing"));
}
