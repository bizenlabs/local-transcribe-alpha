import { ProgressResponse } from 'ollama/browser'

export type Model = {
  id: number
  name: string
  description?: string
  defaultVariant: Variant
  variants?: Variant[]
  showVariants?: boolean
  downloadProgress?: ProgressResponse
}

export type Variant = {
  name: string
  isDefault?: boolean
  size?: string
  context?: string
  input?: string
  hfUrl?: string
  downloaded?: boolean
  downloadProgress?: ProgressResponse
}
