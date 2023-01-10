use cef::CefV8Value;

#[repr(C)]
#[allow(dead_code)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NativeAPIType {
    Int = 0,
    Boolean = 1,
    Double = 2,
    String = 3,
    V8Value = 4,
}

impl NativeAPIType {
    pub unsafe fn into_value(&self, raw_value: *mut ::core::ffi::c_void) -> NativeAPIValue {
        match self {
            Self::Int => NativeAPIValue::Int(*(raw_value as *mut ::core::ffi::c_int)),
            Self::Boolean => NativeAPIValue::Boolean(*(raw_value as *mut ::core::ffi::c_int)),
            Self::Double => NativeAPIValue::Double(*(raw_value as *mut ::core::ffi::c_double)),
            Self::String => {
                NativeAPIValue::String(core::ffi::CStr::from_ptr(raw_value as _).to_str().unwrap())
            }
            Self::V8Value => panic!("V8Value unsupported"),
        }
    }
}

#[repr(C)]
#[allow(dead_code)]
pub enum NativeAPIValue {
    Int(::core::ffi::c_int),
    Boolean(::core::ffi::c_int),
    Double(::core::ffi::c_double),
    String(&'static str),
    V8Value(CefV8Value),
}

#[repr(C)]
#[derive(Debug, Copy, Clone)]
#[allow(non_snake_case)]
pub struct PluginContext {
    addNativeAPI: ::core::option::Option<
        unsafe extern "C" fn(
            args: *const NativeAPIType,
            argsNum: ::core::ffi::c_int,
            identifier: *const ::core::ffi::c_char,
            function: ::core::option::Option<
                unsafe extern "C" fn(
                    arg1: *const *mut ::core::ffi::c_void,
                ) -> *mut ::core::ffi::c_char,
            >,
        ) -> ::core::ffi::c_int,
    >,
}

impl PluginContext {
    pub unsafe fn add_native_api_raw(
        &self,
        args: *const NativeAPIType,
        args_num: ::core::ffi::c_int,
        identifier: *const ::core::ffi::c_char,
        function: unsafe extern "C" fn(
            arg1: *const *mut ::core::ffi::c_void,
        ) -> *mut ::core::ffi::c_char,
    ) {
        if let Some(add_native_api) = self.addNativeAPI {
            (add_native_api)(args, args_num, identifier, Some(function));
        }
    }
}

#[test]
fn bindgen_test_layout_betterncm_native_plugin_plugin_api() {
    const UNINIT: ::core::mem::MaybeUninit<PluginContext> = ::core::mem::MaybeUninit::uninit();
    let ptr = UNINIT.as_ptr();
    assert_eq!(
        ::core::mem::size_of::<PluginContext>(),
        8usize,
        concat!("Size of: ", stringify!(BetterNCMNativePlugin_PluginAPI))
    );
    assert_eq!(
        ::core::mem::align_of::<PluginContext>(),
        8usize,
        concat!("Alignment of ", stringify!(BetterNCMNativePlugin_PluginAPI))
    );
    assert_eq!(
        unsafe { ::core::ptr::addr_of!((*ptr).addNativeAPI) as usize - ptr as usize },
        0usize,
        concat!(
            "Offset of field: ",
            stringify!(BetterNCMNativePlugin_PluginAPI),
            "::",
            stringify!(addNativeAPI)
        )
    );
}
