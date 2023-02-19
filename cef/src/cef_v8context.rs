pub struct CefV8Context(pub(crate) *mut cef_sys::cef_v8context_t);

unsafe impl Send for CefV8Context {}

impl CefV8Context {
    pub fn is_in_context() -> bool {
        unsafe { cef_sys::cef_v8context_in_context() != 0 }
    }

    pub fn current() -> Self {
        Self::get_current().unwrap()
    }

    pub fn get_current() -> Option<Self> {
        unsafe {
            let ctx = cef_sys::cef_v8context_get_current_context();
            if ctx.is_null() {
                None
            } else {
                Some(Self(ctx))
            }
        }
    }

    pub fn post_task<F: FnOnce() + Send + 'static>(&self, callback: F) {
        crate::task::renderer_post_task_in_v8_ctx(self.0, callback)
    }
}
