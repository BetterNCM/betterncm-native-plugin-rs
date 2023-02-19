use betterncm_macro::*;
use cef::*;
use tracing::*;

#[betterncm_native_api(name = "fs.readDir")]
#[instrument]
fn read_dir(folder_path: String, resolve: CefV8Function, reject: CefV8Function) {
    rayon::spawn(move || {});
}
