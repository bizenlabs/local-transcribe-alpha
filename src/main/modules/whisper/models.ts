import { Model } from '../../../types/model'

export const modelsData: Model[] = [
  {
    id: 1,
    name: 'Tiny',
    description: 'Lightweight and fast, speed over precision.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
    downloadPath: null,
    size: '77.69 MB',
    loaded: false
  },
  {
    id: 2,
    name: 'Base',
    description: 'More accurate than Tiny, suited for quick transcription on most devices.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
    downloadPath: null,
    size: '147.95 MB',
    loaded: false
  },
  {
    id: 3,
    name: 'Small',
    description: 'Balancing speed and accuracy, suitable for general transcription tasks.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
    downloadPath: null,
    size: '487.6 MB',
    loaded: false
  },
  {
    id: 4,
    name: 'Medium',
    description:
      'Offers reliable accuracy across various languages but requires more processing power.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin',
    downloadPath: null,
    size: '1.53.GB',
    loaded: false
  },
  {
    id: 5,
    name: 'Large v3 Turbo',
    description:
      'High-performance model for detailed transcription, optimized for speed and accuracy.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin',
    downloadPath: null,
    size: '1.62.GB',
    loaded: false
  },
  {
    id: 6,
    name: 'Small -hindi',
    description: 'Decent quality, smaller than Q4_K_S with similar performance, recommended..',
    url: 'https://github.com/bizenlabs/local-transcribe-alpha/releases/download/hindiv/v-hindi-ggml-model.bin',
    downloadPath: null,
    size: '487 MB',
    loaded: false
  },
  {
    id: 7,
    name: 'Large v3 -hindi',
    description: 'Decent quality, smaller than Q4_K_S with similar performance, recommended..',
    url: 'https://huggingface.co/kgidwani/hindi-large/resolve/main/large-ggml-model.bin',
    downloadPath: null,
    size: '3,1 GB',
    loaded: false
  }
]
