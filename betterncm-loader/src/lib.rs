mod api;
mod audio;
mod cef_hooks;
mod exception;
mod http_api;
mod plugins;
mod proxy_functions;
mod scheme_hijack;
mod utils;

use once_cell::sync::Lazy;
use tracing::*;
use windows::Win32::{
    Foundation::*,
    System::{Console::SetConsoleCP, LibraryLoader::DisableThreadLibraryCalls},
    UI::WindowsAndMessaging::{MessageBoxW, MB_OK},
};
use windows::{
    core::*,
    Win32::System::{
        Console::AllocConsole,
        SystemServices::{DLL_PROCESS_ATTACH, DLL_PROCESS_DETACH},
    },
};

pub fn debug() {}

pub fn open_console() {
    unsafe {
        AllocConsole();
        SetConsoleCP(936);
        // SetConsoleCP(65001);
    }

    let _ = ansi_term::enable_ansi_support();
    let _ = tracing::subscriber::set_global_default(
        tracing_subscriber::fmt()
            .with_max_level(Level::DEBUG)
            .pretty()
            .with_thread_names(true)
            .finish(),
    );
}

#[no_mangle]
extern "system" fn DllMain(
    dll_module: HINSTANCE,
    reason: u32,
    _reserved: *mut std::ffi::c_void,
) -> BOOL {
    match reason {
        DLL_PROCESS_ATTACH => {
            if let Ok(path) = std::env::var("BETTERNCM_PATH") {
                let _ = std::env::set_current_dir(path);
            } else {
                #[cfg(target_os = "windows")]
                {
                    let _ = std::env::set_current_dir("C:/betterncm");
                }
                #[cfg(not(target_os = "windows"))]
                if let Some(path) = dirs::home_dir() {
                    let _ = std::env::set_current_dir(path.join(".betterncm"));
                }
            }

            if let Err(e) = initialize(dll_module) {
                error!("MWBNCM DLL Hook 初始化失败： {:?}", e.root_cause());
                let e = HSTRING::from(format!("{e:?}"));
                unsafe {
                    MessageBoxW(None, &e, w!("MWBNCM DLL Hook 初始化失败"), MB_OK);
                }
                false.into()
            } else {
                true.into()
            }
        }
        DLL_PROCESS_DETACH => {
            info!("正在结束");
            if _reserved.is_null() {
                if let Some(home_dir) = dirs::home_dir() {
                    let web_log_path = home_dir.join("AppData/Local/NetEase/CloudMusic/web.log");
                    let _ = std::fs::remove_file(web_log_path);
                }
            }

            true.into()
        }
        _ => true.into(),
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ProcessType {
    Main,
    Renderer,
    GPUProcess,
    Utility,
}

pub static PROCESS_TYPE: Lazy<ProcessType> = Lazy::new(|| {
    let args = std::env::args().collect::<Vec<_>>();
    if args.contains(&"--type=renderer".into()) {
        ProcessType::Renderer
    } else if args.contains(&"--type=gpu-process".into()) {
        ProcessType::GPUProcess
    } else if args.contains(&"--type=utility".into()) {
        ProcessType::Utility
    } else {
        ProcessType::Main
    }
});

pub static PARENT_PID: Lazy<u32> = Lazy::new(utils::get_parent_pid);

fn initialize(dll_module: HINSTANCE) -> anyhow::Result<()> {
    // 获取 父进程 PID
    let _ = *PARENT_PID;
    if *PROCESS_TYPE == ProcessType::Main {
        #[cfg(debug_assertions)]
        open_console();

        info!("MWBNCM 正在启动！");

        info!("当前数据目录：{:?}", std::env::current_dir());
        plugins::unzip_plugins();
        audio::init_audio_capture();
    }

    if *PROCESS_TYPE == ProcessType::Renderer {
        #[cfg(debug_assertions)]
        open_console();
        audio::init_audio_capture();
    }

    unsafe {
        proxy_functions::init_proxy_functions(dll_module)?;
        exception::init_exception();
        cef_hooks::init_cef_hooks()?;

        http_api::init_http_server()?;

        info!("MWBNCM 初始化成功！");
        info!("父进程 ID: {}", *PARENT_PID);

        DisableThreadLibraryCalls(dll_module);
    }
    Ok(())
}
