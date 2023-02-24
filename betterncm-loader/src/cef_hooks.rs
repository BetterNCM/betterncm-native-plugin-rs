use anyhow::Context;
use detour::RawDetour;
use tracing::*;
use windows::{
    core::*,
    s,
    Win32::{
        Foundation::*,
        System::LibraryLoader::{GetProcAddress, LoadLibraryW},
    },
};

#[instrument]
pub unsafe fn init_cef_hooks() -> anyhow::Result<()> {
    let cef_dll = LoadLibraryW(w!("libcef.dll")).context("无法加载 LibCEF 动态链接库！")?;

    unsafe fn hook_dll_function(
        dll_instance: HINSTANCE,
        name: PCSTR,
        hook_func: *const (),
    ) -> anyhow::Result<Option<RawDetour>> {
        let target = GetProcAddress(dll_instance, name)
            .with_context(|| format!("无法 Hook 函数 {}", name.display()))?
            as *const ();

        debug!(
            "正在 Hook {} 从 {:?} 到 {:?}",
            name.to_string().unwrap_or_default(),
            target,
            hook_func
        );

        let hook = RawDetour::new(target, hook_func)?;

        hook.enable()?;

        Ok(Some(hook))
    }

    hook::CEF_INITIALIZE = hook_dll_function(
        cef_dll,
        s!("cef_initialize"),
        hook::hook_cef_initialize as _,
    )?;

    hook::CEF_CREATE_BROWSER_SYNC = hook_dll_function(
        cef_dll,
        s!("cef_browser_host_create_browser_sync"),
        hook::hook_cef_browser_host_create_browser_sync as _,
    )?;

    hook::CEF_REG_SCHEME_HANDLER = hook_dll_function(
        cef_dll,
        s!("cef_register_scheme_handler_factory"),
        hook::cef_register_scheme_handler_factory as _,
    )?;

    hook::CEF_GET_CURRENT_CTX = hook_dll_function(
        cef_dll,
        s!("cef_v8context_get_current_context"),
        hook::cef_v8context_get_current_context as _,
    )?;

    debug!("CEF Hook 已初始化完毕！");

    // let d3d11_dll = LoadLibraryW(w!("d3d11.dll")).context("无法加载 D3D11 动态链接库！")?;

    // // D2D1CreateFactory
    // d2d1_hook::D3D11_CREATE_DEVICE = hook_dll_function(
    //     d3d11_dll,
    //     s!("D3D11CreateDevice"),
    //     d2d1_hook::hook_d3d11_create_device as _,
    // )?;

    let dsound_dll = LoadLibraryW(w!("dsound.dll")).context("无法加载 DirectSound 动态链接库！")?;

    // DirectSoundCreate
    dsound_hook::DIRECT_SOUND_CREATE = hook_dll_function(
        dsound_dll,
        s!("DirectSoundCreate"),
        dsound_hook::hook_direct_sound_create as _,
    )?;

    // DirectSoundCreate8
    // dsound_hook::DIRECT_SOUND_CREATE_8 = hook_dll_function(
    //     dsound_dll,
    //     s!("DirectSoundCreate8"),
    //     dsound_hook::hook_direct_sound_create_8 as _,
    // )?;

    Ok(())
}

mod dsound_hook {
    use detour::RawDetour;
    use once_cell::sync::Lazy;
    use tracing::*;
    use windows::{core::Vtable, Win32::Media::Audio::WAVEFORMATEXTENSIBLE};

    #[derive(Default)]
    struct DSoundHookData {
        create_sound_buffer_hook: Option<RawDetour>,
        sound_buffer_unlock_hook: Option<RawDetour>,
        sound_buffer_set_freq_hook: Option<RawDetour>,
    }

    static mut DSOUND_HOOK_DATA: Lazy<DSoundHookData> = Lazy::new(Default::default);

    pub(self) fn get_dsound_hook_data() -> &'static mut Lazy<DSoundHookData> {
        unsafe { &mut DSOUND_HOOK_DATA }
    }

    pub static mut DIRECT_SOUND_CREATE: Option<RawDetour> = None;
    // pub static mut DIRECT_SOUND_CREATE_8: Option<RawDetour> = None;

    pub unsafe extern "system" fn hook_direct_sound_create(
        pcguiddevice: *const windows_sys::core::GUID,
        ppds: *mut windows_sys::Win32::Media::Audio::DirectSound::IDirectSound,
        punkouter: windows_sys::core::IUnknown,
    ) -> windows_sys::core::HRESULT {
        let orig_func: unsafe extern "system" fn(
            pcguiddevice: *const windows_sys::core::GUID,
            ppds: *mut windows_sys::Win32::Media::Audio::DirectSound::IDirectSound,
            punkouter: windows_sys::core::IUnknown,
        ) -> windows_sys::core::HRESULT =
            std::mem::transmute(DIRECT_SOUND_CREATE.as_ref().unwrap().trampoline());

        let result = orig_func(pcguiddevice, ppds, punkouter);

        if result == 0 {
            info!("使用 DirectSoundCreate 创建了 DirectSound 接口");

            let ppds: *mut windows::Win32::Media::Audio::DirectSound::IDirectSound =
                std::mem::transmute(ppds);

            if let Some(ppds) = ppds.as_mut() {
                let data = get_dsound_hook_data();
                if data.create_sound_buffer_hook.is_none() {
                    let hook = RawDetour::new(
                        ppds.vtable().CreateSoundBuffer as _,
                        hook_create_sound_buffer as _,
                    )
                    .unwrap();
                    hook.enable().unwrap();
                    data.create_sound_buffer_hook = Some(hook);
                    info!("篡改了 IDirectSound::CreateSoundBuffer 函数");
                }
            }
        }

        result
    }

    unsafe extern "system" fn hook_create_sound_buffer(
        this: *mut ::core::ffi::c_void,
        pcdsbufferdesc: &windows::Win32::Media::Audio::DirectSound::DSBUFFERDESC,
        ppdsbuffer: *mut ::core::option::Option<
            windows::Win32::Media::Audio::DirectSound::IDirectSoundBuffer,
        >,
        punkouter: *mut ::core::ffi::c_void,
    ) -> ::windows::core::HRESULT {
        let data = get_dsound_hook_data();
        let orig_func: unsafe extern "system" fn(
            this: *mut ::core::ffi::c_void,
            pcdsbufferdesc: &windows::Win32::Media::Audio::DirectSound::DSBUFFERDESC,
            ppdsbuffer: *mut ::core::option::Option<
                windows::Win32::Media::Audio::DirectSound::IDirectSoundBuffer,
            >,
            punkouter: *mut ::core::ffi::c_void,
        ) -> ::windows::core::HRESULT =
            std::mem::transmute(data.create_sound_buffer_hook.as_ref().unwrap().trampoline());

        let result = orig_func(this, dbg!(pcdsbufferdesc), ppdsbuffer, punkouter);

        if result.is_ok() {
            info!("创建了音频缓冲区");

            if let Some(Some(ppdsbuffer)) = ppdsbuffer.as_mut() {
                if let Some(wfx) = pcdsbufferdesc.lpwfxFormat.as_ref() {
                    if wfx.wFormatTag == 0xFFFE {
                        // 扩展格式
                        let wfx: &WAVEFORMATEXTENSIBLE = std::mem::transmute(wfx);
                        if let Some(sx) = crate::audio::get_audio_thread_sender() {
                            // dbg!(wfx.SubFormat);
                            let _ = sx.send(crate::audio::AudioThreadMessage::SetAudioInfo(
                                crate::audio::AudioInfo {
                                    sps: wfx.Format.nSamplesPerSec,
                                    bps: wfx.Format.wBitsPerSample,
                                    ca: wfx.Format.nChannels,
                                },
                            ));
                        }
                    } else if let Some(sx) = crate::audio::get_audio_thread_sender() {
                        let _ = sx.send(crate::audio::AudioThreadMessage::SetAudioInfo(
                            crate::audio::AudioInfo {
                                sps: wfx.nSamplesPerSec,
                                bps: wfx.wBitsPerSample,
                                ca: wfx.nChannels,
                            },
                        ));
                    }
                }

                if data.sound_buffer_unlock_hook.is_none() {
                    let hook = RawDetour::new(
                        ppdsbuffer.vtable().Unlock as _,
                        sound_buffer_unlock_hook as _,
                    )
                    .unwrap();
                    let _ = hook.enable();
                    data.sound_buffer_unlock_hook = Some(hook);
                    info!("篡改了 IDirectSoundBuffer::Unlock 函数");
                }

                if data.sound_buffer_set_freq_hook.is_none() {
                    let hook = RawDetour::new(
                        ppdsbuffer.vtable().SetFrequency as _,
                        sound_buffer_set_freq_hook as _,
                    )
                    .unwrap();
                    let _ = hook.enable();
                    data.sound_buffer_set_freq_hook = Some(hook);
                    info!("篡改了 IDirectSoundBuffer::SetFrequency 函数");
                }
            }
        }

        result
    }

    unsafe extern "system" fn sound_buffer_unlock_hook(
        this: *mut windows::Win32::Media::Audio::DirectSound::IDirectSoundBuffer,
        pvaudioptr1: *const ::core::ffi::c_void,
        dwaudiobytes1: u32,
        pvaudioptr2: *const ::core::ffi::c_void,
        dwaudiobytes2: u32,
    ) -> ::windows::core::HRESULT {
        let data = get_dsound_hook_data();
        let orig_func: unsafe extern "system" fn(
            this: *mut windows::Win32::Media::Audio::DirectSound::IDirectSoundBuffer,
            pvaudioptr1: *const ::core::ffi::c_void,
            dwaudiobytes1: u32,
            pvaudioptr2: *const ::core::ffi::c_void,
            dwaudiobytes2: u32,
        ) -> ::windows::core::HRESULT =
            std::mem::transmute(data.sound_buffer_unlock_hook.as_ref().unwrap().trampoline());

        let buf = std::slice::from_raw_parts(pvaudioptr1 as *const u8, dwaudiobytes1 as _);

        if this.as_ref().is_some() {
            // info!(
            //     "调用了 IDirectSoundBuffer::Unlock 函数 缓冲区大小 {}",
            //     buf.len(),
            // );
            if let Some(sx) = crate::audio::get_audio_thread_sender() {
                let _ = sx.send(crate::audio::AudioThreadMessage::PushAudioBuffer(
                    buf.to_vec(),
                ));
            }
        }

        orig_func(this, pvaudioptr1, dwaudiobytes1, pvaudioptr2, dwaudiobytes2)
    }

    unsafe extern "system" fn sound_buffer_set_freq_hook(
        this: *mut ::core::ffi::c_void,
        dwfrequency: u32,
    ) -> ::windows::core::HRESULT {
        let data = get_dsound_hook_data();
        let orig_func: unsafe extern "system" fn(
            this: *mut ::core::ffi::c_void,
            dwfrequency: u32,
        ) -> ::windows::core::HRESULT = std::mem::transmute(
            data.sound_buffer_set_freq_hook
                .as_ref()
                .unwrap()
                .trampoline(),
        );

        // if result.is_ok() {
        //     if let Some(sx) = crate::audio::get_audio_thread_sender() {
        //         let _ = sx.send(crate::audio::AudioThreadMessage::SetSamplesPerSec(
        //             dwfrequency,
        //         ));
        //     }
        // }

        orig_func(this, dwfrequency)
    }
}

mod hook {
    use std::{collections::HashMap, ffi::*, io::Write};

    use cef_sys::*;
    use detour::RawDetour;
    use once_cell::sync::Lazy;
    use path_absolutize::Absolutize;
    use tracing::*;
    use windows::Win32::{
        Graphics::Dwm::{DwmSetWindowAttribute, DWMWA_WINDOW_CORNER_PREFERENCE, DWMWCP_ROUND},
        System::Threading::GetCurrentProcessId,
        UI::WindowsAndMessaging::{
            SetLayeredWindowAttributes, SetWindowLongW, CW_USEDEFAULT, GWL_EXSTYLE, LWA_ALPHA,
            WS_CLIPCHILDREN, WS_CLIPSIBLINGS, WS_EX_COMPOSITED, WS_OVERLAPPEDWINDOW, WS_VISIBLE,
        },
    };

    #[derive(Default)]
    struct CEFHookData {
        client: Option<*mut _cef_client_t>,
        origin_cef_load_handler: Option<
            unsafe extern "stdcall" fn(self_: *mut _cef_client_t) -> *mut _cef_load_handler_t,
        >,
        origin_cef_on_load_start: Option<
            unsafe extern "stdcall" fn(
                self_: *mut _cef_load_handler_t,
                browser: *mut _cef_browser_t,
                frame: *mut _cef_frame_t,
                transition_type: cef_transition_type_t,
            ),
        >,
        origin_cef_get_keyboard_handler: Option<
            unsafe extern "stdcall" fn(self_: *mut _cef_client_t) -> *mut _cef_keyboard_handler_t,
        >,
        origin_cef_on_key_event: Option<
            unsafe extern "stdcall" fn(
                self_: *mut _cef_keyboard_handler_t,
                browser: *mut _cef_browser_t,
                event: *const _cef_key_event_t,
                os_event: *mut MSG,
            ) -> c_int,
        >,
        origin_cef_scheme_handler_create: Option<
            unsafe extern "stdcall" fn(
                self_: *mut _cef_scheme_handler_factory_t,
                browser: *mut _cef_browser_t,
                frame: *mut _cef_frame_t,
                scheme_name: *const cef_string_t,
                request: *mut _cef_request_t,
            ) -> *mut _cef_resource_handler_t,
        >,
        origin_read_response: Option<
            unsafe extern "stdcall" fn(
                self_: *mut _cef_resource_handler_t,
                data_out: *mut c_void,
                bytes_to_read: c_int,
                bytes_read: *mut c_int,
                callback: *mut _cef_callback_t,
            ) -> c_int,
        >,
        orig_on_before_command_line_processing: Option<
            unsafe extern "stdcall" fn(
                self_: *mut _cef_app_t,
                process_type: *const cef_string_t,
                command_line: *mut _cef_command_line_t,
            ),
        >,
        orig_append_switch: Option<
            unsafe extern "stdcall" fn(self_: *mut _cef_command_line_t, name: *const cef_string_t),
        >,
        orig_append_switch_with_value: Option<
            unsafe extern "stdcall" fn(
                self_: *mut _cef_command_line_t,
                name: *const cef_string_t,
                value: *const cef_string_t,
            ),
        >,
        browser_window: Option<windows::Win32::Foundation::HWND>,
    }

    static mut CEF_HOOK_DATA: Lazy<CEFHookData> = Lazy::new(Default::default);

    pub(self) fn get_cef_hook_data() -> &'static mut Lazy<CEFHookData> {
        unsafe { &mut CEF_HOOK_DATA }
    }

    pub static mut CEF_GET_CURRENT_CTX: Option<RawDetour> = None;
    pub unsafe extern "C" fn cef_v8context_get_current_context() -> *mut cef_v8context_t {
        #[cfg(debug_assertions)]
        crate::open_console();

        let ori_func: fn() -> *mut cef_v8context_t =
            std::mem::transmute(CEF_GET_CURRENT_CTX.as_ref().unwrap().trampoline());
        let ctx = ori_func();

        if !ctx.is_null() {
            let ctx = ctx.as_mut().unwrap();

            let frame = ctx.get_frame.unwrap()(ctx).as_mut().unwrap();
            if frame.is_main.unwrap()(frame) != 0 {
                let global_this = cef::CefV8Value::from_raw(ctx.get_global.unwrap()(ctx));

                crate::api::setup_native_api(global_this);
            }
        }

        ctx
    }

    pub static mut CEF_REG_SCHEME_HANDLER: Option<RawDetour> = None;
    pub unsafe extern "C" fn cef_register_scheme_handler_factory(
        scheme_name: *const cef_string_t,
        domain_name: *const cef_string_t,
        factory: &mut cef_scheme_handler_factory_t,
    ) -> c_int {
        let ori_func: unsafe extern "C" fn(
            scheme_name: *const cef_string_t,
            domain_name: *const cef_string_t,
            factory: *mut cef_scheme_handler_factory_t,
        ) -> c_int = std::mem::transmute(CEF_REG_SCHEME_HANDLER.as_ref().unwrap().trampoline());

        let scheme = cef::CefString::from_raw(scheme_name as _);
        let domain = cef::CefString::from_raw(domain_name as _);

        trace!(
            "创建了自定义协议回调: 0x{:08X} {} {}",
            factory.create.unwrap() as usize,
            scheme,
            domain,
        );

        if &scheme.to_string() == "orpheus" {
            get_cef_hook_data().origin_cef_scheme_handler_create = factory.create;
            factory.create = Some(hook_cef_scheme_handler_create);
        }

        ori_func(scheme_name, domain_name, factory)
    }

    unsafe extern "stdcall" fn hook_cef_scheme_handler_create(
        this: *mut _cef_scheme_handler_factory_t,
        browser: *mut _cef_browser_t,
        frame: *mut _cef_frame_t,
        scheme_name: *const cef_string_t,
        request: *mut _cef_request_t,
    ) -> *mut _cef_resource_handler_t {
        let result = get_cef_hook_data()
            .origin_cef_scheme_handler_create
            .unwrap()(this, browser, frame, scheme_name, request)
        .as_mut()
        .unwrap();
        let request = request.as_mut().unwrap();

        let url = cef::CefString::from_raw(request.get_url.unwrap()(request) as _).to_string();

        // debug!("拦截到请求 {}", url);

        if crate::scheme_hijack::on_test_url_hijack(&url) {
            get_cef_hook_data().origin_read_response = result.read_response;
            result.read_response = Some(hook_read_response);

            let handler = get_scheme_mitm_handler();
            handler.add_new_res(result, url.as_str());

            trace!("已捕获自定义协议请求: {}", url);
        }

        result
    }

    unsafe extern "stdcall" fn hook_read_response(
        this: *mut _cef_resource_handler_t,
        data_out: *mut c_void,
        bytes_to_read: c_int,
        bytes_read: *mut c_int,
        _callback: *mut _cef_callback_t,
    ) -> c_int {
        let handler = get_scheme_mitm_handler();

        handler.fill_data(this.as_mut().unwrap());

        *bytes_read = get_scheme_mitm_handler().send_data(
            this.as_ref().unwrap(),
            std::slice::from_raw_parts_mut(data_out as _, bytes_to_read as _),
        ) as _;

        if *bytes_read == 0 {
            0
        } else {
            1
        }
    }

    static mut SCHEME_MITM_HANDLER: Lazy<CEFSchemeMITMHandler> =
        Lazy::new(CEFSchemeMITMHandler::new);
    pub fn get_scheme_mitm_handler() -> &'static mut Lazy<CEFSchemeMITMHandler> {
        unsafe { &mut SCHEME_MITM_HANDLER }
    }

    pub struct CEFSchemeMITMHandler {
        cached_url_data: HashMap<String, Vec<u8>>,
        res_urls: HashMap<usize, String>,
        res_cursors: HashMap<usize, usize>,
    }

    impl CEFSchemeMITMHandler {
        fn new() -> Self {
            Self {
                cached_url_data: HashMap::with_capacity(1024),
                res_urls: HashMap::with_capacity(1024),
                res_cursors: HashMap::with_capacity(1024),
            }
        }

        pub fn fill_data(
            &mut self,
            res: &mut cef_resource_handler_t,
            // callback: cef_callback_t,
        ) {
            let id = res as *mut _ as usize;
            let url = &self.res_urls[&id];
            if self.cached_url_data.contains_key(url) {
                return;
            }
            let mut result = Vec::with_capacity(0xFFFF);

            let mut buf_read = 0;
            let mut buf = [0u8; 0xFF];

            let origin_read_response = get_cef_hook_data().origin_read_response.unwrap();
            let mut a = unsafe {
                cef_callback_t {
                    ..std::mem::zeroed()
                }
            };
            while unsafe {
                origin_read_response(
                    res,
                    buf.as_mut_ptr() as _,
                    (buf.len() - 1) as _,
                    &mut buf_read,
                    &mut a,
                )
            } != 0
            {
                result.extend_from_slice(&buf[..buf_read as _]);
                buf_read = 0;
            }

            trace!("已抓包数据 {} {}", result.len(), url);

            let mut result = crate::scheme_hijack::on_process_url_data(url, result);

            trace!("已处理包内容并缓存 {} {}", result.len(), url);

            result.shrink_to_fit();

            self.cached_url_data.insert(url.to_owned(), result);
        }

        pub fn add_new_res(&mut self, res: &cef_resource_handler_t, url: &str) {
            let id = res as *const _ as usize;
            self.res_cursors.insert(id, 0);
            self.res_urls.insert(id, url.to_owned());
        }

        pub fn send_data(&mut self, res: &cef_resource_handler_t, mut dest: &mut [u8]) -> usize {
            let id = res as *const _ as usize;
            let cursor = *self.res_cursors.get(&id).unwrap();
            let url = self.res_urls.get(&id).unwrap();
            let data = &self.cached_url_data[url][cursor..];
            let len = dest.write(data).unwrap_or(0);

            if len == 0 {
                self.res_cursors.remove(&id);
                self.res_urls.remove(&id);
            } else {
                self.res_cursors.insert(id, cursor + len);
            }

            len
        }
    }

    // ######### 脚本注入 #########

    pub static mut CEF_INITIALIZE: Option<RawDetour> = None;
    #[instrument]
    pub unsafe extern "C" fn hook_cef_initialize(
        args: *const cef_sys::cef_main_args_t,
        settings: *mut cef_sys::cef_settings_t,
        application: *mut cef_sys::cef_app_t,
        windows_sandbox_info: *mut c_void,
    ) -> ::core::ffi::c_int {
        debug!("正在初始化 CEF！");
        let ori_func: unsafe extern "C" fn(
            args: *const cef_sys::cef_main_args_t,
            settings: *mut cef_sys::cef_settings_t,
            application: *mut cef_sys::cef_app_t,
            windows_sandbox_info: *mut c_void,
        ) -> ::core::ffi::c_int =
            std::mem::transmute(CEF_INITIALIZE.as_ref().unwrap().trampoline());
        let application = application.as_mut().unwrap();
        let hook_data = get_cef_hook_data();

        hook_data.orig_on_before_command_line_processing =
            application.on_before_command_line_processing;
        application.on_before_command_line_processing =
            Some(hook_on_before_command_line_processing);

        ori_func(args, settings, application, windows_sandbox_info)
    }

    #[instrument]
    unsafe extern "stdcall" fn hook_on_before_command_line_processing(
        this: *mut _cef_app_t,
        process_type: *const cef_string_t,
        command_line: *mut _cef_command_line_t,
    ) {
        info!("正在处理参数");
        let command_line = command_line.as_mut().unwrap();
        let hook_data = get_cef_hook_data();

        command_line.append_switch.unwrap()(
            command_line,
            cef::CefString::from("disable-web-security").to_raw(),
        );
        command_line.append_switch.unwrap()(
            command_line,
            cef::CefString::from("ignore-certificate-errors").to_raw(),
        );
        command_line.append_switch.unwrap()(
            command_line,
            cef::CefString::from("in-process-gpu").to_raw(),
        );
        // 如果是单进程，使用 DevTools 进行 debugger; 断点测试时会卡住整个进程
        // command_line.append_switch.unwrap()(
        //     command_line,
        //     cef::CefString::from("single-process").to_raw(),
        // );
        command_line.append_switch.unwrap()(
            command_line,
            cef::CefString::from("allow-running-insecure-content").to_raw(),
        );

        if let Ok(ext_dir) = std::fs::read_dir("./devtool-extensions") {
            let mut exts = Vec::with_capacity(16);

            for ext_entry in ext_dir.flatten() {
                if ext_entry.path().is_dir() {
                    if let Ok(ext_path) = ext_entry.path().absolutize() {
                        exts.push(ext_path.to_string_lossy().to_string());
                    }
                }
            }

            if !exts.is_empty() {
                info!("已尝试加载插件 {}", exts.join(", "));
                command_line.append_switch_with_value.unwrap()(
                    command_line,
                    cef::CefString::from("load-extension").to_raw(),
                    cef::CefString::from(exts.join(",")).to_raw(),
                );

                command_line.append_argument.unwrap()(
                    command_line,
                    cef::CefString::from(format!("--load-extension={}", exts.join(","))).to_raw(),
                );
            }
        }

        hook_data.orig_append_switch = command_line.append_switch;
        command_line.append_switch = Some(hook_append_switch);

        hook_data.orig_append_switch_with_value = command_line.append_switch_with_value;
        command_line.append_switch_with_value = Some(hook_append_switch_with_value);

        hook_data.orig_on_before_command_line_processing.unwrap()(this, process_type, command_line);

        let pid = GetCurrentProcessId();

        command_line.append_argument.unwrap()(
            command_line,
            cef::CefString::from(format!("--mrbncb-main-pid={pid}")).to_raw(),
        );
    }

    #[instrument]
    unsafe extern "stdcall" fn hook_append_switch(
        this: *mut _cef_command_line_t,
        name: *const cef_string_t,
    ) {
        let name_t = cef::CefString::from_raw(name as usize as *mut _).to_string();

        if name_t.as_str() == "log-file" {
            return;
        }

        debug!("正在增加参数 {}", name_t);

        get_cef_hook_data().orig_append_switch.unwrap()(this, name);
    }

    #[instrument]
    unsafe extern "stdcall" fn hook_append_switch_with_value(
        this: *mut _cef_command_line_t,
        name: *const cef_string_t,
        value: *const cef_string_t,
    ) {
        let name_t = cef::CefString::from_raw(name as usize as *mut _).to_string();
        let value_t = cef::CefString::from_raw(value as usize as *mut _).to_string();

        if name_t.as_str() == "log-file" {
            return;
        }

        debug!("正在增加参数 {} = {}", name_t, value_t);

        get_cef_hook_data().orig_append_switch_with_value.unwrap()(this, name, value);
    }

    pub static mut CEF_CREATE_BROWSER_SYNC: Option<RawDetour> = None;
    // #[instrument(skip_all)]
    pub unsafe extern "C" fn hook_cef_browser_host_create_browser_sync(
        window_info: &mut cef_window_info_t,
        client: &mut cef_client_t,
        url: &mut cef_string_t,
        settings: &mut _cef_browser_settings_t,
        extra_info: &mut _cef_dictionary_value_t,
        request_context: &mut _cef_request_context_t,
    ) -> *mut cef_browser_t {
        debug!("正在初始化浏览器窗口");

        let ori_func: unsafe extern "C" fn(
            window_info: *const cef_window_info_t,
            client: *mut cef_client_t,
            url: *const cef_string_t,
            settings: *const _cef_browser_settings_t,
            extra_info: *mut _cef_dictionary_value_t,
            request_context: *mut _cef_request_context_t,
        ) -> *mut cef_browser_t =
            std::mem::transmute(CEF_CREATE_BROWSER_SYNC.as_ref().unwrap().trampoline());

        let hook_data = get_cef_hook_data();

        hook_data.client = Some(client as _);

        hook_data.origin_cef_load_handler = client.get_load_handler;
        client.get_load_handler = Some(hook_cef_load_handler);

        hook_data.origin_cef_get_keyboard_handler = client.get_keyboard_handler;
        client.get_keyboard_handler = Some(hook_get_keyboard_handler);

        let parent_hwnd: windows::Win32::Foundation::HWND =
            std::mem::transmute(window_info.parent_window);

        struct Handle(windows::Win32::Foundation::HWND);
        unsafe impl raw_window_handle::HasRawWindowHandle for Handle {
            fn raw_window_handle(&self) -> raw_window_handle::RawWindowHandle {
                let mut handle = raw_window_handle::Win32WindowHandle::empty();
                handle.hwnd = self.0 .0 as _;
                raw_window_handle::RawWindowHandle::Win32(handle)
            }
        }

        let _ = dbg!(DwmSetWindowAttribute(
            parent_hwnd,
            DWMWA_WINDOW_CORNER_PREFERENCE,
            &DWMWCP_ROUND as *const _ as _,
            std::mem::size_of_val(&DWMWCP_ROUND) as _,
        ));
        SetWindowLongW(parent_hwnd, GWL_EXSTYLE, WS_EX_COMPOSITED.0 as _);
        SetLayeredWindowAttributes(parent_hwnd, None, 0, LWA_ALPHA);
        let _ = dbg!(window_shadows::set_shadow(Handle(parent_hwnd), true));

        settings.background_color = 0x00000000;

        let result = (ori_func)(
            window_info,
            client,
            url,
            settings,
            extra_info,
            request_context,
        );

        hook_data.browser_window = Some(std::mem::transmute(window_info.window));

        // cef_sys::cef_register_scheme_handler_factory(
        //     cef::CefString::from("mwbncm").as_raw(),
        //     cef::CefString::from("api").as_raw(),
        //     factory,
        // );

        debug!("浏览器窗口初始化完成");
        result
    }

    #[instrument]
    unsafe extern "stdcall" fn hook_get_keyboard_handler(
        this: *mut _cef_client_t,
    ) -> *mut _cef_keyboard_handler_t {
        let keyboard_handler = get_cef_hook_data().origin_cef_get_keyboard_handler.unwrap()(this)
            .as_mut()
            .unwrap();

        get_cef_hook_data().origin_cef_on_key_event = keyboard_handler.on_key_event;
        keyboard_handler.on_key_event = Some(hook_on_key_event);

        keyboard_handler as _
    }

    #[instrument]
    unsafe extern "stdcall" fn hook_on_key_event(
        this: *mut _cef_keyboard_handler_t,
        browser: *mut _cef_browser_t,
        event: *const _cef_key_event_t,
        os_event: *mut MSG,
    ) -> c_int {
        let this = this.as_mut().unwrap();
        let browser = browser.as_mut().unwrap();
        let event = event.as_ref().unwrap();
        let os_event = os_event.as_mut().unwrap();
        let client = get_cef_hook_data().client.unwrap();

        if event.type_ == cef_sys::cef_key_event_type_t_KEYEVENT_KEYUP
            && event.windows_key_code == 123
        {
            // F12 Open DevTools
            let host = browser.get_host.unwrap()(browser).as_mut().unwrap();
            if host.has_dev_tools.unwrap()(host) == 0 && browser.is_popup.unwrap()(browser) == 0 {
                let mut win_info = cef_window_info_t {
                    style: (WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_CLIPSIBLINGS | WS_VISIBLE).0,
                    x: CW_USEDEFAULT,
                    y: CW_USEDEFAULT,
                    width: CW_USEDEFAULT,
                    height: CW_USEDEFAULT,
                    ..std::mem::zeroed()
                };

                let settings = cef_browser_settings_t {
                    size: std::mem::size_of::<cef_browser_settings_t>(),
                    ..std::mem::zeroed()
                };

                let point = cef_point_t {
                    ..std::mem::zeroed()
                };

                let title = "MWBNCM DevTools".encode_utf16().collect::<Vec<_>>();
                cef_string_utf16_set(
                    title.as_ptr(),
                    title.len(),
                    &mut win_info.window_name as _,
                    1,
                );

                host.show_dev_tools.unwrap()(host, &win_info, client, &settings, &point);
            } else {
                host.close_dev_tools.unwrap()(host);
            }
        }

        get_cef_hook_data().origin_cef_on_key_event.unwrap()(
            this as _,
            browser as _,
            event as _,
            os_event as _,
        )
    }

    #[instrument]
    unsafe extern "stdcall" fn hook_cef_load_handler(
        this: *mut _cef_client_t,
    ) -> *mut _cef_load_handler_t {
        let load_handler = get_cef_hook_data().origin_cef_load_handler.unwrap()(this)
            .as_mut()
            .unwrap();

        get_cef_hook_data().origin_cef_on_load_start = load_handler.on_load_start;
        load_handler.on_load_start = Some(hook_cef_on_load_start);

        load_handler as _
    }

    // #[instrument]
    unsafe extern "stdcall" fn hook_cef_on_load_start(
        this: *mut _cef_load_handler_t,
        browser: *mut _cef_browser_t,
        _frame: *mut _cef_frame_t,
        transition_type: cef_transition_type_t,
    ) {
        let browser = browser.as_mut().unwrap();
        let frame = _frame.as_mut().unwrap();

        let url = cef::CefString::from_raw(frame.get_url.unwrap()(frame) as _).to_string();

        debug!("正在加载页面 {}", url);

        if url.starts_with("orpheus://orpheus/pub/app.html") {
            let framework_js = include_str!("../resources/framework.js");
            let framework_js = cef::CefString::from(format!(
                "\
                const BETTERNCM_API_KEY=\"\";\
                const BETTERNCM_API_PATH=\"\";\
                const BETTERNCM_FILES_PATH=\"\";\
                {}",
                framework_js
            ));
            let framework_js_url = cef::CefString::from("betterncm://betterncm/framework.js");
            dbg!(frame.execute_java_script.unwrap()(
                frame,
                framework_js.to_raw(),
                framework_js_url.to_raw(),
                0,
            ));

            for plugin in crate::plugins::LOADED_PLUGINS.iter() {
                if !plugin.startup_script.is_empty() {
                    let startup_script = cef::CefString::from(plugin.startup_script.to_owned());
                    let startup_script_url = cef::CefString::from(format!(
                        "betterncm://betterncm/plugins/{}/startup_script.js",
                        urlencoding::encode(&plugin.name)
                    ));
                    dbg!(frame.execute_java_script.unwrap()(
                        frame,
                        startup_script.to_raw(),
                        startup_script_url.to_raw(),
                        0,
                    ));
                    info!(
                        "已执行来自 {} 的启动脚本文件 startup_script.js",
                        plugin.name
                    );
                }
            }
        }

        let host = browser.get_host.unwrap()(browser).as_mut().unwrap();
        let hwnd: windows::Win32::Foundation::HWND =
            std::mem::transmute(host.get_window_handle.unwrap()(host));

        SetLayeredWindowAttributes(
            hwnd,
            None,
            0,
            windows::Win32::UI::WindowsAndMessaging::LAYERED_WINDOW_ATTRIBUTES_FLAGS(0),
        );

        get_cef_hook_data().origin_cef_on_load_start.unwrap()(this, browser, frame, transition_type)
    }
}
