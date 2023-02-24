use std::{
    io::{Cursor, Read, Write},
    sync::mpsc::Sender,
    time::{Duration, Instant},
};

use audioviz::spectrum::{config::*, stream::Stream};
use byteorder::{ReadBytesExt, WriteBytesExt, LE};
use once_cell::sync::Lazy;
use tracing::*;

use crate::{ProcessType, PROCESS_TYPE};

static mut AUDIO_FFT_DATA: Lazy<Vec<f32>> = Lazy::new(|| vec![0.0; 32]);

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

#[derive(Debug, Clone)]
pub struct AudioInfo {
    pub sps: u32,
    pub bps: u16,
    pub ca: u16,
}

impl AudioInfo {
    fn has_zero(&self) -> bool {
        self.bps == 0 || self.sps == 0 || self.ca == 0
    }
}

// 仅主进程
static mut AUDIO_THREAD_SENDER: Option<Sender<AudioThreadMessage>> = None;

pub fn get_audio_thread_sender() -> &'static Option<Sender<AudioThreadMessage>> {
    unsafe { &AUDIO_THREAD_SENDER }
}

const PUSH_AUDIO_BUFFER_MAGIC: u32 = 0x1F427593;
const SET_AUDIO_INFO_MAGIC: u32 = 0xA524B8C6;

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
    let mut clients = Vec::with_capacity(4);
    while let Ok(msg) = rx.recv() {
        while let Ok(client) = server.accept() {
            info!("新子进程连接 {}", client.peer_pid().unwrap_or_default());
            client.set_nonblocking(false).unwrap();
            clients.push(client);
        }
        let mut send_audio_info = |audio_info: &AudioInfo| {
            if !audio_info.has_zero() {
                for client in &mut clients {
                    let _ = client.write_u32::<LE>(SET_AUDIO_INFO_MAGIC);
                    let _ = client.write_u32::<LE>(audio_info.sps);
                    let _ = client.write_u16::<LE>(audio_info.bps);
                    let _ = client.write_u16::<LE>(audio_info.ca);
                }
            }
        };
        match msg {
            AudioThreadMessage::PushAudioBuffer(buf) => {
                // info!("接收到新音频缓冲 {}", buf.len());
                for client in &mut clients {
                    let _ = client.write_u32::<LE>(PUSH_AUDIO_BUFFER_MAGIC);
                    let _ = client.write_u32::<LE>(buf.len() as _);
                    let _ = client.write_all(&buf);
                    let _ = client.flush();
                }
            }
            AudioThreadMessage::SetAudioInfo(info) => {
                info!("当前音频信息为 {:#?}", info);
                send_audio_info(&info);
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
    while retried < 5 {
        info!("正在连接到主进程音频信息流");
        let client = interprocess::local_socket::LocalSocketStream::connect(format!(
            "mrbncm-main-{parent_pid}"
        ));
        if let Ok(mut client) = client {
            #[allow(unused_assignments)]
            {
                retried = 0;
            }
            client.set_nonblocking(false).unwrap();
            info!("已连接到主进程音频信息流！");
            let mut stream = Stream::new(StreamConfig::default());
            let mut audio_info = AudioInfo {
                sps: 0,
                bps: 0,
                ca: 0,
            };
            loop {
                let magic = client.read_u32::<LE>().unwrap_or_default();
                match magic {
                    PUSH_AUDIO_BUFFER_MAGIC => {
                        let buf_size = client.read_u32::<LE>().unwrap_or_default() as usize;
                        let mut raw_buf = vec![0; buf_size];
                        let _ = client.read_exact(&mut raw_buf);

                        if !audio_info.has_zero() {
                            let samples = raw_buf.len() / (audio_info.bps as usize / 8);
                            let mut buf = Vec::with_capacity(samples);
                            let mut cur = Cursor::new(raw_buf);
                            match audio_info.bps {
                                32 => {
                                    const HARF_I32: f32 = i32::MAX as f32;
                                    while let Ok(v) = cur.read_i32::<LE>() {
                                        buf.push(v as f32 / HARF_I32);
                                    }
                                }
                                16 => {
                                    const HARF_I16: f32 = i16::MAX as f32;
                                    while let Ok(v) = cur.read_u16::<LE>() {
                                        buf.push((v as f32 - HARF_I16) / HARF_I16);
                                    }
                                }
                                8 => {
                                    const HARF_I8: f32 = i8::MAX as f32;
                                    while let Ok(v) = cur.read_i8() {
                                        buf.push(v as f32 / HARF_I8);
                                    }
                                }
                                _ => {
                                    // 无法推流的格式
                                }
                            }

                            let frames = (samples as f64
                                / stream.config.processor.sampling_rate as f64
                                * stream.config.channel_count as f64
                                * stream.config.refresh_rate as f64)
                                .ceil() as usize;

                            // info!("接收到了音频数据 {} {}", samples, frames);

                            stream.push_data(buf);

                            let mut frames_fft = Vec::with_capacity(frames);

                            for _ in 0..frames {
                                stream.update();

                                let freq = stream.get_frequencies();

                                // 只取第一个通道
                                if let Some(freq) = freq.get(0) {
                                    let chunk_size = freq.len() as f32 / 32.;
                                    let mut result = Vec::with_capacity(32);
                                    for chunk in freq.chunks_exact(chunk_size as _) {
                                        if !chunk.is_empty() {
                                            let mut v = 0.0;
                                            for c in chunk.iter().map(|x| x.volume) {
                                                v += c;
                                            }
                                            result.push(v / chunk_size);
                                        }
                                    }
                                    frames_fft.push(result);
                                }
                            }

                            let t = Instant::now();
                            let mut last_pos = usize::MAX;
                            let refresh_rate = stream.config.refresh_rate as f64;

                            loop {
                                let et = t.elapsed().as_millis() as f64;
                                let pick_pos = (et / 1000. * refresh_rate) as usize;

                                if last_pos != pick_pos {
                                    last_pos = pick_pos;
                                    if let Some(result) = frames_fft.get(pick_pos) {
                                        *get_fft_data_mut() = result.to_owned();
                                    }
                                }

                                if et >= frames as f64 / 1000. * refresh_rate {
                                    break;
                                }
                            }
                        }
                    }
                    SET_AUDIO_INFO_MAGIC => {
                        audio_info.sps = client.read_u32::<LE>().unwrap_or_default();
                        audio_info.bps = client.read_u16::<LE>().unwrap_or_default();
                        audio_info.ca = client.read_u16::<LE>().unwrap_or_default();
                        if !audio_info.has_zero() {
                            info!("接收到了音频信息 {:#?}", audio_info);
                            stream = Stream::new(StreamConfig {
                                channel_count: audio_info.ca,
                                processor: ProcessorConfig {
                                    sampling_rate: audio_info.sps,
                                    ..Default::default()
                                },
                                ..Default::default()
                            });
                        }
                    }
                    other => {
                        debug!("不是正确的流头部，可能是指针位置不正确 0x{:08X}", other);
                    }
                }
            }
        }
        retried += 1;
        std::thread::sleep(Duration::from_secs(5));
    }
}

#[instrument]
pub fn init_audio_capture() {
    if *PROCESS_TYPE == ProcessType::Main {
        // 主进程处理捕获的音频流并转发给子进程
        let _ = std::thread::Builder::new()
            .name("bncm-audio-thread".into())
            .spawn(main_audio_thread);
    } else if *PROCESS_TYPE == ProcessType::Renderer {
        // 渲染进程接收来自主进程的音频信息
        let _ = std::thread::Builder::new()
            .name("bncm-audio-thread".into())
            .spawn(renderer_audio_thread);
    }
}
