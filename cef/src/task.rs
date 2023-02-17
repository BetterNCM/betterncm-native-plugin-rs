pub fn renderer_post_task<F: FnOnce() + Send + 'static>(func: F) {
    unsafe {
        #[repr(C)]
        struct ExecFunctionTask {
            base_task: cef_sys::cef_task_t,
            func: Box<dyn FnOnce() + Send + 'static>,
        }
        extern "stdcall" fn on_exec(task: *mut cef_sys::cef_task_t) {
            unsafe {
                println!("on_exec");
                let task = Box::from_raw(task as *mut ExecFunctionTask);

                (task.func)();
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
            func: Box::new(func),
        }));

        let runner = cef_sys::cef_task_runner_get_for_thread(cef_sys::cef_thread_id_t_TID_RENDERER)
            .as_mut()
            .unwrap();

        dbg!(runner.post_task.unwrap()(runner, task as *mut _ as _));
    }
}
