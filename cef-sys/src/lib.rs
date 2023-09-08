#![allow(non_upper_case_globals)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(clippy::type_complexity)]
#![allow(clippy::missing_safety_doc)]
#![allow(rustdoc::broken_intra_doc_links)]

#[cfg(all(
    target_arch = "x86_64",
    target_vendor = "pc",
    target_family = "windows"
))]
#[link(name = "libcef_x64", kind = "static")]
extern "C" {}

#[cfg(all(target_arch = "x86", target_vendor = "pc", target_family = "windows"))]
#[link(name = "libcef", kind = "static")]
extern "C" {}

#[cfg(all(
    target_arch = "x86_64",
    target_vendor = "pc",
    target_family = "windows",
    target_env = "msvc"
))]
include!("./bindings_x86_64_pc_windows_msvc.rs");

#[cfg(all(
    target_arch = "x86",
    target_vendor = "pc",
    target_family = "windows",
    target_env = "msvc"
))]
include!("./bindings_i686_pc_windows_msvc.rs");
