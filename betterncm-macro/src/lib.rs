use proc_macro::TokenStream;

mod native_api;
mod native_call;
mod native_main;

/// 将指定函数包装为 BetterNCM 原生插件的入口点函数
///
/// 同时将会提供插件加载上下文以提供注册函数的能力
///
/// 使用例子：
///
/// ```
/// # use betterncm_macro::betterncm_main;
/// # use betterncm_plugin_api::*;
/// #[betterncm_main]
/// fn betterncm_plugin_main(ctx: PluginContext) {
///      println!("BetterNCM Rust Plugin loaded!");
/// }
/// ```
#[proc_macro_attribute]
pub fn betterncm_main(attr: TokenStream, input: TokenStream) -> TokenStream {
    native_main::betterncm_main(attr, input)
}

#[proc_macro_attribute]
pub fn betterncm_native_call(attr: TokenStream, input: TokenStream) -> TokenStream {
    native_call::betterncm_native_call(attr, input)
}

/// 用于 BetterNCM Loader 定义 API，请勿使用该宏
#[proc_macro_attribute]
pub fn betterncm_native_api(attr: TokenStream, input: TokenStream) -> TokenStream {
    native_api::betterncm_native_api(attr, input)
}
