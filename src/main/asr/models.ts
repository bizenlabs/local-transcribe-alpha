import { Model } from '../../types/model'

export const modelsData: Model[] = [
  {
    id: 1,
    name: 'Tiny',
    description: 'Lightweight and fast, speed over precision.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
    downloadPath: null,
    size: '77.69 MB'
  },
  {
    id: 2,
    name: 'Base',
    description: 'More accurate than Tiny, suited for quick transcription on most devices.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
    downloadPath: null,
    size: '147.95 MB'
  },
  {
    id: 3,
    name: 'Small',
    description: 'Balancing speed and accuracy, suitable for general transcription tasks.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
    downloadPath: null,
    size: '487.6 MB'
  },
  {
    id: 4,
    name: 'Medium',
    description:
      'Offers reliable accuracy across various languages but requires more processing power.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin',
    downloadPath: null,
    size: '1.53.GB'
  },
  {
    id: 5,
    name: 'Large v3 Turbo',
    description:
      'High-performance model for detailed transcription, optimized for speed and accuracy.',
    url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin',
    downloadPath: null,
    size: '1.62.GB'
  },
  {
    id: 6,
    name: 'Llama-3.2-3B-Instruct-IQ4_XS',
    description: 'Decent quality, smaller than Q4_K_S with similar performance, recommended..',
    url: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-IQ4_XS.gguf',
    downloadPath: null,
    size: '1.7.GB'
  }
]
