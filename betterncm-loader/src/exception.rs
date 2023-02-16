use windows::{
    core::HSTRING,
    w,
    Win32::{
        System::Diagnostics::Debug::{SetUnhandledExceptionFilter, EXCEPTION_POINTERS},
        UI::WindowsAndMessaging::{MessageBoxW, IDABORT, MB_ABORTRETRYIGNORE, MB_ICONERROR},
    },
};

unsafe extern "system" fn unhandled_exception_filter(info: *const EXCEPTION_POINTERS) -> i32 {
    let info = info.as_ref().unwrap();

    let exc = info.ExceptionRecord.as_ref().unwrap();

    let text = HSTRING::from(format!(
        "\
        错误信息：\n\
        {exc:#?}"
    ));

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
