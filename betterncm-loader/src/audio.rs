use std::{
    io::{Cursor, Read, Write},
    sync::{atomic::AtomicUsize, mpsc::Sender, Arc, Condvar, Mutex},
    time::{Duration, Instant},
};

use audioviz::spectrum::{config::*, stream::Stream};
use byteorder::{ReadBytesExt, WriteBytesExt, LE};
use interprocess::local_socket::LocalSocketStream;
use once_cell::sync::Lazy;
use tracing::*;

use crate::{ProcessType, PROCESS_TYPE};

const AUDIO_FFT_DATA_LEN: usize = 128;

static mut AUDIO_FFT_DATA: Lazy<Vec<f32>> = Lazy::new(|| vec![0.0; AUDIO_FFT_DATA_LEN]);
static AUDIO_FFT_COUNTER: AtomicUsize = AtomicUsize::new(0);
static AUDIO_FFT_CHANGED_NOTIFIER: Lazy<Arc<(Mutex<bool>, Condvar)>> =
    Lazy::new(|| Arc::new((Mutex::new(false), Condvar::new())));

pub fn add_fft_counter() {
    AUDIO_FFT_COUNTER.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
    let notifier = AUDIO_FFT_CHANGED_NOTIFIER.clone();
    notifier.1.notify_all();
}

pub fn sub_fft_counter() {
    let c = get_fft_counter();
    if c > 0 {
        AUDIO_FFT_COUNTER.fetch_sub(1, std::sync::atomic::Ordering::SeqCst);
    }
}

pub fn get_fft_counter() -> usize {
    AUDIO_FFT_COUNTER.load(std::sync::atomic::Ordering::SeqCst)
}

pub fn get_fft_data() -> &'static Vec<f32> {
    unsafe { &AUDIO_FFT_DATA }
}

fn get_fft_data_mut() -> &'static mut Vec<f32> {
    unsafe { &mut AUDIO_FFT_DATA }
}

#[derive(Debug, Clone)]
pub enum AudioThreadMessage {
    PushAudioBuffer(Vec<u8>),
    SetAudioInfo(AudioInfo),
    // Stop,
}

#[derive(Debug, Clone, Copy, PartialEq)]
#[repr(u32)]
pub enum AudioFormat {
    Unknown = 0,
    PCMInt32 = 0b1,
    PCMFloat32 = 0b10,
    PCMInt16 = 0b100,
    PCMInt8 = 0b1000,
}

impl Default for AudioFormat {
    fn default() -> Self {
        Self::Unknown
    }
}

impl From<u32> for AudioFormat {
    fn from(value: u32) -> Self {
        match value {
            0b1 => Self::PCMInt32,
            0b10 => Self::PCMFloat32,
            0b100 => Self::PCMInt16,
            0b1000 => Self::PCMInt8,
            _ => Self::Unknown,
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct AudioInfo {
    pub format: AudioFormat,
    pub samples_per_sec: u32,
    pub channel_amount: u16,
}

impl AudioInfo {
    fn has_zero(&self) -> bool {
        self.format == AudioFormat::Unknown || self.samples_per_sec == 0 || self.channel_amount == 0
    }

    fn get_bits_per_sample(&self) -> usize {
        match self.format {
            AudioFormat::Unknown => 0,
            AudioFormat::PCMInt32 => 32,
            AudioFormat::PCMFloat32 => 32,
            AudioFormat::PCMInt16 => 16,
            AudioFormat::PCMInt8 => 8,
        }
    }
}

// 仅主进程
static mut AUDIO_THREAD_SENDER: Option<Sender<AudioThreadMessage>> = None;

pub fn get_audio_thread_sender() -> &'static Option<Sender<AudioThreadMessage>> {
    unsafe { &AUDIO_THREAD_SENDER }
}

const PUSH_AUDIO_BUFFER_MAGIC: u32 = 0x1F427593;
const SET_AUDIO_INFO_MAGIC: u32 = 0xA524B8C6;
const HEARTBEAT_MAGIC: u32 = 0x12A8F46D;

pub fn main_audio_thread() {
    let (sx, rx) = std::sync::mpsc::channel();
    unsafe {
        AUDIO_THREAD_SENDER = Some(sx);
    }
    let pid = std::process::id();
    let server =
        interprocess::local_socket::LocalSocketListener::bind(format!("mrbncm-main-{pid}"))
            .unwrap();
    server.set_nonblocking(true).unwrap();
    let mut current_audio_info = AudioInfo {
        format: AudioFormat::Unknown,
        samples_per_sec: 0,
        channel_amount: 0,
    };
    let mut clients: Vec<LocalSocketStream> = Vec::with_capacity(4);
    while let Ok(msg) = rx.recv() {
        while let Ok(client) = server.accept() {
            info!("新子进程连接 {}", client.peer_pid().unwrap_or_default());
            client.set_nonblocking(false).unwrap();
            clients.push(client);
            clients.retain_mut(|x| x.write_u32::<LE>(HEARTBEAT_MAGIC).is_ok());
            if !current_audio_info.has_zero() {
                for client in &mut clients {
                    let _ = client.write_u32::<LE>(SET_AUDIO_INFO_MAGIC);
                    let _ = client.write_u32::<LE>(current_audio_info.format as u32);
                    let _ = client.write_u32::<LE>(current_audio_info.samples_per_sec);
                    let _ = client.write_u16::<LE>(current_audio_info.channel_amount);
                    let _ = client.flush();
                }
            }
        }
        let mut send_audio_info = |audio_info: &AudioInfo| {
            if !audio_info.has_zero() {
                for client in &mut clients {
                    let _ = client.write_u32::<LE>(SET_AUDIO_INFO_MAGIC);
                    let _ = client.write_u32::<LE>(current_audio_info.format as u32);
                    let _ = client.write_u32::<LE>(audio_info.samples_per_sec);
                    let _ = client.write_u16::<LE>(audio_info.channel_amount);
                    let _ = client.flush();
                }
            }
        };
        match msg {
            AudioThreadMessage::PushAudioBuffer(buf) => {
                // debug!("接收到新音频缓冲 {}", buf.len());
                send_audio_info(&current_audio_info);
                for client in &mut clients {
                    let _ = client.write_u32::<LE>(PUSH_AUDIO_BUFFER_MAGIC);
                    let _ = client.write_u32::<LE>(buf.len() as _);
                    let _ = client.write_all(&buf);
                    let _ = client.flush();
                }
                // debug!("音频缓冲发送完毕");
            }
            AudioThreadMessage::SetAudioInfo(info) => {
                info!("当前音频信息为 {:#?}", info);
                send_audio_info(&info);
                current_audio_info = info;
            } // AudioThreadMessage::Stop => {
              //     break;
              // }
        }
    }
    info!("音频流转发线程已停止");
}

fn renderer_audio_thread() {
    let parent_pid = crate::utils::get_parent_pid();
    let mut retried = 0;
    // let (sx, rx) = std::sync::mpsc::channel::<Vec<f32>>();
    // let _ = std::thread::Builder::new()
    //     .name("bncm-audio-fft-thread".into())
    //     .spawn(move || while let Ok(buf) = rx.recv() {

    //     });
    let notifier = AUDIO_FFT_CHANGED_NOTIFIER.clone();
    while retried < 5 {
        if get_fft_counter() == 0 {
            retried = 0;
            // 等待开始接收
            info!("当前没有正在使用 FFT 的插件，等待插件调用中");
            let _ = notifier.1.wait(notifier.0.lock().unwrap());
        }
        info!("正在连接到主进程音频信息流： mrbncm-main-{parent_pid}");
        let client = interprocess::local_socket::LocalSocketStream::connect(format!(
            "mrbncm-main-{parent_pid}"
        ));
        match client {
            Ok(mut client) => {
                #[allow(unused_assignments)]
                {
                    retried = 0;
                }
                client.set_nonblocking(false).unwrap();
                info!("已连接到主进程音频信息流！");
                let mut stream = Stream::new(StreamConfig::default());
                let mut audio_info = AudioInfo {
                    format: AudioFormat::Unknown,
                    samples_per_sec: 0,
                    channel_amount: 0,
                };
                while get_fft_counter() != 0 {
                    let magic = client.read_u32::<LE>().unwrap_or_default();
                    match magic {
                        PUSH_AUDIO_BUFFER_MAGIC => {
                            let buf_size = client.read_u32::<LE>().unwrap_or_default() as usize;
                            let mut raw_buf = vec![0; buf_size];
                            let _ = client.read_exact(&mut raw_buf);

                            if !audio_info.has_zero() {
                                let samples =
                                    raw_buf.len() / (audio_info.get_bits_per_sample() / 8);
                                let mut buf: Vec<f32> = Vec::with_capacity(samples);
                                let mut cur = Cursor::new(raw_buf);
                                match audio_info.format {
                                    AudioFormat::PCMFloat32 => {
                                        while let Ok(v) = cur.read_f32::<LE>() {
                                            buf.push(v);
                                        }
                                    }
                                    AudioFormat::PCMInt32 => {
                                        const HARF_I32: f32 = i32::MAX as f32;
                                        while let Ok(v) = cur.read_i32::<LE>() {
                                            buf.push((v as f32 / HARF_I32) as _);
                                        }
                                    }
                                    AudioFormat::PCMInt16 => {
                                        const HARF_I16: f32 = i16::MAX as f32;
                                        while let Ok(v) = cur.read_i16::<LE>() {
                                            buf.push((v as f32 / HARF_I16) as _);
                                        }
                                    }
                                    AudioFormat::PCMInt8 => {
                                        const HARF_I8: f32 = i8::MAX as f32;
                                        while let Ok(v) = cur.read_i8() {
                                            buf.push((v as f32 / HARF_I8) as _);
                                        }
                                    }
                                    _ => {
                                        // 无法推流的格式
                                    }
                                }

                                // info!("接收到了音频数据 {} {}", samples, frames);

                                let mut frames_fft = Vec::with_capacity(60);
                                let chunk_size = stream.config.processor.sampling_rate as usize
                                    / stream.config.refresh_rate
                                    * stream.config.channel_count as usize;

                                for chunk in buf.chunks(chunk_size) {
                                    stream.push_data(chunk.to_vec());
                                    stream.update();

                                    let freq = stream.get_frequencies();

                                    // 只取第一个通道
                                    if let Some(freq) = freq.get(0) {
                                        let chunk_size =
                                            (freq.len() as f32 / AUDIO_FFT_DATA_LEN as f32).ceil();
                                        let mut result = Vec::with_capacity(AUDIO_FFT_DATA_LEN);
                                        for chunk in freq.chunks(chunk_size as _) {
                                            if !chunk.is_empty() {
                                                let mut v = 0.0;
                                                for c in chunk.iter().map(|x| x.volume) {
                                                    v += c;
                                                }
                                                result.push(v / chunk_size);
                                            }
                                        }
                                        while result.len() < AUDIO_FFT_DATA_LEN {
                                            result.push(
                                                result.last().copied().unwrap_or_default() * 0.9,
                                            );
                                        }
                                        frames_fft.push(result);
                                    }
                                }

                                let t = Instant::now();
                                let mut last_pos = usize::MAX;
                                let refresh_rate = stream.config.refresh_rate as f64;
                                let frames = frames_fft.len() as f64;
                                let total_time = frames * 1. / refresh_rate;

                                // debug!("已计算 FFT 帧 {frames}");

                                loop {
                                    let et = t.elapsed().as_secs_f64();
                                    let pick_pos = (et * refresh_rate) as usize;

                                    if last_pos != pick_pos {
                                        last_pos = pick_pos;
                                        if let Some(result) = frames_fft.get(pick_pos) {
                                            let fft_data = get_fft_data_mut();
                                            fft_data
                                                .copy_from_slice(&result[0..AUDIO_FFT_DATA_LEN]);
                                        }
                                    }

                                    if et >= total_time {
                                        break;
                                    }
                                }
                            }
                        }
                        SET_AUDIO_INFO_MAGIC => {
                            let mut new_audio_info = AudioInfo {
                                format: AudioFormat::Unknown,
                                samples_per_sec: 0,
                                channel_amount: 0,
                            };
                            new_audio_info.format =
                                client.read_u32::<LE>().unwrap_or_default().into();
                            new_audio_info.samples_per_sec =
                                client.read_u32::<LE>().unwrap_or_default();
                            new_audio_info.channel_amount =
                                client.read_u16::<LE>().unwrap_or_default();
                            if !new_audio_info.has_zero() && new_audio_info != audio_info {
                                audio_info = new_audio_info;
                                info!("音频信息已更新 {:#?}", audio_info);
                                const FFT_RESOLUTION: usize = AUDIO_FFT_DATA_LEN * 2;
                                stream = Stream::new(StreamConfig {
                                    channel_count: audio_info.channel_amount,
                                    fft_resolution: FFT_RESOLUTION,
                                    processor: ProcessorConfig {
                                        sampling_rate: audio_info.samples_per_sec,
                                        frequency_bounds: [
                                            50,
                                            audio_info.samples_per_sec as usize / 2,
                                        ],
                                        ..Default::default()
                                    },
                                    gravity: None,
                                    ..Default::default()
                                });
                            }
                        }
                        HEARTBEAT_MAGIC => {
                            // Pass
                        }
                        other => {
                            debug!("不是正确的流头部，可能是指针位置不正确 0x{:08X}", other);
                        }
                    }
                }
            }
            Err(err) => {
                retried += 1;
                warn!("连接失败，正在等待 5 秒后重试: {:?}", err);
                std::thread::sleep(Duration::from_secs(5));
            }
        }
    }
    warn!("音频线程已停止运行！");
}

#[instrument]
pub fn init_audio_capture() {
    if *PROCESS_TYPE == ProcessType::Main {
        // 主进程处理捕获的音频流并转发给子进程
        let _ = std::thread::Builder::new()
            .name("bncm-audio-main-thread".into())
            .spawn(main_audio_thread);
    } else if *PROCESS_TYPE == ProcessType::Renderer {
        // 渲染进程接收来自主进程的音频信息
        let _ = std::thread::Builder::new()
            .name("bncm-audio-renderer-thread".into())
            .spawn(renderer_audio_thread);
    }
}
