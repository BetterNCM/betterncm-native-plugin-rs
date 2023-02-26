use std::{
    future::{ready, Ready},
    io::ErrorKind,
    path::PathBuf,
    sync::atomic::AtomicU16,
};

use actix_web::{dev::*, error::ErrorForbidden, web::PayloadConfig, *};
use once_cell::sync::Lazy;
use serde::*;
use tracing::*;

#[derive(Debug, Deserialize)]
struct FileQuery {
    path: String,
}

#[post("/fs/write_file")]
async fn write_file(path: web::Query<FileQuery>, body: web::Bytes) -> Result<impl Responder> {
    let path = PathBuf::from(&path.path);

    info!("正在写入文件到 {}", path.to_string_lossy());

    if let Some(path) = path.parent() {
        let _ = tokio::fs::create_dir_all(path).await;
    }

    tokio::fs::write(&path, body).await?;

    info!("写入文件完成 {}", path.to_string_lossy());

    Ok(HttpResponse::Ok())
}

#[get("/fs/read_file")]
async fn read_file(path: web::Query<FileQuery>) -> Result<actix_files::NamedFile> {
    info!("正在读取文件 {}", path.path);

    let path = PathBuf::from(&path.path);

    Ok(actix_files::NamedFile::open(path)?)
}

#[get("/test/url/{name}")]
async fn test_url(name: web::Path<String>) -> impl Responder {
    format!("test {}", name)
}

pub static HTTP_SERVER_API_KEY: Lazy<String> = Lazy::new(|| {
    rand::Rng::sample_iter(rand::thread_rng(), &rand::distributions::Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
});
pub static HTTP_SERVER_PORT: AtomicU16 = AtomicU16::new(58412);

pub struct APIKeyCheck;

impl<S, B> Transform<S, ServiceRequest> for APIKeyCheck
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = APIKeyCheckMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(APIKeyCheckMiddleware { service }))
    }
}

pub struct APIKeyCheckMiddleware<S> {
    service: S,
}

pub type LocalBoxFuture<'a, T> = std::pin::Pin<Box<dyn std::future::Future<Output = T> + 'a>>;

impl<S, B> Service<ServiceRequest> for APIKeyCheckMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        if let Some(key) = req.headers().get("BETTERNCM_API_KEY") {
            if let Ok(key) = key.to_str() {
                if key == HTTP_SERVER_API_KEY.as_str() {
                    let fut = self.service.call(req);
                    return Box::pin(async move { fut.await });
                }
            }
        }

        Box::pin(async { Err(ErrorForbidden("")) })
    }
}

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

        let result = HttpServer::new(|| {
            App::new()
                .app_data(PayloadConfig::new(usize::MAX))
                .wrap(APIKeyCheck)
                .service(web::scope("/api").service(write_file).service(read_file))
        })
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
