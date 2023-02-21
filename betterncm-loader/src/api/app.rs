use std::{collections::HashMap, io::Write};

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
    crate::exception::restart_self();
}

#[betterncm_native_api(name = "app.reloadPlugins")]
#[instrument]
pub fn restart_plugins() {
    crate::exception::restart_self();
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
        let data = std::fs::read_to_string("./config.json").unwrap_or_default();
        let mut data = serde_json::from_str::<HashMap<String, String>>(&data).unwrap_or_default();
        data.insert(key, value);
        let data = serde_json::to_string_pretty(&data).unwrap_or_default();
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .open("./config.json")?;
        let _ = file.write_all(data.as_bytes());
        let _ = file.sync_all();
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
        let data = std::fs::read_to_string("./config.json").unwrap_or_default();
        if let Ok(mut data) = serde_json::from_str::<HashMap<String, String>>(&data) {
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
    let exe = exe
        .parent()
        .unwrap()
        .to_string_lossy()
        .to_string()
        .replace('\\', "/");
    Ok(exe)
}

#[betterncm_native_api(name = "app.showConsole")]
#[instrument]
pub fn show_console(show: bool) {
    unsafe {
        ShowWindow(GetConsoleWindow(), SW_SHOW);
    }
}

#[betterncm_native_api(name = "app.exec")]
#[instrument]
pub fn exec(cmd: String, elevate: bool, show_window: bool) {
    crate::exception::exec(&cmd, elevate, show_window);
}
