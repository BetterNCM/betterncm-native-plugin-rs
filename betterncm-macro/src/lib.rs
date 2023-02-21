use proc_macro::{Span, TokenStream};
use quote::{format_ident, quote, ToTokens};
use syn::*;

#[proc_macro_attribute]
pub fn betterncm_native_call(_attr: TokenStream, input: TokenStream) -> TokenStream {
    let mut func: ItemFn = syn::parse(input).unwrap();
    let original_func_name = func.sig.ident.to_owned();
    let wrapper_func_name = format!("{original_func_name}_wrapper");
    let original_func_ident = format_ident!("{}", original_func_name);
    let wrapper_func_ident = format_ident!("{}", wrapper_func_name);

    let mut wrapper: ItemFn = syn::parse(
        quote! {
            unsafe extern "C" fn #original_func_ident (raw_args_input : *const *mut ::core::ffi::c_void) -> *mut ::core::ffi::c_char {}
        }
        .into(),
    )
    .unwrap();

    func.sig.ident = Ident::new(&wrapper_func_name, original_func_name.span());

    let argn = func.sig.inputs.len();
    let has_return = matches!(func.sig.output, ReturnType::Type(..));

    wrapper.block.stmts.push(Stmt::Item(Item::Fn(func)));
    wrapper.block.stmts.push(
        syn::parse(
            quote! { let raw_args_input = ::core::slice::from_raw_parts(raw_args_input, #argn); }
                .into(),
        )
        .unwrap(),
    );

    for i in 0..argn {
        let argname = format_ident!("arg_{}", i);
        wrapper.block.stmts.push(
            syn::parse(
                quote! { let #argname = ::cef::CefV8Value::from_raw(raw_args_input[#i] as *mut _).into(); }
                    .into(),
            )
            .unwrap(),
        );
    }

    if has_return {
        let mut wrapper_call: ExprCall =
            syn::parse(quote! { #wrapper_func_ident () }.into()).unwrap();

        for i in 0..argn {
            let argname = format_ident!("arg_{}", i);
            wrapper_call
                .args
                .push(syn::parse(quote! { #argname }.into()).unwrap());
        }

        wrapper
            .block
            .stmts
            .push(Stmt::Expr(Expr::Call(wrapper_call)));
    } else {
        let mut wrapper_call: ExprCall =
            syn::parse(quote! { #wrapper_func_ident () }.into()).unwrap();

        for i in 0..argn {
            let argname = format_ident!("arg_{}", i);
            wrapper_call
                .args
                .push(syn::parse(quote! { #argname }.into()).unwrap());
        }

        wrapper
            .block
            .stmts
            .push(Stmt::Semi(Expr::Call(wrapper_call), Default::default()));

        wrapper
            .block
            .stmts
            .push(syn::parse(quote! { return ::core::ptr::null_mut(); }.into()).unwrap());
    }

    let func = wrapper.into_token_stream();

    // println!("{}", func);
    func.into()
}

/// 用于 BetterNCM Loader 定义 API，请勿使用该宏
#[proc_macro_attribute]
pub fn betterncm_native_api(attr: TokenStream, input: TokenStream) -> TokenStream {
    let attr = parse_macro_input!(attr as AttributeArgs);
    let func_name = attr
        .iter()
        .find(|x| {
            if let NestedMeta::Meta(Meta::NameValue(v)) = x {
                v.path.to_token_stream().to_string() == "name"
            } else {
                false
            }
        })
        .and_then(|x| {
            if let NestedMeta::Meta(Meta::NameValue(v)) = x {
                if let Lit::Str(s) = &v.lit {
                    Some(s.to_owned())
                } else {
                    None
                }
            } else {
                None
            }
        })
        .expect("找不到函数路径名");

    let mut func: ItemFn = syn::parse(input).unwrap();
    let original_func_name = func.sig.ident.to_owned();
    // 原始函数 的别名
    let wrapper_func_name = format!("{original_func_name}_wrapper");
    // 处理参数的函数 的别名
    let inner_func_name = format!("{original_func_name}_inner");
    let original_func_ident = format_ident!("{}", original_func_name);
    let wrapper_func_ident = format_ident!("{}", wrapper_func_name);
    let inner_func_ident = format_ident!("{}", inner_func_name);

    let mut wrapper: ItemFn = syn::parse(
        quote! {
            #[inline]
            const fn #original_func_ident () -> crate::api::NativeAPIDesc {}
        }
        .into(),
    )
    .unwrap();

    wrapper.vis = func.vis.to_owned();

    // 生成处理参数的函数

    let mut inner: ItemFn = syn::parse(
        quote! {
            #[inline]
            fn #inner_func_ident (orig_args: &[*mut ::cef_sys::cef_v8value_t]) -> ::anyhow::Result<::cef::CefV8Value> {}
        }
        .into(),
    )
    .unwrap();

    let this_object = func
        .sig
        .inputs
        .first()
        .and_then(|x| {
            if let FnArg::Typed(t) = x {
                Some(t)
            } else {
                None
            }
        })
        .map(|x| x.pat.to_token_stream().to_string() == "this")
        .unwrap_or(false);

    func.sig.ident = Ident::new(&wrapper_func_name, original_func_name.span());

    let argn = func.sig.inputs.len();
    let return_type = func.sig.output.to_owned();
    let has_return = matches!(func.sig.output, ReturnType::Type(..));

    inner.block.stmts.push(Stmt::Item(Item::Fn(func)));

    // let argn_error_string = LitStr::new(
    //     &format!(
    //         "参数数量不正确，需要 {} 个参数，实际输入了 {{}} 个参数",
    //         if this_object { argn - 1 } else { argn }
    //     ),
    //     Span::call_site().into(),
    // );
    // ::anyhow::ensure!(orig_args.len() >= #argn, #argn_error_string, orig_args.len() - 1);
    // ::anyhow::ensure!(orig_args.len() >= #argn, #argn_error_string, orig_args.len());
    let mut unsafe_block: ExprUnsafe = syn::parse({
        quote! {
            unsafe {
                use ::anyhow::*;
            }
        }
        .into()
    })
    .unwrap();

    for i in 0..argn {
        let argname = format_ident!("arg_{}", i);
        let error_string = LitStr::new(
            &format!("没有提供第 {} 个参数", if this_object { i } else { i + 1 }),
            Span::call_site().into(),
        );
        let type_error_string = LitStr::new(
            &format!(
                "第 {} 个参数类型不正确",
                if this_object { i } else { i + 1 }
            ),
            Span::call_site().into(),
        );
        unsafe_block.block.stmts.push(
            syn::parse(
                quote! {
                    let #argname = {
                        let arg = orig_args
                            .get(#i)
                            .map(|x| ::cef::CefV8Value::from_raw(*x))
                            .unwrap_or_else(|| ::cef::CefV8Value::new_undefined());
                        let arg_type = arg.get_js_type();
                        arg
                            .try_into()
                            .context(#type_error_string)
                    }?;
                }
                .into(),
            )
            .unwrap(),
        );
    }

    if has_return {
        let mut wrapper_call: ExprCall =
            syn::parse(quote! { #wrapper_func_ident () }.into()).unwrap();

        for i in 0..argn {
            let argname = format_ident!("arg_{}", i);
            wrapper_call
                .args
                .push(syn::parse(quote! { #argname }.into()).unwrap());
        }

        let type_error_string = if let ReturnType::Type(_, return_type) = &return_type {
            LitStr::new(
                &format!(
                    "无法将该 {} 类型转换成 V8Value",
                    return_type.to_token_stream().to_string().replace(' ', "")
                ),
                Span::call_site().into(),
            )
        } else {
            LitStr::new(
                &format!(
                    "无法将该 {} 类型转换成 V8Value",
                    return_type.to_token_stream().to_string().replace(' ', "")
                ),
                Span::call_site().into(),
            )
        };

        let wrapper_call: ExprReturn = syn::parse(
            quote! { return Ok((#wrapper_call)?.try_into().context(#type_error_string)?) }.into(),
        )
        .unwrap();

        unsafe_block
            .block
            .stmts
            .push(Stmt::Expr(Expr::Return(wrapper_call)));
    } else {
        let mut wrapper_call: ExprCall =
            syn::parse(quote! { #wrapper_func_ident () }.into()).unwrap();

        for i in 0..argn {
            let argname = format_ident!("arg_{}", i);
            wrapper_call
                .args
                .push(syn::parse(quote! { #argname }.into()).unwrap());
        }

        unsafe_block
            .block
            .stmts
            .push(Stmt::Semi(Expr::Call(wrapper_call), Default::default()));

        unsafe_block.block.stmts.push(
            syn::parse(
                quote! { return ::anyhow::Result::Ok(::cef::CefV8Value::new_undefined()); }.into(),
            )
            .unwrap(),
        );
    }

    inner
        .block
        .stmts
        .push(Stmt::Expr(Expr::Unsafe(unsafe_block)));

    wrapper.block.stmts.push(Stmt::Item(Item::Fn(inner)));

    if this_object {
        wrapper.block.stmts.push(
            syn::parse(
                quote! { return crate::api::NativeAPIDesc {
                    name: #func_name ,
                    this_object: true,
                    function: #inner_func_ident,
                } ; }
                .into(),
            )
            .unwrap(),
        );
    } else {
        wrapper.block.stmts.push(
            syn::parse(
                quote! { return crate::api::NativeAPIDesc {
                    name: #func_name ,
                    this_object: false,
                    function: #inner_func_ident,
                } ; }
                .into(),
            )
            .unwrap(),
        );
    }

    let func = wrapper.into_token_stream();

    // eprintln!(
    //     "{}",
    //     prettyplease::unparse(&syn::parse_file(func.to_string().as_str()).unwrap())
    // );

    func.into()
}
