use anyhow::Context;
use detour::{RawDetour};
use windows::{
    core::*,
    s,
    Win32::{
        Foundation::*,
        System::LibraryLoader::{GetProcAddress, LoadLibraryW},
    },
};

pub unsafe fn init_cef_hooks() -> anyhow::Result<()> {
    let cef_dll = LoadLibraryW(w!("libcef.dll")).context("无法加载 LibCEF 动态链接库！")?;

    unsafe fn hook_cef_function(
        cef_dll: HINSTANCE,
        name: PCSTR,
        hook_func: *const (),
    ) -> anyhow::Result<Option<RawDetour>> {
        let target = GetProcAddress(cef_dll, name).context("")? as *const ();

        println!(
            "正在 Hook {} 从 {:?} 到 {:?}",
            name.to_string().unwrap_or_default(),
            target,
            hook_func
        );

        let hook = RawDetour::new(target, hook_func)?;

        hook.enable()?;

        Ok(Some(hook))
    }

    hook::CEF_INITIALIZE = hook_cef_function(
        cef_dll,
        s!("cef_browser_host_create_browser_sync"),
        hook::cef_browser_host_create_browser_sync as _,
    )?;

    println!("CEF Hook 已初始化完毕！");

    Ok(())
}

mod hook {
    use cef_sys::*;
    use detour::RawDetour;

    pub static mut CEF_INITIALIZE: Option<RawDetour> = None;
    pub unsafe extern "C" fn cef_browser_host_create_browser_sync(
        window_info: &mut cef_window_info_t,
        client: &mut _cef_client_t,
        url: &mut cef_string_t,
        settings: &mut _cef_browser_settings_t,
        extra_info: &mut _cef_dictionary_value_t,
        request_context: &mut _cef_request_context_t,
    ) -> *mut cef_browser_t {
        let ori_func: fn(
            window_info: *const cef_window_info_t,
            client: *mut _cef_client_t,
            url: *const cef_string_t,
            settings: *const _cef_browser_settings_t,
            extra_info: *mut _cef_dictionary_value_t,
            request_context: *mut _cef_request_context_t,
        ) -> *mut cef_browser_t =
            std::mem::transmute(CEF_INITIALIZE.as_ref().unwrap().trampoline());

        println!("正在初始化浏览器窗口");

        (ori_func)(
            window_info,
            client,
            url,
            settings,
            extra_info,
            request_context,
        )
    }
}
