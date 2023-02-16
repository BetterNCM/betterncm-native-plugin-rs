// orpheus://orpheus/pub/app.html

pub fn on_test_url_hijack(url: &str) -> bool {
    if url.starts_with("orpheus://orpheus/pub/app.html") || url.starts_with("mrbncm://") {
        return true;
    }
    false
}

pub fn on_process_url_data(url: &str, data: Vec<u8>) -> Vec<u8> {
    if url.starts_with("orpheus://orpheus/pub/app.html") {
        if let Ok(data) = String::from_utf8(data) {
            let document = nipper::Document::from(&data);

            document.select("meta[http-equiv=\"Content-Security-Policy\"]").set_attr("content", 
            "default-src * mrbncm: data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval';\
            script-src * mrbncm: data: blob: 'unsafe-inline' 'unsafe-eval';\
            connect-src * mrbncm: data: blob: 'unsafe-inline';\
            img-src * mrbncm: data: blob: 'unsafe-inline';\
            frame-src * mrbncm: data: blob:;\
            style-src * mrbncm: data: blob: 'unsafe-inline';\
            font-src * mrbncm: data: blob: 'unsafe-inline';\
            frame-ancestors * data: blob: 'unsafe-inline';");

            return document.html().to_string().into_bytes();
        }
    }
    vec![]
}
