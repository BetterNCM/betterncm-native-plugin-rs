use std::{collections::HashMap, os::windows::process::CommandExt};

use betterncm_macro::*;
use cef::*;
use tracing::*;
use windows::Win32::{
    System::Console::GetConsoleWindow,
    UI::WindowsAndMessaging::{ShowWindow, SW_SHOW},
};

#[betterncm_native_api(name = "app.restart")]
#[instrument]
pub fn restart() {
    // TODO: 重启
    let _ = dbg!(std::process::Command::new("cmd")
        .arg("/K")
        .arg("taskkill /F /IM cloudmusic.exe")
        .env(
            "RUST_BACKTRACE",
            std::env::var("RUST_BACKTRACE").unwrap_or("".into()),
        )
        .creation_flags(0x08000000 | 0x00000008 | 0x00000200)
        .spawn());
}

#[betterncm_native_api(name = "app.reloadIgnoreCache")]
#[instrument]
pub fn reload_ignore_cache() {
    // TODO
}

#[betterncm_native_api(name = "app.version")]
#[instrument]
pub fn version() -> anyhow::Result<String> {
    Ok("1.0.2".into())
}

#[betterncm_native_api(name = "app.writeConfig")]
#[instrument]
pub fn write_config(
    this: CefV8Value,
    key: String,
    value: String,
    resolve: CefV8Function,
    reject: CefV8Function,
) {
    super::threaded_promise(this, resolve, reject, move || {
        let data = std::fs::read_to_string("./config.toml").unwrap_or_default();
        let mut data = toml::from_str::<HashMap<String, String>>(&data).unwrap_or_default();
        data.insert(key, value);
        let data = toml::to_string_pretty(&data).unwrap_or_default();
        let _ = std::fs::write("./config.toml", data);
        Ok(())
    });
}

#[betterncm_native_api(name = "app.readConfig")]
#[instrument]
pub fn read_config(
    this: CefV8Value,
    key: String,
    default_value: String,
    resolve: CefV8Function,
    reject: CefV8Function,
) {
    super::threaded_promise(this, resolve, reject, move || {
        let data = std::fs::read_to_string("./config.toml").unwrap_or_default();
        if let Ok(mut data) = toml::from_str::<HashMap<String, String>>(&data) {
            if let Some(value) = data.remove(&key) {
                return Ok(value);
            }
        }
        Ok(default_value)
    });
}

#[betterncm_native_api(name = "app.getNCMPath")]
#[instrument]
pub fn get_ncm_path() -> anyhow::Result<String> {
    let exe = std::env::current_exe().unwrap();
    let exe = exe.parent().unwrap().to_string_lossy().to_string();
    Ok(exe)
}

#[betterncm_native_api(name = "app.showConsole")]
#[instrument]
pub fn show_console(show: bool) {
    unsafe {
        ShowWindow(GetConsoleWindow(), SW_SHOW);
    }
}
