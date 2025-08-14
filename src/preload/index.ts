import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openFile: () => ipcRenderer.invoke('dialog:openFile')
}

// ASR APIs for renderer
const asr = {
  getModels: () => ipcRenderer.invoke('asr:getModels'),
  downloadModel: async (modelName: string): Promise<void> =>
    await ipcRenderer.invoke('asr:downloadModel', modelName),
  transcribeFile: async (audioFilePath: string, modelName: string): Promise<string[]> => {
    return await ipcRenderer.invoke('asr:file', audioFilePath, modelName)
  },
  transcribeFileWhisper: async (audioFilePath: string, modelName: string): Promise<string[]> => {
    return await ipcRenderer.invoke('asr:file-whisper', audioFilePath, modelName)
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
