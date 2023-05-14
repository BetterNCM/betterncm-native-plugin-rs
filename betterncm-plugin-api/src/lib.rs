use std::ffi::CString;

pub use betterncm_plugin_api_sys::{NCMProcessType, NativeAPIType, PluginAPI as RawPluginAPI};

pub struct PluginContext {
    raw: *mut RawPluginAPI,
    namespace: String,
}

pub type NativeFunction =
    unsafe extern "C" fn(arg1: *mut *mut ::core::ffi::c_void) -> *mut ::core::ffi::c_char;
pub type NativePluginMainFunction =
    unsafe extern "C" fn(ctx: *mut ::core::ffi::c_void) -> ::core::ffi::c_int;

#[repr(C)]
pub struct NativeFunctionDescription {
    pub function: NativeFunction,
    pub identifier: &'static str,
    pub args_num: usize,
}

impl PluginContext {
    /// 通过传入的原生插件上下文指针创建本结构体
    /// # Safety
    /// 不建议手动调用，最好用宏 [`betterncm_macro::betterncm_main`] 来调用
    pub unsafe fn from_raw(raw: *mut RawPluginAPI) -> Self {
        Self {
            raw,
            namespace: String::new(),
        }
    }

    /// 直接调用原始注册函数来注册原生函数
    /// # Safety
    /// 不建议手动调用，最好用宏 [`betterncm_macro::betterncm_native_call`] 来调用
    pub unsafe fn add_native_api_raw(
        &self,
        args: *mut NativeAPIType,
        args_num: ::core::ffi::c_int,
        identifier: *const ::core::ffi::c_char,
        function: NativeFunction,
    ) {
        if let Some(ctx) = self.raw.as_ref() {
            if let Some(add_native_api) = ctx.addNativeAPI {
                (add_native_api)(args, args_num, identifier, Some(function));
            }
        }
    }

    /// 注册一个原生函数，推荐使用 [`betterncm_macro::betterncm_native_call`] 来实现注册
    ///
    /// 如果不使用宏来辅助注册，请传入一个会返回原生函数信息的函数来提供注册所需的信息
    pub fn add_native_api(&self, func_desc: impl Fn() -> &'static NativeFunctionDescription) {
        let func_desc = (func_desc)();
        if let Ok(identifier) = CString::new(format!("{}{}", self.namespace, func_desc.identifier))
        {
            let mut args = Box::new([NativeAPIType::V8Value; 100]);
            unsafe {
                self.add_native_api_raw(
                    args.as_mut_ptr(),
                    func_desc.args_num as _,
                    identifier.as_c_str().as_ptr(),
                    func_desc.function,
                );
            }
        }
    }

    /// 注册一个原生函数，推荐使用 [`betterncm_macro::betterncm_native_call`] 来实现注册
    ///
    /// 如果不使用宏来辅助注册，请传入一个会返回原生函数信息的函数来提供注册所需的信息
    pub fn with_native_api(self, func_desc: fn() -> &'static NativeFunctionDescription) -> Self {
        self.add_native_api(func_desc);
        self
    }

    /// 注册一组原生函数，推荐使用 [`betterncm_macro::betterncm_native_call`] 来实现注册
    ///
    /// 如果不使用宏来辅助注册，请传入一个会返回原生函数信息的函数来提供注册所需的信息
    pub fn add_native_apis(&self, func_desc: &[fn() -> &'static NativeFunctionDescription]) {
        for func_desc in func_desc {
            self.add_native_api(*func_desc);
        }
    }

    /// 注册一组原生函数，推荐使用 [`betterncm_macro::betterncm_native_call`] 来实现注册
    ///
    /// 如果不使用宏来辅助注册，请传入一个会返回原生函数信息的函数来提供注册所需的信息
    pub fn with_native_apis(
        self,
        func_desc: &[fn() -> &'static NativeFunctionDescription],
    ) -> Self {
        self.add_native_apis(func_desc);
        self
    }

    /// 为你之后注册的函数增加前缀，即 namespce.api
    pub fn set_namespace(&mut self, namespace: &str) {
        self.namespace = format!("{namespace}.");
    }

    /// 为你之后注册的函数增加前缀，即 namespce.api
    pub fn with_namespace(mut self, namespace: &str) -> Self {
        self.set_namespace(namespace);
        self
    }

    /// 为你之后注册的函数增加前缀
    ///
    /// 和 [`PluginContext::set_namespace`] 不同的地方在于这个不会给你加一个点
    pub fn set_namespace_raw(&mut self, namespace: &str) {
        self.namespace = namespace.to_owned();
    }

    /// 为你之后注册的函数增加前缀
    ///
    /// 和 [`PluginContext::set_namespace`] 不同的地方在于这个不会给你加一个点
    pub fn with_namespace_raw(mut self, namespace: &str) -> Self {
        self.set_namespace_raw(namespace);
        self
    }
}
