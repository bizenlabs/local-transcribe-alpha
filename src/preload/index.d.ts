import { ElectronAPI } from '@electron-toolkit/preload'
import { DownloaderReport } from "nodejs-file-downloader";
import type { Model } from '../types/model'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFile: () => Promise<string>
    }
    asr: {
      getModels: () => Promise<Model[]>,
      downloadModel: (model: Model) => Promise<DownloaderReport>,
      transcribeFile: (audioFilePath: string, modelName: string) => Promise<string[]>,
      transcribeFileWhisper: (audioFilePath: string, modelName: string, language: string) => Promise<string[]>
      onDownloadProgress: (callback: (percentage: string) => void) =>  void
      onTranscriptionProgress: (callback: (percentage: number) => void) =>  void
    }
  }
}
