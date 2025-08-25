import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { DownloaderReport } from 'nodejs-file-downloader'
import type { Model } from '../types/model'
import { WhisperParams } from '../types/whisperParameters'

// Custom APIs for renderer
const api = {
  openFile: () => ipcRenderer.invoke('dialog:openFile')
}

// ASR APIs for renderer
const asr = {
  getModels: () => ipcRenderer.invoke('asr:getModels'),
  downloadModel: async (model: Model): Promise<DownloaderReport> =>
    await ipcRenderer.invoke('asr:downloadModel', model),
  transcribeFile: async (audioFilePath: string, modelName: string): Promise<string[]> => {
    return await ipcRenderer.invoke('asr:file', audioFilePath, modelName)
  },
  transcribeFileWhisper: async (
    audioFilePath: string,
    modelName: string,
    language: string,
    params: WhisperParams
  ): Promise<string[]> => {
    return await ipcRenderer.invoke('asr:file-whisper', audioFilePath, modelName, language, params)
  },
  onDownloadProgress: (callback: (percentage: string) => void) =>
    ipcRenderer.on('modelDownloadProgress', (_event, value) => callback(value)),

  onTranscriptionProgress: (callback: (percentage: number) => void) =>
    ipcRenderer.on('transcriptionProgress', (_event, value) => callback(value)),

  summarize: async (text: string, modelPath: string): Promise<string> => {
    return await ipcRenderer.invoke('asr:summarize', text, modelPath)
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
}
