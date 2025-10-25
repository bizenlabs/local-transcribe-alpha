import { ElectronAPI } from '@electron-toolkit/preload'
import { DownloaderReport } from 'nodejs-file-downloader'
import type { Model } from '../types/model'
import { WhisperParams } from '../types/whisperParameters'
import { summarize } from "../main/summary/summary";
import { downloadYT } from "../main/utils/youTube";
import { VideoProgress } from "ytdlp-nodejs";
import { Transcript } from "../main/modules/whisper/transcript.type";

declare global {
  interface Window {
    download: {
      brew: () => Promise<DownloaderReport>
      brewProgress: (callback: (percentage: string) => void) => void,

      whisper: () => Promise<DownloaderReport>
      whisperProgress: (callback: (percentage: string) => void) => void,

      ollama: () => Promise<DownloaderReport>
      ollamaProgress: (callback: (percentage: string) => void) => void
    },
    server: {
      startWhisper: () => Promise<void>
      startOllama: () => Promise<void>
      startBackend: () => Promise<void>
    },
    api: {
      openFile: () => Promise<string>
      openImageFile: () => Promise<string>
    }
    asr: {
      loadModel: (model: Model) => Promise<void>
      getModels: () => Promise<Model[]>
      downloadModel: (model: Model) => Promise<DownloaderReport>
      transcribeFile: (audioFilePath: string) => Promise<Transcript>
      transcribeFileWhisper: (
        audioFilePath: string
      ) => Promise<Transcript>
      onDownloadProgress: (callback: (percentage: string) => void) => void
      onTranscriptionProgress: (callback: (percentage: number) => void) => void
      summarize: (text: string, modelPath: string) => Promise<string>
      startServer: (text: string, modelPath: string) => Promise<string>
      onDownloadYTProgress: (callback: (videoProgress: VideoProgress) => void) => void
      downloadYT: (url: string) => Promise<string>
      downloadJDK: () => Promise<DownloaderReport>
      onJDKDownloadProgress: (callback: (percentage: string) => void) => void
    },

    electron: ElectronAPI
  }
}
