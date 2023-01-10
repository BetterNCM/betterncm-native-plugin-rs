#[repr(C)]
pub struct CefString(*mut cef_sys::cef_string_t);

impl CefString {
    pub unsafe fn from_raw(raw: *mut ::core::ffi::c_void) -> Self {
        Self(raw as _)
    }
}

impl Default for CefString {
    fn default() -> Self {
        unsafe { std::mem::zeroed() }
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
            let data = Box::new(data.encode_utf16().chain(Some(0)).collect::<Vec<_>>());

            result.length = data.len();
            result.str_ = Box::leak(data).as_mut_ptr();

            Self::from_raw(&mut result as *mut _ as _)
        }
    }
}

impl Drop for CefString {
    fn drop(&mut self) {
        unsafe {
            if let Some(s) = self.0.as_ref() {
                if let Some(dtor) = s.dtor {
                    (dtor)(s.str_);
                }
            }
        }
    }
}
