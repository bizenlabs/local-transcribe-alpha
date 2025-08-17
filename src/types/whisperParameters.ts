export type WhisperParams = {
  language: string
  model: string
  fname_inp: string
  use_gpu: boolean
  flash_attn: boolean
  no_prints: boolean
  comma_in_time: boolean
  translate: boolean
  no_timestamps: boolean
  detect_language: boolean
  audio_ctx: number
  max_len: number
  n_threads: number
}
