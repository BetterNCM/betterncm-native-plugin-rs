#![allow(non_upper_case_globals)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(clippy::type_complexity)]
#![allow(clippy::missing_safety_doc)]

type std_string = cxx::CxxString;

#[link(name = "libcef", kind = "static")]
extern "C" {}

include!(concat!(env!("OUT_DIR"), "/bindings.rs"));
