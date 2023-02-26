use tracing::*;
use windows::{
    core::*,
    w,
    Win32::{
        Foundation::CloseHandle,
        System::{
            Diagnostics::{
                Debug::{SetUnhandledExceptionFilter, EXCEPTION_POINTERS},
                ToolHelp::{
                    CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W,
                    TH32CS_SNAPPROCESS,
                },
            },
            Threading::{
                CreateProcessW, PROCESS_CREATION_FLAGS, PROCESS_INFORMATION, STARTUPINFOW,
            },
        },
        UI::{
            Shell::{CommandLineToArgvW, ShellExecuteExW, SHELLEXECUTEINFOW},
            WindowsAndMessaging::{
                FindWindowW, MessageBoxW, IDABORT, MB_ABORTRETRYIGNORE, MB_ICONERROR, SW_HIDE,
                SW_SHOW,
            },
        },
    },
};
use windows_sys::Win32::System::Memory::LocalFree;

pub fn kill_self() {
    unsafe {
        if let Ok(h_snapshot) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
            let mut pid_list = Vec::with_capacity(16);
            let mut process_entry = PROCESSENTRY32W {
                dwSize: std::mem::size_of::<PROCESSENTRY32W>() as _,
                ..Default::default()
            };

            if Process32FirstW(h_snapshot, &mut process_entry).as_bool() {
                loop {
                    let exe_len = process_entry
                        .szExeFile
                        .iter()
                        .enumerate()
                        .find(|x| *x.1 == 0)
                        .map(|x| x.0)
                        .unwrap_or(process_entry.szExeFile.len());
                    let exe_file = String::from_utf16_lossy(&process_entry.szExeFile[..exe_len]);
                    if &exe_file == "cloudmusic.exe" {
                        pid_list.push(process_entry.th32ProcessID);
                    }
                    if !Process32NextW(h_snapshot, &mut process_entry).as_bool() {
                        break;
                    }
                }
            }

            CloseHandle(h_snapshot);

            let mut cmd = "cmd /c echo".to_string();

            for pid in pid_list {
                cmd += &format!(" & taskkill /f /pid {pid}");
            }

            exec(dbg!(&cmd), false, false);
        }
    }
}

pub fn exec(cmd: &str, elevate: bool, show_window: bool) {
    unsafe {
        let cmd = HSTRING::from(cmd);
        let mut argn = 0;
        let p_args = CommandLineToArgvW(PCWSTR(cmd.as_ptr()), &mut argn);

        if argn > 0 {
            let p_args = std::slice::from_raw_parts(std::mem::transmute(p_args), argn as _);
            let mut info = SHELLEXECUTEINFOW {
                cbSize: std::mem::size_of::<SHELLEXECUTEINFOW>() as _,
                lpFile: p_args[0],
                lpVerb: if elevate { w!("runas") } else { w!("open") },
                ..Default::default()
            };

            if argn > 1 {
                let mut param = String::with_capacity(cmd.len());
                for arg in &p_args[1..] {
                    param += " ";
                    param += &arg.to_string().unwrap();
                }
                info.lpParameters = PCWSTR(cmd.as_ptr());
            }

            info.nShow = if show_window { SW_SHOW } else { SW_HIDE }.0 as _;

            ShellExecuteExW(&mut info);
        }

        LocalFree(p_args as _);
    }
}

pub fn restart_self() {
    if let Ok(exe_file) = std::env::current_exe() {
        let exe_file = exe_file.to_string_lossy().to_string();
        let exe_file = HSTRING::from(exe_file);
        let mut proc_info = PROCESS_INFORMATION::default();
        let info = STARTUPINFOW {
            cb: std::mem::size_of::<STARTUPINFOW>() as _,
            ..Default::default()
        };

        kill_self();
        unsafe {
            CreateProcessW(
                &exe_file,
                PWSTR::null(),
                None,
                None,
                None,
                PROCESS_CREATION_FLAGS(0),
                None,
                None,
                &info,
                &mut proc_info,
            );
        }
    }
}

unsafe extern "system" fn unhandled_exception_filter(info: *const EXCEPTION_POINTERS) -> i32 {
    let info = info.as_ref().unwrap();

    let exc = info.ExceptionRecord.as_ref().unwrap();

    let _ncm_hwnd = FindWindowW(w!("OrpheusBrowserHost"), None);
    let _exc_code = exc.ExceptionCode.0 as u32;

    let text = format!(
        "\
        错误信息：\n\
        {exc:#?}"
    );

    error!("发生严重错误：");
    error!("{}", text);

    if let Some(home_dir) = dirs::home_dir() {
        let web_log_path = home_dir.join("AppData/Local/NetEase/CloudMusic/web.log");
        let _ = std::fs::remove_file(web_log_path);
    }

    #[cfg(not(debug_assertions))]
    if _exc_code == 0xC0000005 || _exc_code == 0xE0000008 || _exc_code == 0x80000003 {
        if _ncm_hwnd.0 != 0 {
            // TODO: 重启网易云
        }
        crate::clean_trash();
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

    std::panic::set_hook(Box::new(|info| {
        let text = HSTRING::from(info.to_string());

        let result = MessageBoxW(
            None,
            &text,
            w!("很抱歉，网易云音乐崩溃了！"),
            MB_ICONERROR | MB_ABORTRETRYIGNORE,
        );

        if result == IDABORT {
            std::process::abort();
        }
    }));
}
