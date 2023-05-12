use std::collections::HashMap;

use betterncm_plugin_api::*;
use once_cell::unsync::Lazy;

use crate::PROCESS_TYPE;

type APIStorage = HashMap<
    String,
    (
        Vec<NativeAPIType>,
        unsafe extern "C" fn(arg1: *mut *mut ::core::ffi::c_void) -> *mut ::core::ffi::c_char,
    ),
>;

pub static mut REGISTERED_APIS: Lazy<APIStorage> = Lazy::new(HashMap::new);

pub unsafe extern "C" fn add_native_api(
    args: *mut NativeAPIType,
    args_num: ::core::ffi::c_int,
    identifier: *const ::core::ffi::c_char,
    function: ::core::option::Option<
        unsafe extern "C" fn(arg1: *mut *mut ::core::ffi::c_void) -> *mut ::core::ffi::c_char,
    >,
) -> ::core::ffi::c_int {
    if *PROCESS_TYPE == crate::ProcessType::Renderer {
        match args_num.try_into() {
            Ok(args_num) => {
                let args = ::core::slice::from_raw_parts(args, args_num).to_vec();
                let identifier = ::core::ffi::CStr::from_ptr(identifier);
                if let Some(function) = function {
                    REGISTERED_APIS
                        .insert(identifier.to_str().unwrap().to_owned(), (args, function));
                    tracing::info!(
                        "成功注册了原生 API: {}",
                        identifier.to_str().unwrap_or_default()
                    );
                    true.into()
                } else {
                    tracing::warn!("注册原生 API 失败: function 为 null");
                    false.into()
                }
            }
            Err(err) => {
                tracing::warn!("注册原生 API 失败: args_num 转换失败: {}", err);
                false.into()
            }
        }
    } else {
        tracing::warn!("注册原生 API 失败: 非渲染进程");
        false.into()
    }
}
