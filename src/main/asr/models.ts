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
    name: 'Clinician-Note-2.0',
    description:
      'High-performance model for detailed transcription, optimized for speed and accuracy.',
    url: 'https://huggingface.co/mradermacher/Clinician-Note-2.0a-GGUF/resolve/main/Clinician-Note-2.0a.Q4_K_S.gguf',
    downloadPath: null,
    size: '2.5.GB'
  },
  {
    id: 7,
    name: 'Mistral_7B_Summarizer',
    description:
      'High-performance model for detailed transcription, optimized for speed and accuracy.',
    url: 'https://huggingface.co/mradermacher/mistral-Summarizer-7b-instruct-v0.2-GGUF/resolve/main/mistral-Summarizer-7b-instruct-v0.2.Q4_K_S.gguf',
    downloadPath: null,
    size: '4.37 GB'
  },
  {
    id: 8,
    name: 'Meta-Llama-3.1-8B-Instruct-GGUF:Q4_K_M',
    description:
      'High-performance model for detailed transcription, optimized for speed and accuracy.',
    url: 'https://huggingface.co/mradermacher/mistral-Summarizer-7b-instruct-v0.2-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct.Q4_K_M.gguf',
    downloadPath: null,
    size: '4.37 GB'
  }
]
