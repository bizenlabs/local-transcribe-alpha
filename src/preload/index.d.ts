import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    asr: {
      getModels: () => Promise<Model[]>,
      downloadModel: (modelName: string) => Promise<void>,
    }
  }
}
