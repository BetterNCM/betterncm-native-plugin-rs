use std::{collections::HashMap, ffi::CString, fs::ReadDir, path::PathBuf};

use crate::{
    utils::{get_ncm_version, unzip_file},
    PROCESS_TYPE,
};
use once_cell::sync::Lazy;
use path_absolutize::Absolutize;
use semver::VersionReq;
use tracing::*;
use windows::{
    core::HSTRING,
    Win32::System::LibraryLoader::{GetProcAddress, LoadLibraryW},
};

#[derive(serde::Deserialize, Clone, Debug)]
pub struct HijackEntry {
    #[serde(default = "hijack_entry_default_name")]
    pub name: String,
    #[serde(default, rename = "type")]
    pub hijack_type: String,
    #[serde(default)]
    pub code: String,
    #[serde(default)]
    pub from: String,
    #[serde(default)]
    pub to: String,
}

fn hijack_entry_default_name() -> String {
    "<missing_id>".into()
}

#[derive(serde::Deserialize, Clone, Debug)]
#[serde(untagged)]
pub enum Hijack {
    Multi(Vec<HijackEntry>),
    Single(HijackEntry),
}

#[derive(serde::Deserialize, Debug)]
pub struct PluginManifest {
    pub name: String,
    // .版本匹配字符串.链接前缀
    #[serde(default)]
    pub hijacks: HashMap<String, HashMap<String, Hijack>>,
    #[serde(default)]
    pub startup_script: String,
    #[serde(default)]
    pub native_plugin: String,
    #[serde(skip)]
    pub plugin_path: String,
}

pub static LOADED_PLUGINS: Lazy<Vec<PluginManifest>> = Lazy::new(|| {
    info!("正在加载插件元数据！");
    let mut result = Vec::with_capacity(64);
    let mut load_from_dir = |plugins: ReadDir| {
        for plugin in plugins.flatten() {
            let manifest_path = plugin.path().join("manifest.json");
            if let Ok(meta) = manifest_path.metadata() {
                if meta.is_file() {
                    debug!(
                        "正在加载插件元数据 {}",
                        plugin.file_name().to_string_lossy()
                    );
                    if let Ok(manifest) = std::fs::File::open(manifest_path) {
                        if let Ok(mut manifest) =
                            serde_json::from_reader::<_, PluginManifest>(manifest)
                        {
                            if let Ok(startup_script) =
                                std::fs::read_to_string(plugin.path().join("startup_script.js"))
                            {
                                manifest.startup_script = startup_script;
                            }
                            if let Ok(plugin_path) = plugin.path().absolutize() {
                                manifest.plugin_path = plugin_path.to_string_lossy().to_string();
                            } else {
                                manifest.plugin_path = plugin.path().to_string_lossy().to_string();
                            }
                            result.push(manifest);
                        }
                    }
                }
            }
        }
    };
    if let Ok(plugins) = std::fs::read_dir("./plugins_runtime") {
        load_from_dir(plugins);
    }
    if let Ok(plugins) = std::fs::read_dir("./plugins_dev") {
        load_from_dir(plugins);
    }
    result
});

pub static HIJACKS_MAP: Lazy<HashMap<String, Vec<HijackEntry>>> = Lazy::new(|| {
    let mut result: HashMap<String, Vec<HijackEntry>> = HashMap::with_capacity(16);
    let ncm_version = dbg!(crate::utils::get_ncm_version());

    for plugin in LOADED_PLUGINS.iter() {
        for (version_req, hijacks) in plugin.hijacks.iter() {
            let mut check_version = |version_req: VersionReq| {
                if version_req.matches(&ncm_version) {
                    for (start_url, hijack) in hijacks.iter() {
                        if let Some(cur_hijacks) = result.get_mut(start_url) {
                            match hijack {
                                Hijack::Multi(hijacks) => {
                                    cur_hijacks.extend(hijacks.iter().cloned());
                                }
                                Hijack::Single(hijack) => {
                                    cur_hijacks.push(hijack.to_owned());
                                }
                            }
                        } else {
                            match hijack {
                                Hijack::Multi(hijacks) => {
                                    result.insert(start_url.to_owned(), hijacks.to_owned());
                                }
                                Hijack::Single(hijack) => {
                                    result.insert(start_url.to_owned(), vec![hijack.to_owned()]);
                                }
                            }
                        }
                    }
                }
            };

            if let Ok(version_req) = semver::VersionReq::parse(version_req) {
                check_version(version_req);
            } else {
                // 尝试添加逗号拆分
                let mut buf = String::with_capacity(version_req.len());
                let mut result = Vec::with_capacity(8);
                for word in version_req.split_whitespace() {
                    buf.push_str(word);
                    if semver::VersionReq::parse(buf.as_str()).is_ok() {
                        result.push(buf.to_owned());
                        buf.clear();
                    }
                }
                let version_req = result.join(",");
                if let Ok(version_req) = semver::VersionReq::parse(dbg!(version_req.as_str())) {
                    check_version(version_req);
                } else {
                    warn!("警告：错误的版本匹配字符串 {}", version_req);
                }
            }
        }
    }

    result
});

pub fn init_plugins() {
    let _ = std::fs::create_dir_all("./plugins");
    let _ = std::fs::create_dir_all("./plugins_runtime");
    if let Ok(betterncm_dir) = std::env::current_dir() {
        let plugin_market_path = betterncm_dir.join("plugins_runtime/PluginMarket");
        if !plugin_market_path.is_dir() {
            info!("插件商店文件夹不存在，正在重新解压覆盖");
            crate::utils::unzip_data(
                include_bytes!("../../BetterNCM/resource/PluginMarket.plugin"),
                plugin_market_path,
            );
        }
    }
    // 触发 Lazy 加载插件
    let _ = &LOADED_PLUGINS;
    // 触发 Lazy 加载请求篡改表
    let _ = &HIJACKS_MAP;
}

pub fn load_native_plugins() {
    let ncm_version = get_ncm_version();
    let ncm_version = [
        ncm_version.major as u16,
        ncm_version.minor as u16,
        ncm_version.patch as u16,
    ];
    // 因为初始化只调用一次，所以此处泄露版本号不会有严重的内存泄露问题
    let bncm_version = Box::leak(Box::new(CString::new(crate::BETTERNCM_VERSION).unwrap()));
    // 加载原生插件
    for native_plugin in LOADED_PLUGINS
        .iter()
        .filter(|x| !x.native_plugin.is_empty())
    {
        let native_plugin_dll_path = PathBuf::from(native_plugin.plugin_path.to_owned())
            .join(&native_plugin.native_plugin)
            .to_string_lossy()
            .to_string();
        tracing::info!("正在加载原生插件 {native_plugin_dll_path}");
        match unsafe { LoadLibraryW(&HSTRING::from(native_plugin_dll_path.to_owned())) } {
            Ok(plugin_module) => {
                let main_func =
                    unsafe { GetProcAddress(plugin_module, windows::s!("BetterNCMPluginMain")) };
                if let Some(main_func) = main_func {
                    // 为了将上下文的内存所有权交由插件自身管理，此处需要泄露结构
                    // 因为初始化只调用一次，所以此处泄露不会有严重的内存泄露问题
                    let raw_ctx = Box::leak(Box::new(betterncm_plugin_api::RawPluginAPI {
                        addNativeAPI: Some(crate::plugin_native_apis::add_native_api),
                        betterncmVersion: bncm_version.as_ptr(),
                        processType: match *PROCESS_TYPE {
                            crate::ProcessType::Main => betterncm_plugin_api::NCMProcessType::Main,
                            crate::ProcessType::Renderer => {
                                betterncm_plugin_api::NCMProcessType::Renderer
                            }
                            crate::ProcessType::GPUProcess => {
                                betterncm_plugin_api::NCMProcessType::GpuProcess
                            }
                            crate::ProcessType::Utility => {
                                betterncm_plugin_api::NCMProcessType::Utility
                            }
                            #[allow(unreachable_patterns)]
                            _ => betterncm_plugin_api::NCMProcessType::Undetected,
                        },
                        ncmVersion: &ncm_version,
                    }));
                    let main_func: betterncm_plugin_api::NativePluginMainFunction =
                        unsafe { core::mem::transmute(main_func) };
                    // TODO: 增加 C++ 错误捕获
                    unsafe {
                        (main_func)(raw_ctx as *mut _ as _);
                    }
                } else {
                    tracing::warn!(
                        "加载原生插件 {} 失败，错误信息: 无法找到插件入口函数 BetterNCMPluginMain",
                        native_plugin_dll_path
                    );
                }
            }
            Err(err) => {
                tracing::warn!(
                    "加载原生插件 {} 失败，错误信息: {}",
                    native_plugin_dll_path,
                    err
                );
            }
        }
    }
}

pub fn unzip_plugins() {
    let _ = std::fs::remove_dir_all("./plugins_runtime");
    init_plugins();
    info!("正在重新解压插件！");
    if let Ok(plugins) = std::fs::read_dir("./plugins") {
        for plugin in plugins.flatten() {
            if let Ok(meta) = plugin.metadata() {
                if meta.is_file() && plugin.file_name().to_string_lossy().ends_with(".plugin") {
                    debug!("正在解压插件 {}", plugin.file_name().to_string_lossy());
                    if let Ok(zip_file) = std::fs::File::open(plugin.path()) {
                        if let Ok(mut zip_file) = zip::ZipArchive::new(zip_file) {
                            if let Ok(manifest) = zip_file.by_name("manifest.json") {
                                if serde_json::from_reader::<_, PluginManifest>(manifest).is_ok() {
                                    let unzip_dir = std::path::Path::new("./plugins_runtime")
                                        .join(plugin.file_name().to_string_lossy().to_string());
                                    let _ = std::fs::remove_dir_all(&unzip_dir);
                                    unzip_file(plugin.path(), &unzip_dir);
                                    let _ = std::fs::write(
                                        unzip_dir.join(".plugin.path.meta"),
                                        plugin
                                            .path()
                                            .absolutize()
                                            .unwrap()
                                            .to_string_lossy()
                                            .replace('\\', "/"),
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
