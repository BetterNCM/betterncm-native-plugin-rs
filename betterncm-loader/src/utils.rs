use std::{
    io::{Read, Seek},
    path::Path,
};

use windows::Win32::{
    Foundation::CloseHandle,
    Storage::FileSystem::{
        GetFileVersionInfoSizeW, GetFileVersionInfoW, VerQueryValueW, VS_FIXEDFILEINFO,
    },
    System::{Diagnostics::ToolHelp::*, Threading::GetCurrentProcessId},
};

pub fn get_ncm_version() -> semver::Version {
    unsafe {
        let exe_file = dbg!(std::env::current_exe()
            .unwrap()
            .to_string_lossy()
            .to_string());
        let exe_file = windows::core::HSTRING::from(exe_file);
        let mut ver_handle = 0;
        let ver_size = GetFileVersionInfoSizeW(&exe_file, Some(&mut ver_handle));

        if ver_size != 0 {
            let mut data = vec![0u8; ver_size as usize];
            if GetFileVersionInfoW(&exe_file, ver_handle, ver_size, data.as_mut_ptr() as _)
                .as_bool()
            {
                let mut size = 0;
                let mut info: *mut VS_FIXEDFILEINFO = std::ptr::null_mut();
                if dbg!(VerQueryValueW(
                    data.as_mut_ptr() as _,
                    windows::w!("\\"),
                    &mut info as *mut _ as _,
                    &mut size,
                )
                .as_bool())
                    && size != 0
                {
                    if let Some(info) = info.as_ref() {
                        if dbg!(info).dwSignature == 0xFEEF04BD {
                            let major_ver = (info.dwFileVersionMS >> 16) & 0xFFFF;
                            let minor_ver = info.dwFileVersionMS & 0xFFFF;
                            let build_ver = (info.dwFileVersionLS >> 16) & 0xFFFF;
                            return semver::Version::new(
                                major_ver as _,
                                minor_ver as _,
                                build_ver as _,
                            );
                        }
                    }
                }
            }
        }
        semver::Version::new(0, 0, 0)
    }
}

pub fn get_parent_pid() -> u32 {
    let mut pid = 0;
    unsafe {
        let current_pid = GetCurrentProcessId();

        if let Ok(h_snapshot) = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
            struct ProcessEntry {
                pid: u32,
                parent_pid: u32,
                exe_file: String,
            }
            let mut tmp = Vec::with_capacity(256);
            let mut process_entry = PROCESSENTRY32W {
                dwSize: std::mem::size_of::<PROCESSENTRY32W>() as _,
                ..Default::default()
            };

            if Process32FirstW(h_snapshot, &mut process_entry).as_bool() {
                loop {
                    let exe_len = process_entry
                        .szExeFile
                        .iter()
                        .enumerate()
                        .find(|x| *x.1 == 0)
                        .map(|x| x.0)
                        .unwrap_or(process_entry.szExeFile.len());
                    let exe_file = String::from_utf16_lossy(&process_entry.szExeFile[..exe_len]);
                    tmp.push(ProcessEntry {
                        pid: process_entry.th32ProcessID,
                        parent_pid: process_entry.th32ParentProcessID,
                        exe_file,
                    });
                    if !Process32NextW(h_snapshot, &mut process_entry).as_bool() {
                        break;
                    }
                }
            }

            CloseHandle(h_snapshot);

            let mut cur_index = tmp
                .iter()
                .enumerate()
                .find(|x| x.1.pid == current_pid)
                .map(|x| x.0)
                .unwrap_or(usize::MAX);

            if cur_index != usize::MAX {
                cur_index = tmp
                    .iter()
                    .enumerate()
                    .find(|x| x.1.pid == tmp[cur_index].parent_pid)
                    .map(|x| x.0)
                    .unwrap_or(usize::MAX);
                while cur_index != usize::MAX {
                    if tmp[cur_index].exe_file == "cloudmusic.exe" {
                        pid = tmp[cur_index].pid;
                        break;
                    }
                    cur_index = tmp
                        .iter()
                        .enumerate()
                        .find(|x| x.1.pid == tmp[cur_index].parent_pid)
                        .map(|x| x.0)
                        .unwrap_or(usize::MAX);
                }
            }
        }
        pid
    }
}

pub fn unzip_inner(f: impl Read + Seek, unzip_dir: impl AsRef<Path>) {
    if let Ok(mut zipfile) = zip::ZipArchive::new(f) {
        for i in 0..zipfile.len() {
            if let Ok(mut entry) = zipfile.by_index(i) {
                let extract_path = unzip_dir.as_ref().join(entry.name());
                let mut extract_dir = extract_path.to_owned();
                extract_dir.pop();
                let _ = std::fs::create_dir_all(extract_dir);
                if let Ok(mut dest) = std::fs::OpenOptions::new()
                    .write(true)
                    .truncate(true)
                    .create(true)
                    .open(extract_path)
                {
                    let _ = std::io::copy(&mut entry, &mut dest);
                }
            }
        }
    }
}

pub fn unzip_file(file_path: impl AsRef<Path>, unzip_dir: impl AsRef<Path>) {
    if let Ok(file) = std::fs::File::open(file_path) {
        unzip_inner(file, unzip_dir);
    }
}

pub fn unzip_data(data: impl AsRef<[u8]>, unzip_dir: impl AsRef<Path>) {
    unzip_inner(std::io::Cursor::new(data.as_ref()), unzip_dir);
}
