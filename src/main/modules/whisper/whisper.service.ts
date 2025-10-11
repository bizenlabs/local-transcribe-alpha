import { join } from 'path'

import storage from 'electron-json-storage'

import { modelsData } from './models'
import type { Model } from '../../../types/model'

import { convertToWavType } from '../../utils/fileConverter'

import { downloadFile } from '../../utils/fileDownloader'
import { DownloaderReport } from 'nodejs-file-downloader'
import { app } from 'electron'
import { ChildProcess, exec } from 'node:child_process'
import { dependencyManager } from '../core/DependencyManager'
import { RawAxiosRequestHeaders } from 'axios'
import { Transcript } from '../../../types/transcript.type'
import kill from 'tree-kill'

class WhisperService {
  private static _instance: WhisperService

  private readonly appDataDir = app.getPath('userData')
  private readonly modelsDirectoryPath: string = join(this.appDataDir, 'models')

  private models: Model[] = []
  private loadedModel: Model | undefined
  private readonly defaultModel: Model

  private wsProcess: ChildProcess | undefined
  private readonly port: string

  private constructor(port = '8090') {
    this.port = port
    this.syncSupportedModelsInStore()
    this.models = storage.getSync('models')

    this.defaultModel = this.models[0]
  }

  async getAvailableModels(): Promise<Model[]> {
    this.updateLoadedModel()
    return Promise.resolve(this.models)
  }

  private updateLoadedModel(): void {
    if (this.loadedModel) {
      this.models.forEach((model) => {
        model.loaded = this.loadedModel?.name === model.name
      })
    }
  }
  public async downloadDefaultModel(): Promise<void> {
    const onProgress = (percentage: string): void => console.log('default progress', percentage)
    await whisperService.downloadModel(modelsData[0], onProgress)
    console.log('Downloaded default model...')
  }

  public async loadModel(model: Model): Promise<void> {
    if (model.downloadPath) {
      const body = new FormData()
      body.append('model', model.downloadPath)
      body.append('response_format', 'text')

      const headers: RawAxiosRequestHeaders = {}
      headers['Content-Type'] = 'multipart/form-data'

      console.log('loading model: ', model.name)

      const { default: axios } = await import('axios')
      const response = await axios.post('http://127.0.0.1:8090/' + 'load', body, {
        headers
      })
      console.log('model loaded: status ', model.name, response.status)
      this.loadedModel = model
    }
  }

  async startWhisperServer(model?: Model): Promise<void> {
    if (!model) {
      model = this.defaultModel
    }
    console.log('starting Whisper Server', model)
    await this.stopWhisperServer()
    if (!model.downloadPath) {
      await this.downloadModel(model)
    }

    // const command = `"${dependencyManager.getWhisperPath()}"`
    // const commandArgs = ['--port', `${this.port}`, '-pp', '--model', `${model.downloadPath}`]

    const command = `"${dependencyManager.getWhisperPath()}" --port ${this.port} --model "${model.downloadPath}"`
    console.log(`start ${command}`)

    this.wsProcess = exec(command)

    this.loadedModel = model
    console.log('Whisper service started at port ' + this.port)
  }

  async stopWhisperServer(): Promise<void> {
    const pid = this.wsProcess?.pid
    if (pid) {
      kill(pid)
      console.log(`WhisperServer process killed: pid=${pid}`)
      this.wsProcess = undefined
    }
  }

  async downloadModel(
    model: Model,
    onProgress?: (percentage: string) => void
  ): Promise<DownloaderReport> {
    console.log('Download model:', model)
    const downloadReport = await downloadFile(model.url, this.getModelsDirectoryPath(), onProgress)

    if (downloadReport && downloadReport.filePath) {
      const modelsInStore: Model[] = storage.getSync('models')
      console.log('modelsInStore', modelsInStore)
      const index = modelsInStore.findIndex((storeModel) => {
        return storeModel.id === model.id
      })
      if (index !== -1) {
        modelsInStore[index].downloadPath = downloadReport.filePath
        storage.set('models', modelsInStore)
        this.models = modelsInStore
      }
    }
    return downloadReport
  }

  async transcribeFile(
    audioFilePath: string,
    responseFormat = 'verbose_json'
  ): Promise<Transcript> {
    const convertedAudioFilePath = await convertToWavType(audioFilePath)

    const body = new FormData()
    body.append('file', convertedAudioFilePath)
    body.append('response_format', responseFormat)

    const headers: RawAxiosRequestHeaders = {}
    headers['Content-Type'] = 'multipart/form-data'

    console.log('call before:')

    const { default: axios } = await import('axios')
    console.log('call before:')
    const response = await axios.post<Transcript>('http://127.0.0.1:8090/' + 'inference', body, {
      headers
    })
    console.log('response', response)
    return response.data
  }

  public static get Instance(): WhisperService {
    return this._instance || (this._instance = new this())
  }

  //TODO : unloadModel

  async getDownloadedModels(): Promise<Model[]> {
    const modelsInStore: Model[] = storage.getSync('models')
    return Promise.resolve(modelsInStore.filter((model) => model.downloadPath !== undefined))
  }

  getModelsDirectoryPath(): string {
    return this.modelsDirectoryPath
  }

  private syncSupportedModelsInStore(): void {
    const appModelList = [...modelsData]
    storage.setDataPath(this.modelsDirectoryPath)

    storage.has('models', function (_error: never, hasKey: boolean) {
      if (!hasKey) {
        storage.set('models', appModelList)
      } else {
        const storageModels: Model[] = storage.getSync('models')

        appModelList.forEach(function (model: Model) {
          const index = storageModels.findIndex((storedModel) => storedModel.name === model.name)
          if (index > -1) {
            model.downloadPath = storageModels[index].downloadPath
          }
        })
      }
      storage.set('models', appModelList)
    })
  }
}

export const whisperService = WhisperService.Instance
