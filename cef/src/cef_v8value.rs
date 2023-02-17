use std::str::FromStr;

use crate::{CefString, CefV8Function};

#[derive(Debug)]
pub struct CefV8Value(pub(crate) *mut cef_sys::cef_v8value_t);

#[derive(Debug, Clone, Copy)]
pub struct Undefined;

#[derive(Debug, Clone, Copy)]
pub struct Null;

pub type CefV8HandlerCallback<E> =
    dyn Fn(&str, CefV8Value, Vec<CefV8Value>) -> ::core::result::Result<CefV8Value, E>;

impl CefV8Value {
    pub unsafe fn from_raw(raw: *mut cef_sys::cef_v8value_t) -> Self {
        assert!(!raw.is_null(), "creating v8 value on null pointer");
        assert_ne!(
            cef_sys::cef_currently_on(cef_sys::cef_thread_id_t_TID_RENDERER),
            0,
            "creating v8 value on non-renderer thread"
        );
        Self(raw as _)
    }
    pub fn from_function<F: Fn() + 'static>(_func: F) -> Self {
        let func_name = std::any::type_name::<F>();
        let _func_name = CefString::from(func_name);
        unsafe {
            let _handler = Box::leak(Box::new(cef_sys::cef_v8handler_t {
                base: cef_sys::_cef_base_ref_counted_t {
                    size: ::core::mem::size_of::<cef_sys::cef_v8handler_t>(),
                    ..::core::mem::zeroed()
                },
                execute: None,
            }));
            todo!()
            // Self::from_raw(cef_sys::cef_v8value_create_function(func_name))
        }
    }
    pub fn create_undefined() -> Self {
        unsafe { Self::from_raw(cef_sys::cef_v8value_create_undefined() as _) }
    }
    pub fn create_null() -> Self {
        unsafe { Self::from_raw(cef_sys::cef_v8value_create_null() as _) }
    }
    pub unsafe fn as_raw(&self) -> *mut cef_sys::cef_v8value_t {
        self.0
    }
    pub fn is_valid(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_valid.unwrap())(self.0) != 0 }
    }
    pub fn is_undefined(&self) -> bool {
        if self.0.is_null() {
            return true;
        }
        unsafe { ((*self.0).is_undefined.unwrap())(self.0) != 0 }
    }
    pub fn is_null(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_null.unwrap())(self.0) != 0 }
    }
    pub fn is_bool(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_bool.unwrap())(self.0) != 0 }
    }
    pub fn is_int(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_int.unwrap())(self.0) != 0 }
    }
    pub fn is_uint(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_uint.unwrap())(self.0) != 0 }
    }
    pub fn is_double(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_double.unwrap())(self.0) != 0 }
    }
    pub fn is_date(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_date.unwrap())(self.0) != 0 }
    }
    pub fn is_string(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_string.unwrap())(self.0) != 0 }
    }
    pub fn is_object(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_object.unwrap())(self.0) != 0 }
    }
    pub fn is_array(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_array.unwrap())(self.0) != 0 }
    }
    pub fn is_array_buffer(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_array_buffer.unwrap())(self.0) != 0 }
    }
    pub fn is_function(&self) -> bool {
        if self.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_function.unwrap())(self.0) != 0 }
    }
    pub fn is_same(&self, other: &Self) -> bool {
        if self.0.is_null() || other.0.is_null() {
            return false;
        }
        unsafe { ((*self.0).is_same.unwrap())(self.0, other.0) != 0 }
    }
    pub fn get_bool_value(&self) -> bool {
        unsafe { ((*self.0).get_bool_value.unwrap())(self.0) != 0 }
    }
    pub fn get_int_value(&self) -> ::core::ffi::c_int {
        unsafe { ((*self.0).get_int_value.unwrap())(self.0) }
    }
    pub fn get_uint_value(&self) -> ::core::ffi::c_uint {
        unsafe { ((*self.0).get_uint_value.unwrap())(self.0) }
    }
    pub fn get_double_value(&self) -> ::core::ffi::c_double {
        unsafe { ((*self.0).get_double_value.unwrap())(self.0) }
    }
    pub fn get_date_value(&self) -> bool {
        todo!()
        // unsafe {((*self.0).get_date_value.unwrap())(self.0)}
    }
    pub fn get_string_value(&self) -> CefString {
        unsafe { CefString::from_raw(((*self.0).get_string_value.unwrap())(self.0) as _) }
    }
    pub fn is_user_created(&self) -> bool {
        unsafe { ((*self.0).is_user_created.unwrap())(self.0) != 0 }
    }
    pub fn has_exception(&self) -> bool {
        unsafe { ((*self.0).has_exception.unwrap())(self.0) != 0 }
    }
    pub fn get_exception(&self) -> *mut cef_sys::cef_v8exception_t {
        unsafe { ((*self.0).get_exception.unwrap())(self.0) }
    }
    pub fn clear_exception(&self) -> bool {
        unsafe { ((*self.0).clear_exception.unwrap())(self.0) != 0 }
    }
    pub fn will_rethrow_exceptions(&self) -> bool {
        unsafe { ((*self.0).will_rethrow_exceptions.unwrap())(self.0) != 0 }
    }
    pub fn set_rethrow_exceptions(&self, rethrow: ::core::ffi::c_int) -> bool {
        unsafe { ((*self.0).set_rethrow_exceptions.unwrap())(self.0, rethrow) != 0 }
    }
    pub fn has_value_bykey(&self, key: &str) -> bool {
        unsafe {
            let key = CefString::from(key);
            ((*self.0).has_value_bykey.unwrap())(self.0, key.to_raw()) != 0
        }
    }
    pub fn has_value_byindex(&self, index: ::core::ffi::c_int) -> bool {
        unsafe { ((*self.0).has_value_byindex.unwrap())(self.0, index) != 0 }
    }
    pub fn delete_value_bykey(&self, key: &str) -> bool {
        unsafe {
            ((*self.0).delete_value_bykey.unwrap())(self.0, &CefString::from(key) as *const _ as _)
                != 0
        }
    }
    pub fn delete_value_byindex(&self, index: ::core::ffi::c_int) -> bool {
        unsafe { ((*self.0).delete_value_byindex.unwrap())(self.0, index) != 0 }
    }
    pub fn get_value_bykey(&self, key: &str) -> Self {
        unsafe {
            Self::from_raw(((*self.0).get_value_bykey.unwrap())(
                self.0,
                CefString::from(key).as_raw(),
            ) as _)
        }
    }
    pub fn get_value_byindex(&self, index: isize) -> Self {
        unsafe { Self::from_raw(((*self.0).get_value_byindex.unwrap())(self.0, index as _) as _) }
    }
    pub fn set_value_bykey(&self, key: &str, value: Self) -> bool {
        unsafe {
            let key = CefString::from(key);
            ((*self.0).set_value_bykey.unwrap())(self.0, key.to_raw(), value.as_raw(), 0) != 0
        }
    }
    // pub fn set_value_byindex(&self) -> bool {
    //     unsafe { ((*self.0).set_value_byindex.unwrap())(self.0) }
    // }
    // pub fn set_value_byaccessor(&self) -> bool {
    //     unsafe { ((*self.0).set_value_byaccessor.unwrap())(self.0) }
    // }
    // pub fn get_keys(&self) -> bool {
    //     unsafe { ((*self.0).get_keys.unwrap())(self.0) }
    // }
    // pub unsafe fn set_user_data(&self, user_data: *mut ::core::ffi::c_void) -> bool {
    //     unsafe { ((*self.0).set_user_data.unwrap())(self.0, user_data) }
    // }
    // pub unsafe fn get_user_data(&self) -> bool {
    //     unsafe { ((*self.0).get_user_data.unwrap())(self.0) }
    // }
    // pub fn get_externally_allocated_memory(&self) -> bool {
    //     unsafe { ((*self.0).get_externally_allocated_memory.unwrap())(self.0) }
    // }
    // pub fn adjust_externally_allocated_memory(&self) -> bool {
    //     unsafe { ((*self.0).adjust_externally_allocated_memory.unwrap())(self.0) }
    // }
    pub fn get_array_length(&self) -> usize {
        unsafe { ((*self.0).get_array_length.unwrap())(self.0) as _ }
    }
    // pub fn get_array_buffer_release_callback(&self) -> bool {
    //     unsafe { ((*self.0).get_array_buffer_release_callback.unwrap())(self.0) }
    // }
    // pub fn neuter_array_buffer(&self) -> bool {
    //     unsafe { ((*self.0).neuter_array_buffer.unwrap())(self.0) }
    // }
    // pub fn get_function_name(&self) -> bool {
    //     unsafe { ((*self.0).get_function_name.unwrap())(self.0) }
    // }
    // pub fn get_function_handler(&self) -> bool {
    //     unsafe { ((*self.0).get_function_handler.unwrap())(self.0) }
    // }
    pub fn execute_function(&self, this_obj: CefV8Value, arguments: &[CefV8Value]) -> CefV8Value {
        let arguments = arguments.iter().map(|x| x.0).collect::<Vec<_>>();
        unsafe {
            assert!(
                cef_sys::cef_currently_on(cef_sys::cef_thread_id_t_TID_RENDERER) != 0,
                "calling v8value function on non-renderer thread"
            );
            CefV8Value::from_raw(((*self.0).execute_function.unwrap())(
                self.0,
                this_obj.0,
                arguments.len(),
                arguments.as_ptr(),
            ) as _)
        }
    }
    // pub fn execute_function_with_context(&self) -> bool {
    //     unsafe { ((*self.0).execute_function_with_context.unwrap())(self.0) }
    // }

    pub fn into_v8function(self) -> CefV8Function {
        unsafe {
            assert!(
                self.is_function(),
                "transforming non-function v8value into v8function"
            );
            CefV8Function::from_raw(self.0)
        }
    }
}

impl From<CefV8Value> for u8 {
    fn from(value: CefV8Value) -> Self {
        value.get_uint_value() as _
    }
}

impl From<CefV8Value> for u16 {
    fn from(value: CefV8Value) -> Self {
        value.get_uint_value() as _
    }
}

impl From<CefV8Value> for u32 {
    fn from(value: CefV8Value) -> Self {
        value.get_uint_value() as _
    }
}

impl From<CefV8Value> for u64 {
    fn from(value: CefV8Value) -> Self {
        value.get_uint_value() as _
    }
}

impl From<CefV8Value> for u128 {
    fn from(value: CefV8Value) -> Self {
        value.get_uint_value() as _
    }
}

impl From<CefV8Value> for usize {
    fn from(value: CefV8Value) -> Self {
        value.get_uint_value() as _
    }
}

impl From<CefV8Value> for i8 {
    fn from(value: CefV8Value) -> Self {
        value.get_uint_value() as _
    }
}

impl From<CefV8Value> for i16 {
    fn from(value: CefV8Value) -> Self {
        value.get_int_value() as _
    }
}

impl From<CefV8Value> for i32 {
    fn from(value: CefV8Value) -> Self {
        value.get_int_value() as _
    }
}

impl From<CefV8Value> for i64 {
    fn from(value: CefV8Value) -> Self {
        value.get_int_value() as _
    }
}

impl From<CefV8Value> for i128 {
    fn from(value: CefV8Value) -> Self {
        value.get_int_value() as _
    }
}

impl From<CefV8Value> for isize {
    fn from(value: CefV8Value) -> isize {
        value.get_int_value() as _
    }
}

impl From<()> for CefV8Value {
    fn from(_: ()) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_undefined() as _) }
    }
}

impl<T: Into<CefV8Value>> From<Option<T>> for CefV8Value {
    fn from(v: Option<T>) -> CefV8Value {
        if let Some(v) = v {
            v.into()
        } else {
            unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_null() as _) }
        }
    }
}

impl From<u8> for CefV8Value {
    fn from(value: u8) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_uint(value as _) as _) }
    }
}

impl From<u16> for CefV8Value {
    fn from(value: u16) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_uint(value as _) as _) }
    }
}
impl From<u32> for CefV8Value {
    fn from(value: u32) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_uint(value as _) as _) }
    }
}

impl From<usize> for CefV8Value {
    fn from(value: usize) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_uint(value as _) as _) }
    }
}

impl From<i8> for CefV8Value {
    fn from(value: i8) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_int(value as _) as _) }
    }
}

impl From<i16> for CefV8Value {
    fn from(value: i16) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_int(value as _) as _) }
    }
}
impl From<i32> for CefV8Value {
    fn from(value: i32) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_int(value as _) as _) }
    }
}

impl From<isize> for CefV8Value {
    fn from(value: isize) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_int(value as _) as _) }
    }
}

impl From<bool> for CefV8Value {
    fn from(value: bool) -> CefV8Value {
        unsafe {
            CefV8Value::from_raw(cef_sys::cef_v8value_create_bool(if value { 1 } else { 0 }) as _)
        }
    }
}

impl From<CefString> for CefV8Value {
    fn from(value: CefString) -> CefV8Value {
        unsafe { CefV8Value::from_raw(cef_sys::cef_v8value_create_string(value.as_raw()) as _) }
    }
}

impl From<&str> for CefV8Value {
    fn from(s: &str) -> CefV8Value {
        unsafe {
            CefV8Value::from_raw(cef_sys::cef_v8value_create_string(
                CefString::from(s).to_raw(),
            ))
        }
    }
}

impl FromStr for CefV8Value {
    type Err = ();
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(unsafe {
            CefV8Value::from_raw(cef_sys::cef_v8value_create_string(
                CefString::from(s).to_raw(),
            ))
        })
    }
}
