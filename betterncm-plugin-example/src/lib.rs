use betterncm_macro::{betterncm_main, betterncm_native_call};
use betterncm_plugin_api::*;
use cef::CefV8Value;

#[betterncm_native_call]
fn test_func(arg0: usize, arg1: CefV8Value) {
    println!("BetterNCM ❤ Rust!");
    println!("{arg0} {arg1:?}!");
    dbg!(cef::CefV8Context::current());
    if arg1.is_function() {
        let arg1 = arg1;
        std::thread::spawn(move || {
            println!("Delay Executing function");
            std::thread::sleep(std::time::Duration::from_secs(2));
            println!("Executing!");
            arg1.execute_function(None, &[arg0.try_into().unwrap()]);
            std::thread::sleep(std::time::Duration::from_secs(2));
            println!("Executing!");
            arg1.execute_function(None, &[(arg0 * 2).try_into().unwrap()]);
        });
    }
}

#[betterncm_main]
fn betterncm_plugin_main(ctx: PluginContext) {
    ctx.add_native_api(test_func);

    println!("BetterNCM Rust Plugin loaded!");
}
