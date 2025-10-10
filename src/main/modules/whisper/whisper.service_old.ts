// import path, { join } from 'path'
//
// import storage from 'electron-json-storage'
//
// import { modelsData } from './models'
// import type { Model } from '../../../types/model'
//
// import { convertToWavType } from '../../utils/fileConverter'
// import { createRequire } from 'node:module'
// import { promisify } from 'node:util'
// import child_process from 'child_process'
// import { downloadFile } from '../../utils/fileDownloader'
// import { DownloaderReport } from 'nodejs-file-downloader'
// import { WhisperParams } from '../../../types/whisperParameters'
// import { app } from 'electron'
// import { exec } from 'node:child_process'
// import { dependencyManager } from '../core/DependencyManager'
// import { RawAxiosRequestHeaders } from 'axios'
//
// let binPath: string
// if (process.platform == 'darwin') {
//   binPath = path
//     .join(__dirname, '../../resources/bin/mac-whisper/addon.node')
//     .replace('app.asar', 'app.asar.unpacked')
// } else {
//   binPath = path
//     .join(__dirname, '../../resources/bin/windows/addon.node')
//     .replace('app.asar', 'app.asar.unpacked')
// }
//
// class WhisperService {
//   private static _instance: WhisperService
//
//   private readonly appDataDir = app.getPath('userData')
//   private readonly modelsDirectoryPath: string = join(this.appDataDir, 'models')
//
//   private models: Model[] = []
//   private loadedModel: Model | undefined = undefined
//
//   private controller: AbortController
//
//   private constructor() {
//     this.syncSupportedModelsInStore()
//     this.models = storage.getSync('models')
//     this.controller = new AbortController()
//   }
//
//   async getAvailableModels(): Promise<Model[]> {
//     this.updateLoadedModel()
//     return Promise.resolve(this.models)
//   }
//
//   private updateLoadedModel(): void {
//     if (this.loadedModel) {
//       this.models.forEach((model) => {
//         model.loaded = this.loadedModel?.name === model.name
//       })
//     }
//   }
//
//   public async loadModel(model: Model): Promise<void> {
//     await this.startWhisperServer(model)
//   }
//
//   public async downloadDefaultModel(): Promise<void> {
//     console.log('Downloaded default model...')
//   }
//
//   // async startWhisperServer_path(
//   //   modelPath: string,
//   //   progress_callback: (percentage: number) => void,
//   //   port = 8090
//   // ): Promise<void> {
//   //   await this.stopWhisperServer()
//   //   console.log('startWhisperServer')
//   //
//   //   this.controller = new AbortController()
//   //   const { signal } = this.controller
//   //
//   //   const command = `"${dependencyManager.getWhisperPath()}"  --model "${modelPath}" -pp --port ${port} `
//   //   console.log('startWhisperServer command...', command)
//   //   const exec = promisify(child_process.exec)
//   //   const serverOutput = exec(command)
//   //   // console.log('startWhisperServer command...', serverOutput.stdout.trim())
//   //
//   //   //TODO health check
//   //   console.log('WhisperServer Started @ port: ', port)
//   // }
//
//   async startWhisperServer(model?: Model, port = 8090): Promise<void> {
//     await this.stopWhisperServer()
//     console.log('startWhisperServer')
//     if (!model) {
//       model = this.models[0]
//     }
//     if (!model.downloadPath) {
//       await modelService.downloadModel(model)
//     }
//
//     this.controller = new AbortController()
//     const { signal } = this.controller
//
//     const command = `"${dependencyManager.getWhisperPath()}"  --model "${model.downloadPath}" --port ${port} -pp`
//     console.log('startWhisperServer command...', command)
//
//     const exec = promisify(child_process.exec)
//     const serverOutput = exec(command)
//     serverOutput.then((stdout) => {
//       console.log('stdout', stdout)
//     })
//
//     // exec(command, { signal }, (error, stdout, stderr) => {
//     //   if (error) {
//     //     console.error(error)
//     //   }
//     //   console.log(stdout.trim())
//     // })
//     //TODO health check
//     this.loadedModel = model
//     console.log('WhisperServer Started @ port: ', port)
//   }
//
//   async stopWhisperServer(): Promise<void> {
//     this.controller.abort()
//     console.log('WhisperServer Stopped')
//   }
//
//   async downloadModel(
//     model: Model,
//     onProgress?: (percentage: string) => void
//   ): Promise<DownloaderReport> {
//     console.log('Download model:', model)
//     const downloadReport = await downloadFile(model.url, this.getModelsDirectoryPath(), onProgress)
//
//     if (downloadReport && downloadReport.filePath) {
//       const modelsInStore: Model[] = storage.getSync('models')
//       console.log('modelsInStore', modelsInStore)
//       const index = modelsInStore.findIndex((storeModel) => {
//         return storeModel.id === model.id
//       })
//       if (index !== -1) {
//         modelsInStore[index].downloadPath = downloadReport.filePath
//         storage.set('models', modelsInStore)
//         this.models = modelsInStore
//       }
//     }
//     return downloadReport
//   }
//
//   async whisperTranscribe(file: File): Promise<string> {
//     const whisperConfig = {
//       model: 'whisper-1',
//       prompt: 'string',
//       response_format: 'text',
//       language: 'en'
//     }
//
//     // Whisper only accept multipart/form-data currently
//     const body = new FormData()
//     body.append('file', file)
//     body.append('model', 'whisper-1')
//     // if (mode === 'transcriptions') {
//     //   body.append('language', whisperConfig?.language ?? 'en')
//     // }
//     if (whisperConfig?.prompt) {
//       body.append('prompt', whisperConfig.prompt)
//     }
//     if (whisperConfig?.response_format) {
//       body.append('response_format', whisperConfig.response_format)
//     }
//     // if (whisperConfig?.temperature) {
//     //   body.append('temperature', `${whisperConfig.temperature}`)
//     // }
//     const headers: RawAxiosRequestHeaders = {}
//     headers['Content-Type'] = 'multipart/form-data'
//     // if (apiKey) {
//     //   headers['Authorization'] = `Bearer ${apiKey}`
//     // }
//     const { default: axios } = await import('axios')
//     const response = await axios.post('http://127.0.0.1:8090/' + 'inference', body, {
//       headers
//     })
//     console.log('response', response.data.text)
//     console.log('response', response)
//     return response.data
//   }
//
//   async server(filePath: string): Promise<string> {
//     const whisperConfig = {
//       model: 'whisper-1',
//       prompt: 'string',
//       response_format: 'text',
//       language: 'en'
//     }
//
//     // Whisper only accept multipart/form-data currently
//     const body = new FormData()
//     body.append('file', filePath)
//     body.append('model', 'whisper-1')
//     // if (mode === 'transcriptions') {
//     //   body.append('language', whisperConfig?.language ?? 'en')
//     // }
//     if (whisperConfig?.prompt) {
//       body.append('prompt', whisperConfig.prompt)
//     }
//     if (whisperConfig?.response_format) {
//       body.append('response_format', whisperConfig.response_format)
//     }
//     // if (whisperConfig?.temperature) {
//     //   body.append('temperature', `${whisperConfig.temperature}`)
//     // }
//     const headers: RawAxiosRequestHeaders = {}
//     headers['Content-Type'] = 'multipart/form-data'
//     // if (apiKey) {
//     //   headers['Authorization'] = `Bearer ${apiKey}`
//     // }
//     const { default: axios } = await import('axios')
//     console.log('call before:')
//     const response = await axios.post('http://127.0.0.1:8090/' + 'inference', body, {
//       headers
//     })
//     console.log('call after:')
//     console.log('response', response.data.text)
//     console.log('response', response)
//     return response.data
//   }
//
//   // async transcribeFileWhisperV2(
//   //   audioFilePath: string,
//   //   modelPath: string,
//   //   language: string,
//   //   params: WhisperParams,
//   //   progress_callback: (percentage: number) => void
//   // ): Promise<string[]> {
//   //   console.log('Transcribing:', modelPath, audioFilePath, language)
//   //   console.log('Params:', params)
//   //   const convertedAudioFilePath = await convertToWavType(audioFilePath)
//   //   console.log('convertedAudioFilePath:', convertedAudioFilePath)
//   //
//   //   await this.startWhisperServer_path(modelPath, progress_callback)
//   //   await this.server(convertedAudioFilePath)
//   //   return Promise.resolve(['Hello'])
//   //   // const whisperParams = {
//   //   //   language,
//   //   //   model: modelPath,
//   //   //   fname_inp: convertedAudioFilePath,
//   //   //   use_gpu: params.use_gpu,
//   //   //   flash_attn: false,
//   //   //   no_prints: true,
//   //   //   comma_in_time: false,
//   //   //   translate: false,
//   //   //   no_timestamps: true,
//   //   //   detect_language: false,
//   //   //   audio_ctx: 0,
//   //   //   max_len: 0,
//   //   //   n_threads: params.n_threads,
//   //   //   n_processors: params.n_processors,
//   //   //   prompt: 'यह हिंदी प्रतिलेख है',
//   //   //   progress_callback
//   //   // }
//   //   // const require = createRequire(import.meta.url)
//   //   // console.log('bin path', binPath)
//   //   // let { whisper } = require(binPath)
//   //   // const whisperAsync = promisify(whisper)
//   //   // const result = await whisperAsync(whisperParams)
//   //   // whisper = null
//   //   // // console.log(result.transcription)
//   //   // // await startServer()
//   //   // return Promise.resolve(result.transcription)
//   // }
//
//   async transcribeFileWhisper(
//     audioFilePath: string,
//     modelPath: string,
//     language: string,
//     params: WhisperParams,
//     progress_callback: (percentage: number) => void
//   ): Promise<string[]> {
//     console.log('Transcribing:', modelPath, audioFilePath, language)
//     console.log('Params:', params)
//     const convertedAudioFilePath = await convertToWavType(audioFilePath)
//     console.log('convertedAudioFilePath:', convertedAudioFilePath)
//     const whisperParams = {
//       language,
//       model: modelPath,
//       fname_inp: convertedAudioFilePath,
//       use_gpu: params.use_gpu,
//       flash_attn: false,
//       no_prints: true,
//       comma_in_time: false,
//       translate: false,
//       no_timestamps: true,
//       detect_language: false,
//       audio_ctx: 0,
//       max_len: 0,
//       n_threads: params.n_threads,
//       n_processors: params.n_processors,
//       prompt: 'यह हिंदी प्रतिलेख है',
//       progress_callback
//     }
//     const require = createRequire(import.meta.url)
//     console.log('bin path', binPath)
//     let { whisper } = require(binPath)
//     const whisperAsync = promisify(whisper)
//     const result = await whisperAsync(whisperParams)
//     whisper = null
//     // console.log(result.transcription)
//     // await startServer()
//     return Promise.resolve(result.transcription)
//   }
//
//   public static get Instance(): WhisperService {
//     return this._instance || (this._instance = new this())
//   }
//
//   //TODO : unloadModel
//
//   async getDownloadedModels(): Promise<Model[]> {
//     const modelsInStore: Model[] = storage.getSync('models')
//     return Promise.resolve(modelsInStore.filter((model) => model.downloadPath !== undefined))
//   }
//
//   getModelsDirectoryPath(): string {
//     return this.modelsDirectoryPath
//   }
//
//   private syncSupportedModelsInStore(): void {
//     const appModelList = [...modelsData]
//     storage.setDataPath(this.modelsDirectoryPath)
//
//     storage.has('models', function (_error: never, hasKey: boolean) {
//       if (!hasKey) {
//         storage.set('models', appModelList)
//       } else {
//         const storageModels: Model[] = storage.getSync('models')
//
//         appModelList.forEach(function (model: Model) {
//           const index = storageModels.findIndex((storedModel) => storedModel.name === model.name)
//           if (index > -1) {
//             model.downloadPath = storageModels[index].downloadPath
//           }
//         })
//       }
//       storage.set('models', appModelList)
//     })
//   }
// }
//
// export const modelService = WhisperService.Instance
// // execa({
// //   shell: true
// // })`"${dependencyManager.getWhisperPath()}" --port ${port} -pp --model "${model.downloadPath}"`
//
// // if (model.downloadPath) {
// //   for await (const line of execa({
// //     shell: true
// //   })`"${dependencyManager.getWhisperPath()}" --port ${port} -pp --model "${model.downloadPath}"`) {
// //     console.log(line)
// //   }
// // }
//
// // const child = exec(command)
// // child.stdout?.setEncoding('utf8')
// // child.stdout?.on('data', (data) => {
// //   console.log('data', data)
// // })
// // const ws = exec(command)
// // ws.stdout?.on('data', (data: Buffer) => {
// //   console.log('data', data)
// // })
// // ws.stdout.console.log('ps:', ws)
//
// // const whisper = promisify(child_process.exec)
// // const serverOutput = whisper(command).then()
// // serverOutput.then((stdout) => {
// //   console.log('stdout', stdout)
// // })
//
// // exec(command, { signal }, (error, stdout, stderr) => {
// //   if (error) {
// //     console.error(error)
// //   }
// //   console.log(stdout.trim())
// // })
