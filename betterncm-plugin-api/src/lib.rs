use std::ffi::CString;

pub use betterncm_plugin_api_sys::{NCMProcessType, NativeAPIType, PluginAPI as RawPluginAPI};

#[repr(transparent)]
pub struct PluginContext(*mut RawPluginAPI);

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
    /// # Safety
    /// 不建议手动调用，最好用宏来调用
    pub unsafe fn from_raw(raw: *mut RawPluginAPI) -> Self {
        Self(raw)
    }

    /// # Safety
    /// 不建议手动调用，最好用宏来调用
    pub unsafe fn add_native_api_raw(
        &self,
        args: *mut NativeAPIType,
        args_num: ::core::ffi::c_int,
        identifier: *const ::core::ffi::c_char,
        function: NativeFunction,
    ) {
        if let Some(ctx) = self.0.as_ref() {
            if let Some(add_native_api) = ctx.addNativeAPI {
                (add_native_api)(args, args_num, identifier, Some(function));
            }
        }
    }

    pub fn add_native_api(&self, func_desc: fn() -> &'static NativeFunctionDescription) {
        let func_desc = (func_desc)();
        if let Ok(identifier) = CString::new(func_desc.identifier) {
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

    pub fn with_native_api(self, func_desc: fn() -> &'static NativeFunctionDescription) -> Self {
        self.add_native_api(func_desc);
        self
    }

    pub fn add_native_apis(&self, func_desc: &[fn() -> &'static NativeFunctionDescription]) {
        for func_desc in func_desc {
            self.add_native_api(*func_desc);
        }
    }

    pub fn with_native_apis(
        self,
        func_desc: &[fn() -> &'static NativeFunctionDescription],
    ) -> Self {
        self.add_native_apis(func_desc);
        self
    }
}
