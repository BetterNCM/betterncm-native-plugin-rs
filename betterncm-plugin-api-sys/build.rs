use std::path::Path;

use bindgen::*;

fn main() {
    let dir = std::env::var("CARGO_MANIFEST_DIR").unwrap();
    let header = Path::new(&dir).join("../BetterNCM/src/BetterNCMNativePlugin.h");
    let header = header.to_string_lossy();
    let out_path = std::path::PathBuf::from(std::env::var("OUT_DIR").unwrap());

    eprintln!("{}", out_path.join("bindings.rs").display());

    Builder::default()
        .header(header.clone())
        .use_core()
        .clang_arg("-I../BetterNCM/src")
        .merge_extern_blocks(true)
        .size_t_is_usize(true)
        .default_enum_style(EnumVariation::Rust {
            non_exhaustive: false,
        })
        .respect_cxx_access_specs(true)
        .translate_enum_integer_types(true)
        .rustfmt_bindings(true)
        .generate_inline_functions(true)
        .generate_comments(true)
        .clang_arg("-fparse-all-comments")
        .parse_callbacks(Box::new(CargoCallbacks))
        .generate()
        .unwrap()
        .write_to_file(out_path.join("bindings.rs"))
        .unwrap();
}
