use std::{collections::HashMap, fs::ReadDir};

use crate::utils::unzip_file;
use once_cell::sync::Lazy;
use path_absolutize::Absolutize;
use tracing::*;

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
    dbg!(result)
});

pub static HIJACKS_MAP: Lazy<HashMap<String, Vec<HijackEntry>>> = Lazy::new(|| {
    let mut result: HashMap<String, Vec<HijackEntry>> = HashMap::with_capacity(16);
    let ncm_version = crate::utils::get_ncm_version();

    for plugin in LOADED_PLUGINS.iter() {
        for (version_req, hijacks) in plugin.hijacks.iter() {
            if let Ok(version_req) = semver::VersionReq::parse(version_req) {
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
            } else {
                warn!("警告：错误的版本匹配字符串 {}", version_req);
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
                include_bytes!("../resources/PluginMarket.plugin"),
                plugin_market_path,
            );
        }
    }
    // 触发 Lazy 加载插件
    let _ = &LOADED_PLUGINS;
    // 触发 Lazy 加载请求篡改表
    let _ = &HIJACKS_MAP;
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
                                if let Ok(manifest) =
                                    serde_json::from_reader::<_, PluginManifest>(manifest)
                                {
                                    let unzip_dir = std::path::Path::new("./plugins_runtime")
                                        .join(manifest.name.as_str());
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
