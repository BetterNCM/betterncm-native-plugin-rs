// orpheus://orpheus/pub/app.html

pub fn on_test_url_hijack(url: &str) -> bool {
    if url.starts_with("orpheus://orpheus/pub/app.html") || url.starts_with("mrbncm://") {
        return true;
    }
    for key in crate::plugins::HIJACKS_MAP.keys() {
        if url.starts_with(key) {
            return true;
        }
    }
    false
}

const SPLASH_SCREEN_HTML: &str = include_str!("../resources/splash-screen.html");

pub fn on_process_url_data(url: &str, data: Vec<u8>) -> Vec<u8> {
    let mut result = data;
    if let Ok(mut data) = String::from_utf8(result.to_owned()) {
        if url.starts_with("orpheus://orpheus/pub/app.html") {
            let document = nipper::Document::from(&data);

            document.select("body").append_html(SPLASH_SCREEN_HTML);

            document.select("meta[http-equiv=\"Content-Security-Policy\"]").set_attr("content", 
            "default-src * mrbncm: data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval';\
            script-src * mrbncm: data: blob: 'unsafe-inline' 'unsafe-eval';\
            connect-src * mrbncm: data: blob: 'unsafe-inline';\
            img-src * mrbncm: data: blob: 'unsafe-inline';\
            frame-src * mrbncm: data: blob:;\
            style-src * mrbncm: data: blob: 'unsafe-inline';\
            font-src * mrbncm: data: blob: 'unsafe-inline';\
            frame-ancestors * data: blob: 'unsafe-inline';");

            data = document.html().to_string();
        }

        for (key, hijacks) in crate::plugins::HIJACKS_MAP.iter() {
            if url.starts_with(key) {
                for hijack in hijacks {
                    match hijack.hijack_type.as_str() {
                        "replace" => {
                            data = data.replace(hijack.from.as_str(), hijack.to.as_str());
                            // tracing::debug!(
                            //     "已执行 Hijack 替换 {} 中的 {} -> {}",
                            //     url,
                            //     hijack.from,
                            //     hijack.to
                            // );
                        }
                        "append" => {
                            data.push_str(hijack.code.as_str());
                            // tracing::debug!("已执行 Hijack 增加尾部 {} {}", url, hijack.code);
                        }
                        "prepend" => {
                            let mut tmp = hijack.code.to_owned();
                            tmp.reserve(tmp.len() + data.len());
                            tmp.push_str(data.as_str());
                            data = tmp;
                            // tracing::debug!("已执行 Hijack 增加头部 {} {}", url, hijack.code);
                        }
                        other => {
                            tracing::warn!("警告：未知的 Hijack 方式：{other}");
                        }
                    }
                }
            }
        }

        result = data.into_bytes();
    }
    result
}
