use betterncm_macro::betterncm_native_call;
use betterncm_plugin_api::*;
use cef::CefV8Value;

#[betterncm_native_call]
fn test_func(arg0: u8, arg1: CefV8Value) {
    println!("BetterNCM ❤ Rust!");
    println!("{} {:?}!", arg0, arg1);
    unsafe {
        dbg!(cef_sys::cef_v8context_get_current_context());
    }
}

const FULL_V8VALUE_ARGS: [NativeAPIType; 100] = [NativeAPIType::V8Value; 100];

#[export_name = "BetterNCMPluginMain"]
extern "cdecl" fn betterncm_plugin_main(ctx: &mut PluginContext) -> ::core::ffi::c_int {
    unsafe {
        ctx.add_native_api_raw(
            FULL_V8VALUE_ARGS.as_ptr(),
            2,
            "betterncm-native-plugin-rs-test_func\0".as_ptr() as _,
            test_func,
        );
    }

    println!("BetterNCM Rust Plugin loaded!");

    1
}
