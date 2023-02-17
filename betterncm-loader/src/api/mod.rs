mod scheme;

pub fn setup_native_api(global_this: cef::CefV8Value) {
    if !global_this.has_value_bykey("betterncm_native") {
        println!("正在初始化原生 API！");
        global_this.set_value_bykey("betterncm_native", 114514.into());

        println!("已初始化原生 API！");
    }

    // global_this.set_value_bykey("betterncm_native", cef::CefV8Value::from("testing"));
}
