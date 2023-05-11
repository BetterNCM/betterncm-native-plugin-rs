use proc_macro::TokenStream;
use quote::{format_ident, quote, ToTokens};
use syn::*;

pub fn betterncm_main(_attr: TokenStream, input: TokenStream) -> TokenStream {
    let func: ItemFn = syn::parse(input).unwrap();

    let original_func_name = func.sig.ident.to_owned();
    let wrapper_func_name = format!("{original_func_name}_wrapper");
    let original_func_ident = format_ident!("{}", original_func_name);
    let wrapper_func_ident = format_ident!("{}", wrapper_func_name);

    let wrapper: ItemFn = syn::parse(
        quote! {
            #[export_name = "BetterNCMPluginMain"]
            unsafe extern "C" fn #wrapper_func_ident (ctx: *mut ::core::ffi::c_void) -> ::core::ffi::c_int {
                let ctx = ::betterncm_plugin_api::PluginContext::from_raw(ctx as _);
                #original_func_ident (ctx);
                1
            }
        }.into(),
    ).unwrap();

    let mut result = func.into_token_stream();
    result.extend(wrapper.into_token_stream());

    // eprintln!(
    //     "{}",
    //     prettyplease::unparse(&syn::parse_file(result.to_string().as_str()).unwrap())
    // );

    result.into()
}
