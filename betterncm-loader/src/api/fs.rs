use std::path::{Path, PathBuf};

use anyhow::*;
use betterncm_macro::*;
use cef::*;
use notify::Watcher;
use path_absolutize::Absolutize;
use std::time::Duration;
use tracing::*;

#[betterncm_native_api(name = "fs.readDir")]
#[instrument]
pub(super) fn read_dir(
    this: CefV8Value,
    folder_path: String,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, || {
        let read = std::fs::read_dir(folder_path)?;
        let mut result = Vec::with_capacity(64);
        for entry in read.flatten() {
            result.push(
                entry
                    .path()
                    .absolutize()?
                    .to_string_lossy()
                    .to_string()
                    .replace('\\', "/"),
            );
        }
        Ok(result)
    })
}

#[betterncm_native_api(name = "fs.readFileText")]
#[instrument]
pub(super) fn read_file_text(
    this: CefV8Value,
    file_path: String,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, || {
        Ok(std::fs::read_to_string(file_path).unwrap_or_default())
    })
}

#[betterncm_native_api(name = "fs.readFile")]
#[instrument]
pub(super) fn read_file(
    this: CefV8Value,
    file_path: String,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, || {
        Ok(std::fs::read(file_path).unwrap_or_default())
    })
}

#[betterncm_native_api(name = "fs.rename")]
#[instrument]
pub(super) fn rename(
    this: CefV8Value,
    file_path: String,
    to_path: String,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, || {
        Ok(std::fs::rename(file_path, to_path)?)
    })
}

#[betterncm_native_api(name = "fs.exists")]
#[instrument]
pub(super) fn exists(this: CefV8Value, file_path: String) -> Result<bool> {
    Ok(std::path::Path::new(&file_path).exists())
}

#[betterncm_native_api(name = "fs.writeFile")]
#[instrument]
pub(super) fn write_file(
    this: CefV8Value,
    file_path: String,
    data: Vec<u8>,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, || {
        if let Some(dir_path) = PathBuf::from(&file_path).parent() {
            let _ = std::fs::create_dir_all(dir_path);
        }
        Ok(std::fs::write(file_path, data)?)
    })
}

#[betterncm_native_api(name = "fs.writeFileText")]
#[instrument]
pub(super) fn write_file_text(
    this: CefV8Value,
    file_path: String,
    data: String,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, || {
        if let Some(dir_path) = PathBuf::from(&file_path).parent() {
            let _ = std::fs::create_dir_all(dir_path);
        }
        Ok(std::fs::write(file_path, data)?)
    })
}

#[betterncm_native_api(name = "fs.remove")]
#[instrument]
pub(super) fn remove(
    this: CefV8Value,
    file_or_dir_path: String,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, move || {
        let _ = std::fs::remove_dir_all(&file_or_dir_path);
        let _ = std::fs::remove_file(&file_or_dir_path);
        Ok(())
    })
}

#[betterncm_native_api(name = "fs.mkdir")]
#[instrument]
pub(super) fn mkdir(
    this: CefV8Value,
    dir_path: String,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, || {
        Ok(std::fs::create_dir_all(dir_path)?)
    })
}

#[betterncm_native_api(name = "fs.watchDirectory")]
#[instrument]
pub(super) fn watch_directory(
    this: CefV8Value,
    dir_path: String,
    callback: CefV8Function,
) -> anyhow::Result<()> {
    let ctx = CefV8Context::current();
    let dir_path = std::sync::Arc::new(dir_path);
    let watch_path = dir_path.clone();
    let this = unsafe { this.as_raw() as usize };
    let callback = unsafe { callback.as_raw() as usize };

    let (sx, rx) = std::sync::mpsc::channel();

    let mut watcher = notify::recommended_watcher(sx)?;

    watcher.configure(
        notify::Config::default()
            .with_compare_contents(true)
            .with_poll_interval(Duration::from_secs(1)),
    )?;

    watcher.watch(
        Path::new(watch_path.as_ref()),
        notify::RecursiveMode::NonRecursive,
    )?;

    std::thread::spawn(move || {
        let watcher = watcher;
        while let Result::Ok(Result::Ok(event)) = rx.recv() {
            let paths = event.paths;
            let dir_path = dir_path.clone();
            ctx.post_task(move || {
                let this = unsafe { CefV8Value::from_raw(this as *mut _) };
                let callback = unsafe { CefV8Value::from_raw(callback as *mut _) };
                for path in paths {
                    let dir_path = dir_path.as_ref().to_owned();
                    callback.execute_function(
                        Some(this.to_owned()),
                        &[
                            dir_path.try_into().unwrap(),
                            path.file_name()
                                .unwrap_or_default()
                                .to_string_lossy()
                                .to_string()
                                .try_into()
                                .unwrap(),
                        ],
                    );
                }
            });
        }
        drop(watcher);
    });

    Ok(())
}
