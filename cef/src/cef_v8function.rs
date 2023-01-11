use crate::{CefBaseRefCounted, CefV8Value};

#[derive(Debug)]
pub struct CefV8Function(
    *mut cef_sys::cef_v8value_t,
    CefBaseRefCounted,
    *mut cef_sys::cef_task_runner_t,
);

impl CefV8Function {
    pub unsafe fn from_raw(
        value: *mut cef_sys::cef_v8value_t,
        ref_count: CefBaseRefCounted,
    ) -> Self {
        Self(
            value,
            ref_count,
            cef_sys::cef_task_runner_get_for_current_thread(),
        )
    }

    pub fn execute_function(&self, this_obj: CefV8Value, arguments: &[CefV8Value]) {
        todo!()
    }
}

unsafe impl Sync for CefV8Function {}
unsafe impl Send for CefV8Function {}
