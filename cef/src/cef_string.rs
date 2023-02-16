use std::fmt::Display;

use cef_sys::cef_string_userfree_utf16_free;

#[repr(C)]
pub struct CefString(*mut cef_sys::cef_string_t);

impl CefString {
    pub unsafe fn from_raw(raw: *mut ::core::ffi::c_void) -> Self {
        Self(raw as _)
    }
    pub unsafe fn as_raw(&self) -> *mut cef_sys::cef_string_t {
        self.0
    }
}

impl Clone for CefString {
    fn clone(&self) -> Self {
        unsafe {
            let s = *self.0;
            let s = Box::new(::core::slice::from_raw_parts(s.str_, s.length).to_vec()).leak();
            let result = Box::leak(Box::new(cef_sys::cef_string_t {
                str_: s.as_mut_ptr(),
                length: s.len(),
                dtor: None,
            }));
            CefString(result as *mut _)
        }
    }
}

impl Default for CefString {
    fn default() -> Self {
        unsafe { std::mem::zeroed() }
    }
}

impl Display for CefString {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let str = unsafe {
            if let Some(data) = self.0.as_ref() {
                if data.str_.is_null() {
                    "".into()
                } else {
                    String::from_utf16_lossy(std::slice::from_raw_parts(data.str_, data.length))
                }
            } else {
                "".into()
            }
        };
        f.write_str(&str)
    }
}

impl From<CefString> for String {
    fn from(data: CefString) -> Self {
        unsafe {
            if let Some(data) = data.0.as_ref() {
                if data.str_.is_null() {
                    "".into()
                } else {
                    String::from_utf16_lossy(std::slice::from_raw_parts(data.str_, data.length))
                }
            } else {
                "".into()
            }
        }
    }
}

impl From<&str> for CefString {
    fn from(data: &str) -> Self {
        unsafe {
            let mut result: cef_sys::cef_string_t = ::core::mem::zeroed();

            assert_ne!(
                cef_sys::cef_string_utf8_to_utf16(data.as_ptr() as _, data.len(), &mut result),
                0
            );

            Self::from_raw(&mut result as *mut _ as _)
        }
    }
}

impl Drop for CefString {
    fn drop(&mut self) {
        unsafe {
            if let Some(s) = self.0.as_mut() {
                if s.dtor.is_some() {
                    (cef_string_userfree_utf16_free)(s);
                } else {
                    let _ = Box::from_raw(s);
                }
            }
        }
    }
}
