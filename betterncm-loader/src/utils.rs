use std::{
    io::{Read, Seek},
    path::Path,
};

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
