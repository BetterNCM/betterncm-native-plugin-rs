use betterncm_macro::*;
use tracing::*;

#[betterncm_native_api(name = "internal.getFrameworkCSS")]
#[instrument]
pub fn get_framework_css() -> anyhow::Result<String> {
    Ok(include_str!("../../resources/framework.css").into())
}
