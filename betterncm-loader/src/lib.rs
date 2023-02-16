mod cef_hooks;
mod proxy_functions;

use windows::Win32::{
    Foundation::*,
    UI::WindowsAndMessaging::{MessageBoxW, MB_OK},
};
use windows::{
    core::*,
    Win32::System::{Console::AllocConsole, SystemServices::DLL_PROCESS_ATTACH},
};

#[no_mangle]
extern "system" fn DllMain(
    dll_module: HINSTANCE,
    reason: u32,
    _reserved: *mut std::ffi::c_void,
) -> BOOL {
    match reason {
        DLL_PROCESS_ATTACH => {
            if let Err(e) = initialize(dll_module) {
                eprintln!("MWBNCM DLL Hook 初始化失败： {:?}", e.root_cause());
                let e = HSTRING::from(format!("{e:?}"));
                unsafe {
                    MessageBoxW(None, &e, w!("MWBNCM DLL Hook 初始化失败"), MB_OK);
                }
                false.into()
            } else {
                true.into()
            }
        }
        _ => true.into(),
    }
}

fn initialize(dll_module: HINSTANCE) -> anyhow::Result<()> {
    unsafe {
        proxy_functions::init_proxy_functions(dll_module)?;

        #[derive(Debug, Clone, Copy, PartialEq)]
        enum ProcessType {
            Main,
            Renderer,
            GPUProcess,
            Utility,
        }

        let process_type = {
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
        };
        
        cef_hooks::init_cef_hooks()?;

        if process_type == ProcessType::Main {
            AllocConsole();
            println!("MWBNCM 正在启动！");
            println!("正在重解压插件！");
        } else if process_type == ProcessType::Renderer {
            println!("MWBNCM 初始化成功！");
            AllocConsole();
        }
    }
    Ok(())
}