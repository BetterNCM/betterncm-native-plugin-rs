use proc_macro::TokenStream;

mod native_api;
mod native_call;
mod native_main;

/// 将指定函数包装为 BetterNCM 原生插件的入口点函数
///
/// 同时将会提供插件加载上下文以提供注册函数的能力
///
/// 被指定的函数名称可以是任意的，即使是 `main` 也可以。
///
/// 使用例子：
///
/// ```no_run
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

/// 将指定函数包装为 BetterNCM 原生插件可用的原生函数接口
///
/// 可以将处理后的函数名称作为参数传入 [`betterncm_plugin_api::PluginContext`]
/// 相关的注册函数来注册原生函数。
///
/// 且参数在传入前会被尝试转换和确认类型是否正确，因此只要是在 [`cef`]
/// 中被实现的可以被转换的类型则均支持隐式转换。
///
/// 由于自身所限，目前不允许原生函数直接返回值。但是你可以通过传入 Promise
/// 相关的函数（`resolve` 和 `reject`）作为参数并在执行后调用他们以实现异步返回。
/// 待日后插件 API 允许返回 CefV8Value 后继续完善。
///
/// 使用例子：
///
/// ```no_run
/// # use betterncm_macro::{betterncm_main, betterncm_native_call};
/// # use betterncm_plugin_api::*;
/// #[betterncm_native_call]
/// fn test_func(arg0: usize, arg1: CefV8Value) {
///    // 做需要的事情
/// }
///
/// #[betterncm_main]
/// fn betterncm_plugin_main(mut ctx: PluginContext) {
///    ctx.set_namespace("betterncm_plugin_main"); // 可选：设定命名空间
///    ctx.add_native_api(test_func); // 注册我们的原生函数
/// }
#[proc_macro_attribute]
pub fn betterncm_native_call(attr: TokenStream, input: TokenStream) -> TokenStream {
    native_call::betterncm_native_call(attr, input)
}

/// 用于 BetterNCM Loader 定义 API，请勿使用该宏
#[proc_macro_attribute]
pub fn betterncm_native_api(attr: TokenStream, input: TokenStream) -> TokenStream {
    native_api::betterncm_native_api(attr, input)
}
