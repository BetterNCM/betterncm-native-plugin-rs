use std::{io::ErrorKind, sync::atomic::AtomicU16};

use actix_web::*;
use tracing::*;

#[get("/test/url/{name}")]
async fn test_url(name: web::Path<String>) -> impl Responder {
    format!("test {}", name)
}

pub static HTTP_SERVER_PORT: AtomicU16 = AtomicU16::new(58412);

async fn async_http_server_main() -> anyhow::Result<()> {
    loop {
        let port = HTTP_SERVER_PORT.load(std::sync::atomic::Ordering::SeqCst);
        let cert = rcgen::generate_simple_self_signed([format!("localhost:{port}")])?;

        let key = cert.serialize_private_key_der();
        let cert = cert.serialize_der()?;

        info!("正在尝试开放在端口 {}", port);

        let ssl_builder = rustls::ServerConfig::builder()
            .with_safe_default_cipher_suites()
            .with_safe_default_kx_groups()
            .with_safe_default_protocol_versions()?
            .with_no_client_auth()
            .with_single_cert(vec![rustls::Certificate(cert)], rustls::PrivateKey(key))?;

        let result = HttpServer::new(|| App::new().service(test_url))
            .bind_rustls(("localhost", port), ssl_builder)?
            .run()
            .await;
        if let Err(err) = result {
            if !matches!(err.kind(), ErrorKind::AddrInUse) {
                HTTP_SERVER_PORT.store(
                    rand::random::<u16>().clamp(25565, 0xFFFF),
                    std::sync::atomic::Ordering::SeqCst,
                );
                anyhow::bail!(err)
            }
        } else {
            break;
        }
    }

    Ok(())
}

fn http_server_main() -> anyhow::Result<()> {
    info!("正在启动 HTTP 后端服务器！");

    rt::System::new().block_on(async_http_server_main())?;
    Ok(())
}

pub fn init_http_server() -> anyhow::Result<()> {
    std::thread::Builder::new()
        .name("HTTPBackendThread".into())
        .spawn(http_server_main)?;

    Ok(())
}
