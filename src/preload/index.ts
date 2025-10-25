import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { DownloaderReport } from 'nodejs-file-downloader'
import type { Model } from '../types/model'
import { VideoProgress } from 'ytdlp-nodejs'
import { Transcript } from '../types/transcript.type'

const download = {
  brew: async (): Promise<void> => await ipcRenderer.invoke('download:brew'),
  brewProgress: (callback: (percentage: string) => void) =>
    ipcRenderer.on('brewProgress', (_event, value) => callback(value)),

  whisper: async (): Promise<DownloaderReport> => await ipcRenderer.invoke('download:whisper'),
  whisperProgress: (callback: (percentage: string) => void) =>
    ipcRenderer.on('whisperProgress', (_event, value) => callback(value)),

  ollama: async (): Promise<DownloaderReport> => await ipcRenderer.invoke('download:ollama'),
  ollamaProgress: (callback: (percentage: string) => void) =>
    ipcRenderer.on('ollamaProgress', (_event, value) => callback(value))
}
const server = {
  startWhisper: async () => await ipcRenderer.invoke('server:start:whisper'),
  startOllama: async () => await ipcRenderer.invoke('server:start:ollama'),
  startBackend: async () => await ipcRenderer.invoke('server:start:backend')
}

// Custom APIs for renderer
const api = {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openImageFile: () => ipcRenderer.invoke('dialog:openImageFile')
}

// ASR APIs for renderer
const asr = {
  loadModel: async (model: Model): Promise<void> =>
    await ipcRenderer.invoke('asr:loadModel', model),
  getModels: () => ipcRenderer.invoke('asr:getModels'),
  downloadModel: async (model: Model): Promise<DownloaderReport> =>
    await ipcRenderer.invoke('asr:downloadModel', model),
  transcribeFile: async (audioFilePath: string, modelName: string): Promise<string[]> => {
    return await ipcRenderer.invoke('asr:file', audioFilePath, modelName)
  },
  transcribeFileWhisper: async (audioFilePath: string): Promise<Transcript> => {
    return await ipcRenderer.invoke('asr:file-whisper', audioFilePath)
  },
  onDownloadProgress: (callback: (percentage: string) => void) =>
    ipcRenderer.on('modelDownloadProgress', (_event, value) => callback(value)),

  onDownloadYTProgress: (callback: (videoProgress: VideoProgress) => void) =>
    ipcRenderer.on('ytDownloadProgress', (_event, value) => callback(value)),

  downloadYT: async (url: string): Promise<string> =>
    await ipcRenderer.invoke('asr:downloadYT', url),

  onTranscriptionProgress: (callback: (percentage: number) => void) =>
    ipcRenderer.on('transcriptionProgress', (_event, value) => callback(value)),

  summarize: async (text: string, modelPath: string): Promise<string> => {
    return await ipcRenderer.invoke('asr:summarize', text, modelPath)
  },
  startServer: async (text: string, modelPath: string): Promise<string> => {
    return await ipcRenderer.invoke('asr:startServer', text, modelPath)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('asr', asr)
    contextBridge.exposeInMainWorld('download', download)
    contextBridge.exposeInMainWorld('server', server)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.asr = asr
  // @ts-ignore (define in dts)
  window.download = download
  // @ts-ignore (define in dts)
  window.server = server
}
