#[derive(Debug)]
pub struct CefBaseRefCounted(*mut cef_sys::cef_base_ref_counted_t);

impl CefBaseRefCounted {
    pub unsafe fn from_raw(value: *mut cef_sys::cef_base_ref_counted_t) -> Self {
        let v = Self(value);
        v.add_ref();
        v
    }

    pub fn add_ref(&self) {
        unsafe { ((*self.0).add_ref.unwrap())(self.0) }
    }

    pub fn release(&self) -> ::core::ffi::c_int {
        unsafe { ((*self.0).release.unwrap())(self.0) }
    }

    pub fn has_one_ref(&self) -> bool {
        unsafe { ((*self.0).has_one_ref.unwrap())(self.0) != 0 }
    }

    pub fn has_at_least_one_ref(&self) -> bool {
        unsafe { ((*self.0).has_at_least_one_ref.unwrap())(self.0) != 0 }
    }
}

impl Drop for CefBaseRefCounted {
    fn drop(&mut self) {
        self.release();
    }
}
