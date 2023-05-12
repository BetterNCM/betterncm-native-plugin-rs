mod api;
mod audio;
mod cef_hooks;
mod exception;
mod http_api;
mod plugin_native_apis;
mod plugins;
mod proxy_functions;
mod scheme_hijack;
mod utils;

use once_cell::sync::Lazy;
use path_absolutize::Absolutize;
use tracing::*;
use windows::Win32::{
    Foundation::*,
    System::{
        Console::SetConsoleCP,
        LibraryLoader::{DisableThreadLibraryCalls, LoadLibraryW},
    },
    UI::WindowsAndMessaging::{MessageBoxW, MB_OK},
};
use windows::{
    core::*,
    Win32::System::{
        Console::AllocConsole,
        SystemServices::{DLL_PROCESS_ATTACH, DLL_PROCESS_DETACH},
    },
};

const BETTERNCM_VERSION: &str = "1.2.0";

pub fn debug() {}

pub fn open_console() {
    unsafe {
        AllocConsole();
        SetConsoleCP(936);
        // SetConsoleCP(65001);
    }

    let _ = ansi_term::enable_ansi_support();
    use tracing_subscriber::prelude::*;
    let _ = tracing::subscriber::set_global_default(
        tracing_subscriber::registry()
            .with(tracing_subscriber::filter::filter_fn(|x| {
                x.module_path().unwrap_or_default().starts_with("betterncm")
            }))
            .with(
                tracing_subscriber::fmt::layer()
                    .with_level(true)
                    // .pretty()
                    .with_thread_names(true),
            ),
    );
}

pub fn clean_trash() {
    if let Some(home_dir) = dirs::home_dir() {
        let app_data_remove_files = ["web.log", "cloudmusic.elog"];
        let app_data_remove_dirs = [
            "ad",
            "update",
            "Log",
            "NIM",
            "NEIM_SYS",
            "nrtc",
            "Temp",
            "Cache",
            "webapp91/Cache",
            "webapp91/Code Cache",
        ];
        let ncm_path = home_dir.join("AppData/Local/NetEase/CloudMusic");
        for file_path in app_data_remove_files {
            let p = ncm_path.join(file_path);
            let _ = std::fs::remove_file(p);
        }
        for dir_path in app_data_remove_dirs {
            let p = ncm_path.join(dir_path);
            let _ = std::fs::remove_dir_all(p);
        }
        // Crash Data
        if let Ok(files) = std::fs::read_dir(&ncm_path) {
            for entry in files.flatten() {
                if entry
                    .file_name()
                    .to_string_lossy()
                    .starts_with("crash_data_")
                {
                    let _ = std::fs::remove_file(entry.path());
                }
            }
        }
        // TMP Files
        if let Ok(files) = std::fs::read_dir(ncm_path.join("webapp91")) {
            for entry in files.flatten() {
                let file_name = entry.file_name();
                let file_name = file_name.to_string_lossy();
                if file_name.ends_with(".TMP") || file_name.ends_with(".log") {
                    let _ = std::fs::remove_file(entry.path());
                }
            }
        }
    }
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

            let orig_bncm_dll_path = std::path::Path::new("BetterNCMII.dll");
            let orig_bncm_mark_path = std::path::Path::new("Load_BetterNCMII_In_MRBNCM");
            if orig_bncm_dll_path.is_file() && orig_bncm_mark_path.is_file() {
                // 加载 BetterNCM 而不是 MRBNCM
                warn!("已检测到 BetterNCMII.dll，将加载原版 BetterNCM！");

                if let Ok(orig_bncm_dll_path) = orig_bncm_dll_path.absolutize() {
                    unsafe {
                        proxy_functions::init_proxy_functions(dll_module)
                            .expect("重定向函数失败！");
                        let orig_bncm_dll_path = orig_bncm_dll_path.to_string_lossy().to_string();
                        let _ = LoadLibraryW(&HSTRING::from(orig_bncm_dll_path));
                    }
                }

                return true.into();
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
            if _reserved.is_null() {
                clean_trash();
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
        clean_trash();

        info!("当前数据目录：{:?}", std::env::current_dir());
        plugins::unzip_plugins();
        audio::init_audio_capture();
        http_api::init_http_server()?;
    }

    info!("正在加载原生插件");
    plugins::load_native_plugins();

    if *PROCESS_TYPE == ProcessType::Renderer {
        #[cfg(debug_assertions)]
        open_console();
        audio::init_audio_capture();
    }

    unsafe {
        proxy_functions::init_proxy_functions(dll_module)?;
        exception::init_exception();
        cef_hooks::init_cef_hooks()?;

        info!("MWBNCM 初始化成功！");
        info!("父进程 ID: {}", *PARENT_PID);

        DisableThreadLibraryCalls(dll_module);
    }
    Ok(())
}
