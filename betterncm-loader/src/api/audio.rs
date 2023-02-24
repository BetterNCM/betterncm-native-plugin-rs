use betterncm_macro::*;
use tracing::*;

#[betterncm_native_api(name = "audio.getFFTData")]
#[instrument]
pub fn get_fft_data() -> anyhow::Result<Vec<f32>> {
    Ok(crate::audio::get_fft_data().to_owned())
}
