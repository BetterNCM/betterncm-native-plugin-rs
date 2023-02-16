// Hook 手法参考: https://www.pediy.com/kssd/pediy12/131397.html

use std::{ffi::OsString, os::windows::prelude::OsStringExt, path::PathBuf};

use anyhow::Context;
use windows::{
    core::*,
    Win32::{
        Foundation::*,
        System::{
            Diagnostics::Debug::WriteProcessMemory,
            LibraryLoader::{GetModuleFileNameW, GetProcAddress, LoadLibraryW},
            SystemInformation::GetSystemDirectoryW,
            Threading::GetCurrentProcess,
        },
    },
};

fn get_original_dll_path(dll_module: HINSTANCE) -> anyhow::Result<PathBuf> {
    unsafe {
        let len = GetSystemDirectoryW(None);
        let mut buf = vec![0u16; len as usize];

        anyhow::ensure!(
            GetSystemDirectoryW(Some(&mut buf)) == len - 1,
            "获取系统路径失败"
        );

        let path_buf = PathBuf::from(OsString::from_wide(&buf[..buf.len() - 1]));
        let mut name_buf = [0u16; 256];
        let name_len = GetModuleFileNameW(dll_module, &mut name_buf);
        let dll_path = PathBuf::from(OsString::from_wide(&name_buf[..name_len as usize]));
        let dll_name = dll_path.file_name().context("找不到当前 DLL 文件名！")?;
        let path_buf = path_buf.join(dll_name);

        Ok(path_buf)
    }
}

pub unsafe fn init_proxy_functions(current_dll: HINSTANCE) -> anyhow::Result<()> {
    let dll_path = get_original_dll_path(current_dll)?
        .to_string_lossy()
        .to_string();

    let original_dll = LoadLibraryW(&HSTRING::from(dll_path)).context("加载原始 DLL 失败！")?;
    let current_process = GetCurrentProcess();

    let hook_func = |func: unsafe extern "cdecl" fn(), name: PCSTR| -> anyhow::Result<()> {
        let from_addr = func as usize as isize;
        let to_addr = GetProcAddress(original_dll, name)
            .with_context(|| format!("无法找到 {:?} 中的原始函数 {:?}", original_dll, name))?
            as usize as isize;

        let jmp_cmd: u8 = 0xE9;

        WriteProcessMemory(
            current_process,
            from_addr as _,
            (&jmp_cmd) as *const _ as _,
            std::mem::size_of_val(&jmp_cmd) as _,
            None,
        )
        .ok()
        .with_context(|| {
            format!(
                "无法往 {:?} 中的目标函数 {:?} 写入 JMP 指令",
                original_dll, name
            )
        })?;

        let offset: isize = to_addr - from_addr - 5;
        WriteProcessMemory(
            current_process,
            (from_addr + 1) as _,
            (&offset) as *const _ as _,
            std::mem::size_of_val(&offset) as _,
            None,
        )
        .ok()
        .with_context(|| {
            format!(
                "无法往 {:?} 中的目标函数 {:?} 写入 JMP 位移地址",
                original_dll, name
            )
        })?;

        Ok(())
    };

    hook_func(hooked_funcs::AlphaBlend, s!("AlphaBlend"))?;
    hook_func(hooked_funcs::DllInitialize, s!("DllInitialize"))?;
    hook_func(hooked_funcs::GradientFill, s!("GradientFill"))?;
    hook_func(hooked_funcs::TransparentBlt, s!("TransparentBlt"))?;
    hook_func(hooked_funcs::vSetDdrawflag, s!("vSetDdrawflag"))?;

    Ok(())
}

#[allow(non_snake_case)]
mod hooked_funcs {
    #[no_mangle]
    pub unsafe extern "cdecl" fn AlphaBlend() {}
    #[no_mangle]
    pub unsafe extern "cdecl" fn DllInitialize() {}
    #[no_mangle]
    pub unsafe extern "cdecl" fn GradientFill() {}
    #[no_mangle]
    pub unsafe extern "cdecl" fn TransparentBlt() {}
    #[no_mangle]
    pub unsafe extern "cdecl" fn vSetDdrawflag() {}
}
