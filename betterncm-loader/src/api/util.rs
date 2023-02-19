use betterncm_macro::*;
use cef::*;
use cef_sys::cef_v8context_get_current_context;
use tracing::*;

#[betterncm_native_api(name = "util.executeJavaScript")]
#[instrument]
pub fn execute_java_script(code: String, script_url: String, start_line: usize) {
    unsafe {
        let ctx = cef_v8context_get_current_context().as_mut().unwrap();
        let frame = ctx.get_frame.unwrap()(ctx).as_mut().unwrap();

        let code = CefString::from(code.as_str()).to_raw();
        let script_url = CefString::from(script_url.as_str()).to_raw();

        frame.execute_java_script.unwrap()(frame, code, script_url, start_line as _);
    }
}
