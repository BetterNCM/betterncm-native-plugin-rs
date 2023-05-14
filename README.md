# BetterNCM Native Plugin Rust

BetterNCM 原生插件 API 的 Rust 绑定库。

## 简单用法

```rust
#![crate_type = "cdylib"] // 要导出成 DLL 链接库，或者在 Cargo.toml 中设置。

use betterncm_macro::{betterncm_main, betterncm_native_call}; // 用于注册函数的两个宏
use betterncm_plugin_api::*; // BetterNCM Native Plugin API
use cef::CefV8Value; // 做了一些 CEF 的包装，如果需要更多操作请使用 cef-sys 库

#[betterncm_native_call] // 使用此过程宏来轻松定义需要注册的函数，且帮你处理一定程度的类型转换。
fn test_func(arg0: usize, arg1: CefV8Value) {
    println!("BetterNCM ❤ Rust!");
    println!("{} {:?}", arg0, arg1);
}

// 插件加载的入口点，我们在这里注册原生函数
#[betterncm_main]
fn betterncm_plugin_main(mut ctx: PluginContext) {
    ctx.set_namespace("betterncm_plugin_main");
    ctx.add_native_api(test_func);

    println!("BetterNCM Rust Plugin loaded!");
}

```

详情请参阅本仓库下的 [betterncm-plugin-example](./betterncm-plugin-example) 文件夹。
