import { Model } from './model.type'

export const modelsData: Model[] = [
  {
    id: 1,
    name: 'Qwen3',
    description:
      'Qwen3 is the latest generation of large language models in Qwen series, offering a comprehensive suite of dense and mixture-of-experts (MoE) models.',
    showVariants: false,
    defaultVariant: {
      name: 'qwen3:8b',
      size: '5.2GB',
      context: '40K',
      input: 'Text',
      isDefault: true
    },
    variants: [
      {
        name: 'qwen3:0.6b',
        size: '523MB',
        context: '40K',
        input: 'Text',
        hfUrl: 'https://huggingface.co/Qwen/Qwen3-0.6B-GGUF'
      },
      {
        name: 'qwen3:1.7b',
        size: '1.4GB',
        context: '40K',
        input: 'Text'
      },
      {
        name: 'qwen3:4b',
        size: '2.5GB',
        context: '256K',
        input: 'Text'
      },
      {
        name: 'qwen3:14b',
        size: '9.3GB',
        context: '40K',
        input: 'Text'
      }
    ]
  },
  {
    id: 2,
    name: 'Gemma3',
    description: 'The current, most capable model that runs on a single GPU.',
    showVariants: false,
    defaultVariant: {
      name: 'gemma3:4b',
      size: '3.3GB',
      isDefault: true,
      context: '128K',
      input: 'Text, Image'
    },
    variants: [
      {
        name: 'gemma3:270m',
        size: '292MB',
        context: '32K',
        input: 'Text'
      },
      {
        name: 'gemma3:1b',
        size: '815MB',
        context: '32K',
        input: 'Text'
      },
      {
        name: 'gemma3:12b',
        size: '8.1GB',
        context: '128K',
        input: 'Text, Image'
      }
    ]
  },
  {
    id: 3,
    name: 'Llama3.1',
    description:
      'Llama 3.1 is a new state-of-the-art model from Meta available in 8B, 70B and 405B parameter sizes.',
    showVariants: false,
    defaultVariant: {
      name: 'llama3.1:8b',
      size: '1.3GB',
      context: '128K',
      input: 'Text'
    }
  },
  {
    id: 4,
    name: 'Llama3.2',
    description: "Meta's Llama 3.2 goes small with 1B and 3B models.",
    showVariants: false,
    defaultVariant: {
      name: 'llama3.2:3b',
      size: '2.0GB',
      context: '128K',
      input: 'Text',
      isDefault: true
    },
    variants: [
      {
        name: 'llama3.2:1b',
        size: '1.3GB',
        context: '128K',
        input: 'Text, Image'
      }
    ]
  },
  {
    id: 5,
    name: 'Deepseek-R1',
    description:
      'DeepSeek-R1 is a family of open reasoning models with performance approaching that of leading models, such as O3 and Gemini 2.5 Pro.',
    showVariants: false,
    defaultVariant: {
      name: 'deepseek-r1:8b',
      size: '5.2GB',
      context: '128K',
      input: 'Text',
      isDefault: true
    },
    variants: [
      {
        name: 'deepseek-r1:1.5b',
        size: '1.1GB',
        context: '128K',
        input: 'Text'
      },
      {
        name: 'deepseek-r1:7b',
        size: '4.7GB',
        context: '128K',
        input: 'Text'
      },
      {
        name: 'deepseek-r1:14b',
        size: '9.0GB',
        context: '128K',
        input: 'Text'
      }
    ]
  },
  {
    id: 6,
    name: 'Mistral',
    description: 'The 7B model released by Mistral AI, updated to version 0.3.',
    showVariants: false,
    defaultVariant: {
      name: 'mistral:7b',
      size: '4.4GB',
      context: '32K',
      input: 'Text',
      isDefault: true
    }
  },
  {
    id: 7,
    name: 'Hinglish translator',
    description: 'Hinglish translator.',
    showVariants: false,
    defaultVariant: {
      name: 'hf.co/mradermacher/RLM-hinglish-translator-GGUF:Q8_0',
      size: '4.4GB',
      context: '32K',
      input: 'Text',
      isDefault: true
    }
  },
  {
    id: 8,
    name: 'BharatGPT',
    description: 'BharatGPT',
    showVariants: false,
    defaultVariant: {
      name: 'hf.co/mradermacher/BharatGPT-3B-Indic-GGUF:Q8_0',
      size: '2.8B',
      context: '32K',
      input: 'Text',
      isDefault: true
    },
    variants: [
      {
        name: 'hf.co/mradermacher/BharatGPT-3B-Indic-GGUF:Q4_K_M',
        size: '2.1GB',
        context: '',
        input: 'Text'
      }
    ]
  }
]
