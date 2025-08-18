import { app } from 'electron'
import path, { resolve } from 'path'

import storage from 'electron-json-storage'

import { modelsData as appModelList } from './models'
import type { Model } from '../../types/model'

import {
  AutoProcessor,
  AutoTokenizer,
  full,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
  WhisperForConditionalGeneration
} from '@huggingface/transformers'

import { convertToWavType } from '../utils/fileConverter'
import { createRequire } from 'node:module'
import { promisify } from 'node:util'
import { downloadFile } from '../utils/fileDownloader'
import { DownloaderReport } from 'nodejs-file-downloader'
import { WhisperParams } from '../../types/whisperParameters'

let binPath: string
if (process.platform == 'darwin') {
  binPath = path
    .join(__dirname, '../../resources/bin/mac-whisper/addon.node')
    .replace('app.asar', 'app.asar.unpacked')
} else {
  binPath = path
    .join(__dirname, '../../resources/bin/windows/addon.node')
    .replace('app.asar', 'app.asar.unpacked')
}

class ModelService {
  private static _instance: ModelService
  private readonly modelsDirectoryPath: string = resolve(app.getPath('userData'), 'models')
  private static models: Model[] = []

  static tokenizer: PreTrainedTokenizer
  static processor: Processor
  static model: PreTrainedModel
  static processing: boolean = false
  MAX_NEW_TOKENS = 64

  private constructor() {
    console.log('ModelService constructor')
    storage.setDataPath(this.modelsDirectoryPath)
    storage.has('models', function (_error: never, hasKey: boolean) {
      if (!hasKey) {
        storage.set('models', appModelList)
        ModelService.models = appModelList
      } else {
        const storageModels: Model[] = storage.getSync('models')
        storageModels.forEach((storeModel: Model) => {
          const index = appModelList.findIndex((model) => {
            return model.name === storeModel.name && storeModel.downloadPath != ''
          })
          if (index !== -1) {
            console.log('Model found Index', index)
            appModelList[index].downloadPath = storeModel.downloadPath
          }
        })
        storage.set('models', appModelList)
        ModelService.models = storage.getSync('models')
      }
    })
  }
  async downloadModel(
    model: Model,
    onProgress: (percentage: string) => void
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
        ModelService.models = modelsInStore
      }
    }
    return downloadReport
  }

  // async transcribeAudio(buffer: Float32Array<ArrayBuffer>) {
  //   const whisperParams = {
  //     model: modelPath,
  //     fname_inp: convertedAudioFilePath,
  //     use_gpu: params.use_gpu,
  //     flash_attn: false,
  //     no_prints: true,
  //     comma_in_time: false,
  //     translate: true,
  //     no_timestamps: false,
  //     detect_language: false,
  //     audio_ctx: 0,
  //     max_len: 0,
  //     n_processors: params.n_threads,
  //     print_progress: true,
  //     print_colors: true,
  //     progress_callback
  //   }
  //
  //   console.log('bin path', binPath)
  //   const { whisper } = require(binPath)
  //   const whisperAsync = promisify(whisper)
  //
  //   const result = await whisperAsync(whisperParams)
  // }

  async transcribeFileWhisper(
    audioFilePath: string,
    modelPath: string,
    language: string,
    params: WhisperParams,
    progress_callback: (percentage: number) => void
  ): Promise<string[]> {
    console.log('Transcribing:', modelPath, audioFilePath, language)
    console.log('Params:', params)
    const convertedAudioFilePath = await convertToWavType(audioFilePath)
    console.log('convertedAudioFilePath:', convertedAudioFilePath)
    const whisperParams = {
      language,
      model: modelPath,
      fname_inp: convertedAudioFilePath,
      use_gpu: params.use_gpu,
      flash_attn: false,
      no_prints: true,
      comma_in_time: false,
      translate: true,
      no_timestamps: false,
      detect_language: false,
      audio_ctx: 0,
      max_len: 0,
      n_threads: params.n_threads,
      n_processors: params.n_processors,
      progress_callback
    }
    const require = createRequire(import.meta.url)
    console.log('bin path', binPath)
    const { whisper } = require(binPath)
    const whisperAsync = promisify(whisper)
    const result = await whisperAsync(whisperParams)
    // console.log(result.transcription)
    return Promise.resolve(result.transcription)
  }

  public static get Instance(): ModelService {
    return this._instance || (this._instance = new this())
  }

  async loadModel(modelName: string): Promise<string> {
    console.log('Loading model:', modelName)
    const [tokenizer, processor, model] = await this.createModel(modelName)
    ModelService.tokenizer = tokenizer
    ModelService.processor = processor
    ModelService.model = model
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await ModelService.model.generate({
      inputs: full([1, 80, 3000], 0.0)
    })
    console.log('Model loaded:', modelName)
    return Promise.resolve(modelName)
  }

  private async createModel(
    modelName: string
  ): Promise<[PreTrainedTokenizer, Processor, PreTrainedModel]> {
    const tokenizer = AutoTokenizer.from_pretrained(modelName)
    const processor = AutoProcessor.from_pretrained(modelName)
    const model = WhisperForConditionalGeneration.from_pretrained(modelName, {
      dtype: {
        encoder_model: 'fp32', // 'fp16' works too
        decoder_model_merged: 'q4' // or 'fp32' ('fp16' is broken)
      }
    })
    return Promise.all([tokenizer, processor, model])
  } //TODO : unloadModel

  async getModels(): Promise<Model[]> {
    return Promise.resolve(ModelService.models)
  }

  async getDownloadedModels(): Promise<Model[]> {
    const modelsInStore: Model[] = storage.getSync('models')
    return Promise.resolve(modelsInStore.filter((model) => model.downloadPath !== undefined))
  }

  getModelsDirectoryPath(): string {
    return this.modelsDirectoryPath
  }
}

export const modelService = ModelService.Instance
