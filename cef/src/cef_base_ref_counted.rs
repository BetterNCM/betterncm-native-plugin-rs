#[derive(Debug)]
pub struct CefBaseRefCounted(*mut cef_sys::cef_base_ref_counted_t);

impl CefBaseRefCounted {
    pub unsafe fn from_raw(value: *mut cef_sys::cef_base_ref_counted_t) -> Self {
        Self(value)
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

// pub(crate) unsafe fn cef_add_ref<T>(base_ref: *mut T) -> *mut T {
//     if !base_ref.is_null() {
//         let base_ref = base_ref as *mut cef_sys::cef_base_ref_counted_t;
//         if let Some(add_ref) = (*base_ref).add_ref {
//             (add_ref)(base_ref);
//         }
//     }
//     base_ref as *mut T
// }

// pub(crate) unsafe fn cef_release<T>(base_ref: *mut T) -> *mut T {
//     if !base_ref.is_null() {
//         let base_ref = base_ref as *mut cef_sys::cef_base_ref_counted_t;
//         if let Some(release) = (*base_ref).release {
//             (release)(base_ref);
//         }
//     }
//     base_ref as *mut T
// }

pub fn create_once_ref<T>() -> cef_sys::cef_base_ref_counted_t {
    cef_sys::cef_base_ref_counted_t {
        size: ::core::mem::size_of::<T>() as _,
        add_ref: Some(add_ref),
        release: Some(release),
        has_one_ref: Some(has_one_ref),
        has_at_least_one_ref: Some(has_at_least_one_ref),
    }
}

extern "stdcall" fn add_ref(_: *mut cef_sys::cef_base_ref_counted_t) {}

extern "stdcall" fn release(_: *mut cef_sys::cef_base_ref_counted_t) -> ::core::ffi::c_int {
    1
}

extern "stdcall" fn has_one_ref(_: *mut cef_sys::cef_base_ref_counted_t) -> ::core::ffi::c_int {
    1
}

extern "stdcall" fn has_at_least_one_ref(
    _: *mut cef_sys::cef_base_ref_counted_t,
) -> ::core::ffi::c_int {
    1
}

impl Drop for CefBaseRefCounted {
    fn drop(&mut self) {
        self.release();
    }
}
