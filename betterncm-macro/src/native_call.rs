use proc_macro::TokenStream;
use quote::{format_ident, quote, ToTokens};
use syn::*;

/// 生成用于对接插件的原始函数宏
pub fn betterncm_native_call(_attr: TokenStream, input: TokenStream) -> TokenStream {
    let mut func: ItemFn = syn::parse(input).unwrap();
    let original_func_name = func.sig.ident.to_owned();
    let wrapper_func_name = format!("{original_func_name}_wrapper");
    let desc_func_ident = format_ident!("{}", original_func_name);
    let original_func_ident = format_ident!("{}_original", original_func_name);
    let wrapper_func_ident = format_ident!("{}_wrapper", original_func_name);

    let mut func_wrapper: ItemFn = syn::parse(
        quote! {
            unsafe extern "C" fn #original_func_ident (raw_args_input : *mut *mut ::core::ffi::c_void) -> *mut ::core::ffi::c_char {}
        }
        .into(),
    )
    .unwrap();

    func.sig.ident = Ident::new(&wrapper_func_name, original_func_name.span());

    let argn = func.sig.inputs.len();
    let has_return = matches!(func.sig.output, ReturnType::Type(..));

    func_wrapper.block.stmts.push(Stmt::Item(Item::Fn(func)));
    func_wrapper.block.stmts.push(
        syn::parse(
            quote! { let raw_args_input = ::core::slice::from_raw_parts(raw_args_input, #argn); }
                .into(),
        )
        .unwrap(),
    );

    for i in 0..argn {
        let argname = format_ident!("arg_{}", i);
        func_wrapper.block.stmts.push(
            syn::parse(
                quote! { let #argname = ::cef::CefV8Value::from_raw(raw_args_input[#i] as *mut _).try_into().unwrap(); }
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

        func_wrapper
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

        func_wrapper
            .block
            .stmts
            .push(Stmt::Semi(Expr::Call(wrapper_call), Default::default()));

        func_wrapper
            .block
            .stmts
            .push(syn::parse(quote! { return ::core::ptr::null_mut(); }.into()).unwrap());
    }

    // Wrap into desc

    let desc_func_wrapper: ItemFn = syn::parse(
        quote! {
            pub(crate) fn #desc_func_ident () -> &'static ::betterncm_plugin_api::NativeFunctionDescription {
                & ::betterncm_plugin_api::NativeFunctionDescription {
                    function: #original_func_ident,
                    identifier: ::core::stringify!(#original_func_name),
                    args_num: #argn,
                }
            }
        }
        .into(),
    )
    .unwrap();

    let mut func = func_wrapper.into_token_stream();

    func.extend(desc_func_wrapper.into_token_stream());

    // eprintln!(
    //     "{}",
    //     prettyplease::unparse(&syn::parse_file(func.to_string().as_str()).unwrap())
    // );

    func.into()
}
