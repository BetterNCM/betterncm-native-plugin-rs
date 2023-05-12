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

// 有一个异步版本的 fs.readFileTextAsync 将在 JS 端实现
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

fn get_properties_for_path(file_or_dir_path: &Path) -> anyhow::Result<CefV8Value> {
    let properties = file_or_dir_path
        .metadata()
        .context("无法获取文件(夹)元数据")?;
    let mut result = CefV8Value::new_object();
    result.set_value_bykey(
        "name",
        file_or_dir_path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string()
            .try_into()?,
    );
    result.set_value_bykey(
        "path",
        file_or_dir_path
            .parent()
            .unwrap_or(file_or_dir_path)
            .to_string_lossy()
            .to_string()
            .try_into()?,
    );
    result.set_value_bykey("size", properties.len().try_into()?);
    result.set_value_bykey("type", "unknown".try_into()?);
    if properties.is_dir() {
        result.set_value_bykey("type", "directory".try_into()?);
    } else if properties.is_file() {
        result.set_value_bykey("type", "file".try_into()?);
    } else if properties.is_symlink() {
        result.set_value_bykey("type", "symlink".try_into()?);
    }
    result.set_value_bykey(
        "extension",
        file_or_dir_path
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string()
            .try_into()?,
    );
    result.set_value_bykey(
        "extension",
        properties
            .modified()?
            .duration_since(std::time::UNIX_EPOCH)?
            .as_millis()
            .try_into()?,
    );
    #[cfg(windows)]
    unsafe {
        let file_or_dir_path =
            windows::core::HSTRING::from(file_or_dir_path.to_string_lossy().to_string());
        result.set_value_bykey(
            "hidden",
            ((windows::Win32::Storage::FileSystem::GetFileAttributesW(&file_or_dir_path)
                & windows::Win32::Storage::FileSystem::FILE_ATTRIBUTE_HIDDEN.0)
                != 0)
                .try_into()?,
        );
        result.set_value_bykey(
            "system",
            ((windows::Win32::Storage::FileSystem::GetFileAttributesW(&file_or_dir_path)
                & windows::Win32::Storage::FileSystem::FILE_ATTRIBUTE_SYSTEM.0)
                != 0)
                .try_into()?,
        );
    }
    Ok(result)
}

#[betterncm_native_api(name = "fs.readDirWithDetails")]
#[instrument]
pub(super) fn read_dir_with_details(
    this: CefV8Value,
    folder_path: String,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, || {
        let read = std::fs::read_dir(folder_path)?;
        let mut result = CefV8Value::new_object();
        for entry in read.flatten() {
            result.set_value_byindex(
                result.get_array_length() as _,
                get_properties_for_path(entry.path().as_path())?,
            );
        }
        Ok(result)
    })
}

#[betterncm_native_api(name = "fs.getProperties")]
#[instrument]
pub fn get_properties(
    this: CefV8Value,
    file_or_dir_path: String,
    resolve: Option<CefV8Function>,
    reject: Option<CefV8Function>,
) -> anyhow::Result<CefV8Value> {
    super::optional_threaded_promise(this, resolve, reject, move || {
        let file_or_dir_path = Path::new(&file_or_dir_path);
        Ok(get_properties_for_path(file_or_dir_path)?)
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

#[betterncm_native_api(name = "fs.getDisks")]
#[instrument]
pub fn get_disks() -> anyhow::Result<CefV8Value> {
    use windows::core::HSTRING;
    use windows::Win32::Foundation::MAX_PATH;
    use windows::Win32::Storage::FileSystem::{
        GetDiskFreeSpaceExW, GetLogicalDrives, GetVolumeInformationW,
    };
    let mut result = CefV8Value::new_object();
    unsafe {
        let mut drives = GetLogicalDrives();
        if drives == 0 {
            let err = std::io::Error::last_os_error();
            anyhow::bail!("查询磁盘出错：{err:?}");
        }
        let mut letter_index = 0;
        while drives != 0 {
            let letter = char::from_u32('A' as u32 + letter_index).unwrap_or_default();
            let disk_letter = HSTRING::from(format!("{letter}:\\"));

            let mut free_bytes = 0;
            let mut total_bytes = 0;
            let mut total_bytes_free = 0;

            if GetDiskFreeSpaceExW(
                &disk_letter,
                Some(&mut free_bytes),
                Some(&mut total_bytes),
                Some(&mut total_bytes_free),
            )
            .as_bool()
            {
                let mut disk_info = CefV8Value::new_object();
                disk_info.set_value_bykey("disk", format!("{letter}:").try_into()?);

                let mut disk_name = [0; MAX_PATH as usize];
                if GetVolumeInformationW(&disk_letter, Some(&mut disk_name), None, None, None, None)
                    .as_bool()
                {
                    let disk_name = std::string::String::from_utf16_lossy(&disk_name);
                    disk_info.set_value_bykey("name", disk_name.try_into()?);
                } else {
                    disk_info.set_value_bykey("name", "".try_into()?);
                }

                disk_info.set_value_bykey("used", (total_bytes - free_bytes).try_into()?);
                disk_info.set_value_bykey("size", total_bytes.try_into()?);

                result.set_value_byindex(result.get_array_length() as _, disk_info);
            }

            letter_index += 1;
            drives >>= 1;
        }
    }
    Ok(result)
}
