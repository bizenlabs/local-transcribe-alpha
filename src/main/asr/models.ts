import { Model } from '../../types/model'

export const modelsData: Model[] = [
  {
    id: 1,
    name: 'Tiny',
    model: 'onnx-community/whisper-tiny_timestamped',
    modelPath: '',
    description: 'Lightweight and fast, speed over precision.',
    size: '78 MB'
  },
  {
    id: 2,
    name: 'Base',
    model: 'onnx-community/whisper-base_timestamped',
    modelPath: '',
    description: 'More accurate than Tiny, suited for quick transcription on most devices.',
    size: '148 MB'
  },
  {
    id: 3,
    name: 'Small',
    model: 'onnx-community/whisper-small_timestamped',
    modelPath: '',
    description:
      'Small model balancing speed and accuracy, suitable for general transcription tasks.',
    size: '487 MB'
  },
  {
    id: 4,
    name: 'Large v3 Turbo',
    model: 'onnx-community/whisper-large-v3-turbo_timestamped',
    modelPath: '',
    description:
      'High-performance model for detailed transcription, optimized for speed and accuracy.',
    size: '1.6 GB'
  },
  {
    id: 5,
    name: 'Hindi Small',
    model: 'onnx-community/whisper-hindi-small-ONNX',
    modelPath: '',
    language: 'hi_IN',
    description: 'Specialized for Hindi language transcription, balancing speed and accuracy.',
    size: '967 MB'
  }
]
