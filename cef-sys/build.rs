use bindgen::*;

fn main() {
    let files = std::fs::read_dir("../BetterNCM/src/3rd/libcef/include")
        .unwrap()
        .map(|x| x.unwrap())
        .filter(|x| x.path().is_file())
        .map(|x| format!("#include \"include/{}\"", x.file_name().to_string_lossy()))
        .collect::<Vec<_>>();

    let capi_files = std::fs::read_dir("../BetterNCM/src/3rd/libcef/include/capi")
        .unwrap()
        .map(|x| x.unwrap())
        .filter(|x| x.path().is_file())
        .map(|x| {
            format!(
                "#include \"include/capi/{}\"",
                x.file_name().to_string_lossy()
            )
        })
        .collect::<Vec<_>>();

    let out_path = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap());

    Builder::default()
        .header_contents(
            "wrapper.hpp",
            &format!(
                "{}\nextern \"C\" {{\n{}\n}}",
                files.join("\n"),
                capi_files.join("\n")
            ),
        )
        .use_core()
        .merge_extern_blocks(true)
        .size_t_is_usize(true)
        .respect_cxx_access_specs(true)
        .translate_enum_integer_types(true)
        .rustfmt_bindings(true)
        .generate_inline_functions(true)
        .generate_comments(true)
        .clang_arg("-I../BetterNCM/src/3rd/libcef")
        .allowlist_file("cef_.*")
        .allowlist_type("Cef.*")
        .allowlist_type("cef.*")
        .allowlist_type("CEF.*")
        .allowlist_var("cef.*")
        .allowlist_var("Cef.*")
        .allowlist_var("CEF.*")
        .allowlist_function("cef_.*")
        .allowlist_function("CEF.*")
        .allowlist_function("Cef.*")
        .blocklist_function("CefGetExtensionsForMimeType")
        .opaque_type("cef::logging::LogMessage")
        .blocklist_item("cef::logging::.*")
        .opaque_type("CefDictionaryValue_KeyList")
        .opaque_type("CefDOMNode_AttributeMap")
        .opaque_type("CefRequest_HeaderMap")
        .opaque_type("CefPostData_ElementVector")
        .opaque_type("CefX509Certificate_IssuerChainBinaryList")
        .opaque_type("CefPrintSettings_PageRangeList")
        .opaque_type("CefRenderHandler_RectList")
        .opaque_type("CefResponse_HeaderMap")
        .opaque_type("CefRequestHandler_X509CertificateList")
        .opaque_type("CefCommandLine_ArgumentList")
        .opaque_type("CefCommandLine_SwitchMap")
        .opaque_type("CefV8ValueList")
        .opaque_type("CefServer_HeaderMap")
        .blocklist_function("LogMessage_.*")
        .blocklist_function("CefString.*to_string16")
        .blocklist_function("CefString.*from_string16")
        .blocklist_function("CefString.*to_wstring")
        .blocklist_function("CefString.*from_wstring")
        .blocklist_function("std.*")
        .blocklist_function("std::.*")
        .blocklist_function("root::std.*")
        .blocklist_item("std.*")
        .blocklist_item("std::.*")
        .blocklist_item("root::std::.*")
        .blocklist_type("std.*")
        .blocklist_type("std::.*")
        .parse_callbacks(Box::new(CargoCallbacks))
        .generate()
        .unwrap()
        .write_to_file(out_path.join("bindings.rs"))
        .unwrap();
}
