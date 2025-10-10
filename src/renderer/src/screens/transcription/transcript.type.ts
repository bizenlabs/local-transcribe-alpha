export interface Transcript {
  text: string
  task?: string
  language?: string
  duration?: number
  segments?: Segment[]
  detected_language?: string
  detected_language_probability?: number
  language_probabilities?: LanguageProbabilities
}

export interface Segment {
  id: number
  text: string
  start: number
  end: number
  tokens: number[]
  words: Word[]
  temperature: number
  avg_logprob: number
  no_speech_prob: number
}

export interface Word {
  word: string
  start: number
  end: number
  t_dtw: number
  probability: number
}

export interface LanguageProbabilities {
  en: number
}
