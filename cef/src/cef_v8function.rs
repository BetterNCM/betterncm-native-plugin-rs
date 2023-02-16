use crate::{cef_add_ref, cef_release, CefString, CefV8Value};

#[derive(Debug)]
pub struct CefV8Function(
    *mut cef_sys::cef_v8value_t,
    *mut cef_sys::cef_v8context_t,
    *mut cef_sys::cef_task_runner_t,
);

impl CefV8Function {
    pub unsafe fn from_raw(value: *mut cef_sys::cef_v8value_t) -> Self {
        let ctx = dbg!(cef_add_ref(cef_sys::cef_v8context_get_entered_context()));
        Self(
            dbg!(cef_add_ref(value)),
            ctx,
            dbg!(cef_add_ref(((*ctx).get_task_runner).unwrap()(ctx))),
        )
    }

    pub fn execute_function(&self, arguments: &[CefV8ProxyValue]) {
        unsafe {
            println!("Calling function {self:?} on non-renderer thread!");
            let ctx = cef_add_ref(self.1);
            let runner = self.2;
            #[repr(C)]
            struct ExecFunctionTask {
                base_task: cef_sys::cef_task_t,
                ctx: *mut cef_sys::cef_v8context_t,
                function: *mut cef_sys::cef_v8value_t,
                arguments: Vec<CefV8ProxyValue>,
            }
            extern "stdcall" fn on_exec(task: *mut cef_sys::cef_task_t) {
                unsafe {
                    println!("on_exec");
                    let task: *mut ExecFunctionTask = dbg!(task as *mut ExecFunctionTask);
                    let ctx = (*task).ctx;
                    let function = (*task).function;
                    let arguments = &(*task).arguments;
                    dbg!(((*ctx).enter.unwrap())(ctx));
                    let arguments = arguments
                        .iter()
                        .map(|x| CefV8Value::from(x).as_raw())
                        .collect::<Vec<_>>();

                    println!("Executing function");
                    let result = (*function).execute_function.unwrap()(
                        function,
                        ::core::ptr::null_mut(),
                        arguments.len(),
                        arguments.as_ptr(),
                    );
                    dbg!(((*ctx).exit.unwrap())(ctx));

                    if !result.is_null() {
                        dbg!(CefV8Value::from_raw(result as _));
                    } else {
                        println!("Failed to execute function");
                    }

                    arguments.iter().for_each(|x| {
                        cef_release(*x);
                    });

                    cef_release(ctx);
                    cef_release(function);
                    let _ = Box::from_raw(task);
                }
            }
            let task = Box::leak(Box::new(ExecFunctionTask {
                base_task: cef_sys::cef_task_t {
                    base: cef_sys::_cef_base_ref_counted_t {
                        size: ::core::mem::size_of::<ExecFunctionTask>(),
                        ..::core::mem::zeroed()
                    },
                    execute: Some(on_exec),
                },
                ctx,
                function: cef_add_ref(self.0),
                arguments: arguments.to_vec(),
            }));

            dbg!(((*runner).post_task).unwrap()(runner, task as *mut _ as _));
        }
    }
}

#[derive(Clone)]
pub enum CefV8ProxyValue {
    Undefined,
    Null,
    Boolean(bool),
    UInt(::core::ffi::c_uint),
    Int(::core::ffi::c_int),
    String(CefString),
}

impl From<CefV8ProxyValue> for CefV8Value {
    fn from(value: CefV8ProxyValue) -> Self {
        match value {
            CefV8ProxyValue::Undefined => Self::create_undefined(),
            CefV8ProxyValue::Null => Self::create_null(),
            CefV8ProxyValue::Boolean(v) => v.into(),
            CefV8ProxyValue::UInt(v) => v.into(),
            CefV8ProxyValue::Int(v) => v.into(),
            CefV8ProxyValue::String(v) => v.into(),
        }
    }
}

impl From<&CefV8ProxyValue> for CefV8Value {
    fn from(value: &CefV8ProxyValue) -> Self {
        match value {
            CefV8ProxyValue::Undefined => Self::create_undefined(),
            CefV8ProxyValue::Null => Self::create_null(),
            CefV8ProxyValue::Boolean(v) => (*v).into(),
            CefV8ProxyValue::UInt(v) => (*v).into(),
            CefV8ProxyValue::Int(v) => (*v).into(),
            CefV8ProxyValue::String(v) => v.to_owned().into(),
        }
    }
}

impl From<()> for CefV8ProxyValue {
    fn from(_: ()) -> Self {
        Self::Undefined
    }
}

impl From<CefString> for CefV8ProxyValue {
    fn from(value: CefString) -> Self {
        Self::String(value)
    }
}

impl From<bool> for CefV8ProxyValue {
    fn from(value: bool) -> Self {
        Self::Boolean(value)
    }
}

impl From<u8> for CefV8ProxyValue {
    fn from(value: u8) -> Self {
        Self::UInt(value as _)
    }
}
impl From<u16> for CefV8ProxyValue {
    fn from(value: u16) -> Self {
        Self::UInt(value as _)
    }
}
impl From<u32> for CefV8ProxyValue {
    fn from(value: u32) -> Self {
        Self::UInt(value as _)
    }
}
impl From<usize> for CefV8ProxyValue {
    fn from(value: usize) -> Self {
        Self::UInt(value as _)
    }
}

impl From<i8> for CefV8ProxyValue {
    fn from(value: i8) -> Self {
        Self::Int(value as _)
    }
}
impl From<i16> for CefV8ProxyValue {
    fn from(value: i16) -> Self {
        Self::Int(value as _)
    }
}
impl From<i32> for CefV8ProxyValue {
    fn from(value: i32) -> Self {
        Self::Int(value as _)
    }
}
impl From<isize> for CefV8ProxyValue {
    fn from(value: isize) -> Self {
        Self::Int(value as _)
    }
}

impl Drop for CefV8Function {
    fn drop(&mut self) {
        unsafe {
            cef_release(self.0);
            cef_release(self.1);
            cef_release(self.2);
        }
    }
}

unsafe impl Sync for CefV8Function {}
unsafe impl Send for CefV8Function {}
