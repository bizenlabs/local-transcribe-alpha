import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFile: () => Promise<string>
    }
    asr: {
      getModels: () => Promise<Model[]>,
      downloadModel: (modelName: string) => Promise<void>,
      transcribeFile: (audioFilePath: string, modelName: string) => Promise<string[]>,
      transcribeFileWhisper: (audioFilePath: string, modelName: string) => Promise<string[]>
    }
  }
}
