use std::ffi::CString;

use betterncm_macro::*;
use betterncm_plugin_api::*;
use cef::*;
use tracing::*;

#[betterncm_native_api(name = "native_plugin.getRegisteredAPIs")]
#[instrument]
pub fn get_registered_apis() -> anyhow::Result<Vec<String>> {
    unsafe {
        Ok(crate::plugin_native_apis::REGISTERED_APIS
            .keys()
            .map(|x| x.to_owned())
            .collect())
    }
}

#[betterncm_native_api(name = "native_plugin.call")]
#[instrument]
pub fn call_native_api(identifier: String, args: Vec<CefV8Value>) -> anyhow::Result<CefV8Value> {
    if let Some(api) = unsafe { crate::plugin_native_apis::REGISTERED_APIS.get(&identifier) } {
        if args.len() != api.0.len() {
            anyhow::bail!(
                "参数数量不匹配，需要 {} 个参数但是提供了 {} 个",
                api.0.len(),
                args.len()
            );
        }
        let mut args = unsafe {
            args.into_iter()
                .enumerate()
                .map(|(i, v)| match api.0[i] {
                    NativeAPIType::Int => {
                        Box::leak(Box::new(v.get_int_value())) as *mut _ as *mut ::core::ffi::c_void
                    }
                    NativeAPIType::Boolean => {
                        Box::leak(Box::new(v.get_bool_value() as ::core::ffi::c_int)) as *mut _
                            as *mut ::core::ffi::c_void
                    }
                    NativeAPIType::Double => Box::leak(Box::new(v.get_double_value())) as *mut _
                        as *mut ::core::ffi::c_void,
                    NativeAPIType::String => CString::new(v.get_string_value().to_string())
                        .unwrap_or_default()
                        .into_raw() as *mut _
                        as *mut ::core::ffi::c_void,
                    NativeAPIType::V8Value => v.as_raw() as *mut ::core::ffi::c_void,
                })
                .collect::<Vec<*mut ::core::ffi::c_void>>()
        };

        let result = unsafe { api.1(args.as_mut_ptr()) };

        // 回收非 V8Value 内存
        for (i, v) in args.into_iter().enumerate() {
            unsafe {
                match api.0[i] {
                    NativeAPIType::Int => {
                        let _ = Box::from_raw(v as *mut ::core::ffi::c_int);
                    }
                    NativeAPIType::Boolean => {
                        let _ = Box::from_raw(v as *mut ::core::ffi::c_int);
                    }
                    NativeAPIType::Double => {
                        let _ = Box::from_raw(v as *mut ::core::ffi::c_double);
                    }
                    NativeAPIType::String => {
                        let _ = CString::from_raw(v as *mut ::core::ffi::c_char);
                    }
                    NativeAPIType::V8Value => {}
                }
            }
        }

        if result.is_null() {
            Ok(CefV8Value::new_undefined())
        } else {
            let result = unsafe { CString::from_raw(result) }.into_string()?;
            Ok(result.try_into()?)
        }
    } else {
        anyhow::bail!("未知的原生函数 ID: {identifier}")
    }
}
