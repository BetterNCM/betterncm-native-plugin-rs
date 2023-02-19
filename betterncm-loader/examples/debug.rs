use std::path::PathBuf;

use winreg::{enums::HKEY_LOCAL_MACHINE, RegKey};

pub fn get_ncm_install_path() -> anyhow::Result<String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let path: String = hklm
        .open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\cloudmusic.exe")?
        .get_value("")?;
    Ok(path)
}

fn main() -> anyhow::Result<()> {
    let _ = std::process::Command::new("taskkill")
        .arg("/T")
        .arg("/F")
        .arg("/IM")
        .arg("cloudmusic.exe")
        .env(
            "RUST_BACKTRACE",
            std::env::var("RUST_BACKTRACE").unwrap_or("".into()),
        )
        .status();

    let ncm_path = PathBuf::from(get_ncm_install_path()?);
    let msimg32_path = ncm_path.join("../msimg32.dll");
    let mut cur_dir = std::env::current_dir()?;

    loop {
        #[cfg(debug_assertions)]
        let loader_dll = cur_dir.join("target/i686-pc-windows-msvc/debug/betterncm_loader.dll");
        #[cfg(not(debug_assertions))]
        let loader_dll = cur_dir.join("target/i686-pc-windows-msvc/release/betterncm_loader.dll");

        if loader_dll.exists() {
            while std::fs::copy(&loader_dll, &msimg32_path).is_err() {
                std::thread::sleep(std::time::Duration::from_millis(100));
            }
            break;
        } else {
            cur_dir.pop();
        }
    }

    std::process::Command::new(ncm_path).spawn()?;
    Ok(())
}
