use std::collections::HashMap;

use crate::utils::unzip_file;
use once_cell::sync::Lazy;
use path_absolutize::Absolutize;
use tracing::*;

#[derive(serde::Deserialize)]
pub struct HijackEntry {
    #[serde(default = "hijack_entry_default_name")]
    pub name: String,
    #[serde(default)]
    pub hijack_type: String,
    #[serde(default)]
    pub from: String,
    #[serde(default)]
    pub to: String,
}

fn hijack_entry_default_name() -> String {
    "<missing_id>".into()
}

#[derive(serde::Deserialize)]
#[serde(untagged)]
pub enum Hijack {
    Multi(Vec<HijackEntry>),
    Single(HijackEntry),
}

#[derive(serde::Deserialize)]
pub struct PluginManifest {
    pub name: String,
    // .版本匹配字符串.链接前缀
    #[serde(default)]
    pub hijacks: HashMap<String, HashMap<String, Hijack>>,
}

pub static LOADED_PLUGINS: Lazy<Vec<PluginManifest>> = Lazy::new(|| {
    info!("正在加载插件元数据！");
    let mut result = Vec::with_capacity(64);
    if let Ok(plugins) = std::fs::read_dir("./plugins_runtime") {
        for plugin in plugins.flatten() {
            let manifest_path = plugin.path().join("manifest.json");
            if let Ok(meta) = manifest_path.metadata() {
                if meta.is_file() {
                    debug!(
                        "正在加载插件元数据 {}",
                        plugin.file_name().to_string_lossy()
                    );
                    if let Ok(manifest) = std::fs::File::open(manifest_path) {
                        if let Ok(manifest) = serde_json::from_reader::<_, PluginManifest>(manifest)
                        {
                            result.push(manifest);
                        }
                    }
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
                include_bytes!("../resources/PluginMarket.plugin"),
                plugin_market_path,
            );
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
