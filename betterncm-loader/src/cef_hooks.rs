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

    let d3d11_dll = LoadLibraryW(w!("d3d11.dll")).context("无法加载 D3D11 动态链接库！")?;

    // D2D1CreateFactory
    d2d1_hook::D3D11_CREATE_DEVICE = hook_dll_function(
        d3d11_dll,
        s!("D3D11CreateDevice"),
        d2d1_hook::hook_d3d11_create_device as _,
    )?;

    Ok(())
}

mod d2d1_hook {
    use detour::RawDetour;
    use tracing::*;
    use windows::{w, Win32::UI::WindowsAndMessaging::FindWindowW};
    pub static mut D3D11_CREATE_DEVICE: Option<RawDetour> = None;

    pub unsafe extern "system" fn hook_d3d11_create_device(
        padapter: windows_sys::Win32::Graphics::Dxgi::IDXGIAdapter,
        drivertype: windows_sys::Win32::Graphics::Direct3D::D3D_DRIVER_TYPE,
        software: windows_sys::Win32::Foundation::HINSTANCE,
        flags: windows_sys::Win32::Graphics::Direct3D11::D3D11_CREATE_DEVICE_FLAG,
        _pfeaturelevels: *const windows_sys::Win32::Graphics::Direct3D::D3D_FEATURE_LEVEL,
        _featurelevels: u32,
        sdkversion: u32,
        ppdevice: *mut windows_sys::Win32::Graphics::Direct3D11::ID3D11Device,
        pfeaturelevel: *mut windows_sys::Win32::Graphics::Direct3D::D3D_FEATURE_LEVEL,
        ppimmediatecontext: *mut windows_sys::Win32::Graphics::Direct3D11::ID3D11DeviceContext,
    ) -> ::windows_sys::core::HRESULT {
        use windows_sys::Win32::Graphics::Dxgi::*;
        let ncm_hwnd = FindWindowW(w!("OrpheusBrowserHost"), None);

        let scd = DXGI_SWAP_CHAIN_DESC {
            BufferCount: 1,
            BufferDesc: Common::DXGI_MODE_DESC {
                Format: Common::DXGI_FORMAT_R8G8B8A8_UNORM,
                ..std::mem::zeroed()
            },
            BufferUsage: DXGI_USAGE_RENDER_TARGET_OUTPUT,
            OutputWindow: ncm_hwnd.0,
            SampleDesc: Common::DXGI_SAMPLE_DESC {
                Count: 1,
                ..std::mem::zeroed()
            },
            Windowed: 1,
            ..std::mem::zeroed()
        };

        let result = windows_sys::Win32::Graphics::Direct3D11::D3D11CreateDeviceAndSwapChain(
            dbg!(padapter),
            dbg!(drivertype),
            dbg!(software),
            dbg!(flags),
            std::ptr::null(),
            0,
            dbg!(sdkversion),
            &scd,
            std::ptr::null_mut(),
            dbg!(ppdevice),
            dbg!(pfeaturelevel),
            dbg!(ppimmediatecontext),
        );

        debug!("创建了 D3D 设备上下文");

        result
    }
}

mod hook {
    use std::{collections::HashMap, ffi::*, io::Write};

    use cef_sys::*;
    use detour::RawDetour;
    use once_cell::sync::Lazy;
    use tracing::*;
    use windows::Win32::{
        Graphics::Dwm::{DwmSetWindowAttribute, DWMWA_WINDOW_CORNER_PREFERENCE, DWMWCP_ROUND},
        UI::WindowsAndMessaging::{
            GetClassNameW, SetLayeredWindowAttributes, SetWindowLongW, CW_USEDEFAULT, GWL_EXSTYLE,
            LWA_ALPHA, WS_CLIPCHILDREN, WS_CLIPSIBLINGS, WS_EX_COMPOSITED, WS_OVERLAPPEDWINDOW,
            WS_VISIBLE,
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
        let ctx = ori_func().as_mut().unwrap();

        let frame = ctx.get_frame.unwrap()(ctx).as_mut().unwrap();
        if frame.is_main.unwrap()(frame) != 0 {
            let global_this = cef::CefV8Value::from_raw(ctx.get_global.unwrap()(ctx));

            crate::api::setup_native_api(global_this);
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
        settings: *const cef_sys::cef_settings_t,
        application: *mut cef_sys::cef_app_t,
        windows_sandbox_info: *mut c_void,
    ) -> ::core::ffi::c_int {
        debug!("正在初始化 CEF！");
        let ori_func: unsafe extern "C" fn(
            args: *const cef_sys::cef_main_args_t,
            settings: *const cef_sys::cef_settings_t,
            application: *mut cef_sys::cef_app_t,
            windows_sandbox_info: *mut c_void,
        ) -> ::core::ffi::c_int =
            std::mem::transmute(CEF_INITIALIZE.as_ref().unwrap().trampoline());
        let application = application.as_mut().unwrap();
        let _hook_data = get_cef_hook_data();

        ori_func(args, settings, application, windows_sandbox_info)
    }

    pub static mut CEF_CREATE_BROWSER_SYNC: Option<RawDetour> = None;
    #[instrument(skip_all)]
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
        let mut cls_name = [0u16; 64];

        let len = GetClassNameW(parent_hwnd, &mut cls_name);

        dbg!(String::from_utf16_lossy(&cls_name[..len as _]));

        dbg!(std::mem::transmute::<_, *const ()>(
            client.get_render_handler
        ));
        dbg!(&window_info);
        dbg!(&settings);

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

        // if !window_info.window.is_null() {
        //     window_info.ex_style |= WS_EX_LAYERED;
        //     window_info.windowless_rendering_enabled = 1;
        // }

        settings.background_color = 0x00000000;
        // client get_request_handler on_render_view_ready

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

    #[instrument]
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
