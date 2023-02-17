use windows::{
    core::HSTRING,
    w,
    Win32::{
        System::Diagnostics::Debug::{SetUnhandledExceptionFilter, EXCEPTION_POINTERS},
        UI::WindowsAndMessaging::{
            FindWindowW, MessageBoxW, IDABORT, MB_ABORTRETRYIGNORE, MB_ICONERROR,
        },
    },
};

unsafe extern "system" fn unhandled_exception_filter(info: *const EXCEPTION_POINTERS) -> i32 {
    let info = info.as_ref().unwrap();

    let exc = info.ExceptionRecord.as_ref().unwrap();

    let ncm_hwnd = FindWindowW(w!("OrpheusBrowserHost"), None);
    let exc_code = exc.ExceptionCode.0 as u32;

    let text = format!(
        "\
        错误信息：\n\
        {exc:#?}"
    );

    println!("发生严重错误：");
    println!("{text}");

    if exc_code == 0xC0000005 || exc_code == 0xE0000008 || exc_code == 0x80000003 {
        if ncm_hwnd.0 != 0 {
            // TODO: 重启网易云
        }
        std::process::abort();
    }

    let text = HSTRING::from(text);

    let result = MessageBoxW(
        None,
        &text,
        w!("很抱歉，网易云音乐崩溃了！"),
        MB_ICONERROR | MB_ABORTRETRYIGNORE,
    );

    if result == IDABORT {
        std::process::abort();
    }

    1
}

pub unsafe fn init_exception() {
    SetUnhandledExceptionFilter(Some(unhandled_exception_filter));
}
