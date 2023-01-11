# BetterNCM Native Plugin Rust

BetterNCM 原生插件 API 的 Rust 绑定库。

仍在施工中，仅供尝鲜体验！

## 简单用法

```rust
#![crate_type = "cdylib"] // 要导出成 DLL 链接库，或者在 Cargo.toml 中设置。
use betterncm_macro::betterncm_native_call;
use betterncm_plugin_api::*; // BetterNCM Native Plugin API
use cef::CefV8Value; // 做了一些 CEF 的包装，如果需要更多操作请使用 cef-sys 库

#[betterncm_native_call] // 使用此过程宏来轻松定义需要注册的函数，且帮你处理一定程度的类型转换。
fn test_func(arg0: u8, arg1: CefV8Value) {
    println!("BetterNCM ❤ Rust!");
    println!("{} {:?}!", arg0, arg1);
}

const FULL_V8VALUE_ARGS: [NativeAPIType; 100] = [NativeAPIType::V8Value; 100];

// 插件加载的入口点，我们在这里注册原生函数
// 日后会改进这个部分的内容
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

```
