import { app } from 'electron'
import { resolve } from 'path'

import storage from 'electron-json-storage'
import log from 'electron-log/main'

import { modelsData as baseModelData } from './models'
import { Model } from '../../types/model'

import { snapshotDownload } from '@huggingface/hub'
import {
  AutomaticSpeechRecognitionOutput,
  AutoProcessor,
  AutoTokenizer,
  full,
  pipeline,
  PreTrainedModel,
  PreTrainedTokenizer,
  Processor,
  TextStreamer,
  WhisperForConditionalGeneration
} from '@huggingface/transformers'
import * as fs from 'node:fs'
import wavefile from 'wavefile'

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
    log.info('ModelService constructor')
    storage.setDataPath(this.modelsDirectoryPath)
    storage.has('models', function (_error: never, hasKey: boolean) {
      if (!hasKey) {
        storage.set('models', baseModelData)
        ModelService.models = baseModelData
      } else {
        ModelService.models = storage.getSync('models')
      }
    })
  }

  // private syncStorageConfigWithAppConfig(): void {
  //   console.log('Sync Storage Config', this.modelsDirectoryPath)
  //
  //   storage.has('models', function (_error: never, hasKey: boolean) {
  //     if (!hasKey) {
  //       console.log('Sync Storage Config key not found')
  //       storage.set('models', baseModelData)
  //       ModelService.models = baseModelData
  //     } else {
  //       const modelsInStore: Model[] = storage.getSync('models')
  //       baseModelData.forEach((model: Model) => {
  //         model.modelPath = modelsInStore.find(
  //           (storeModel) => model.model === storeModel.model
  //         )!.modelPath
  //       })
  //       storage.set('models', baseModelData)
  //       ModelService.models = baseModelData
  //     }
  //   })
  // }

  public static get Instance(): ModelService {
    return this._instance || (this._instance = new this())
  }

  async downloadModel(modelName: string): Promise<void> {
    const dir = await snapshotDownload({
      repo: modelName,
      cacheDir: this.getModelsDirectoryPath()
    })
    const modelsInStore: Model[] = storage.getSync('models')
    console.log('modelsInStore', modelsInStore)
    const index = modelsInStore.findIndex((model) => model.model === modelName)
    console.log('index', index)
    modelsInStore[index].modelPath = dir
    console.log('modelsInStore:updated', modelsInStore)
    storage.set('models', modelsInStore)
    ModelService.models = modelsInStore

    // indexOf((model) => model.model === modelName)
    // modelsInStore.find((model) => model.model === modelName)!.modelPath = dir
    // storage.set('models', modelsInStore, (error) => {
    //   if (error) {
    //     console.error('Error updating model download status:', error)
    //   } else {
    //     console.log(`Model ${modelName} downloaded and status updated.`)
    //   }
    // })
    console.log('downloadModel', dir)
  }

  // private updateDownloadedModelList(modelName: string, modelPath: string) {
  //   console.log('updateDownloadedModelList', modelName, modelPath)
  //   let modelsInStore: Model[] = []
  //   storage.get('models', function (error, data) {
  //     if (error) throw error
  //     modelsInStore = data
  //     console.log(data)
  //   })
  //   console.log('storage.getSync', modelsInStore)
  //   modelsInStore.find((model) => model.model === modelName)!.modelPath = modelPath
  //   storage.set('models', modelsInStore, (error) => {
  //     if (error) {
  //       console.error('Error updating model download status:', error)
  //     } else {
  //       console.log(`Model ${modelName} downloaded and status updated.`)
  //     }
  //   })
  // }

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

  async transcribeFile(audioFilePath: string, modelName: string): Promise<string[]> {
    console.log('Transcribe audio file:', audioFilePath, 'with model:', modelName)
    const buffer = fs.readFileSync(audioFilePath)
    const wav = new wavefile.WaveFile(buffer)
    wav.toBitDepth('32f')
    wav.toSampleRate(16000)

    let audioData = wav.getSamples(true)
    if (Array.isArray(audioData)) {
      console.log('Transcribe audio file is array:', audioData.length)
      audioData = audioData[0]
    }

    const transcriber = await pipeline('automatic-speech-recognition', modelName)
    const output = await transcriber(audioData, { chunk_length_s: 30, stride_length_s: 5 })
    const finalOutput: string[] = []
    if (Array.isArray(output)) {
      ;(output as AutomaticSpeechRecognitionOutput[]).forEach((o) => {
        finalOutput.push(o.text)
      })
    } else {
      finalOutput.push((output as AutomaticSpeechRecognitionOutput).text)
    }
    console.log('Transcribe audio file:', finalOutput)
    return Promise.resolve(finalOutput)
    // const streamer = new TextStreamer(ModelService.tokenizer, {
    //   skip_prompt: true,
    //   skip_special_tokens: true
    // })
    //
    // const inputs = await ModelService.processor(audioData)
    //
    // const outputs = await ModelService.model.generate({
    //   ...inputs,
    //   max_new_tokens: 64,
    //   streamer
    // })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // const decoded = ModelService.tokenizer.batch_decode(outputs, {
    //   skip_special_tokens: true
    // })

    // console.log(decoded)
  }

  // async transcribeAudio(audio: any, language: string = 'en'): Promise<string[] | void> {
  //   if (ModelService.processing) {
  //     console.warn('Model is already processing another audio input.')
  //     return Promise.resolve()
  //   }
  //   console.log('Language:', language)
  //   ModelService.processing = true
  //
  //   const streamer = new TextStreamer(ModelService.tokenizer, {
  //     skip_prompt: true,
  //     skip_special_tokens: true
  //     // callback_function: (text: string) => {
  //     //   console.log('Transcription:', text)
  //     // }
  //   })
  //
  //   const inputs = await ModelService.processor(audio)
  //
  //   const outputs = await ModelService.model.generate({
  //     ...inputs,
  //     max_new_tokens: 64,
  //     streamer
  //   })
  //
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   const decoded = ModelService.tokenizer.batch_decode(outputs, {
  //     skip_special_tokens: true
  //   })
  //   console.log(decoded)
  //   ModelService.processing = false
  //   return Promise.resolve(decoded)
  //
  //   // console.log('Transcribe audio:', audio)
  //   // console.warn('transcribeAudio is not implemented yet')
  //   // return Promise.resolve(['Transcription not implemented yet'])
  //   // const transcriber = await pipeline(
  //   //   'automatic-speech-recognition',
  //   //   'onnx-community/whisper-tiny_timestamped'
  //   // )
  //   // const start = performance.now()
  //   // const output = await transcriber(audio, {
  //   //   return_timestamps: true,
  //   //   chunk_length_s: 30
  //   // })
  //   // const end = performance.now()
  //   // console.log(`Execution duration: ${(end - start) / 1000} seconds`)
  //   // console.log(output)
  //   // return Promise.resolve(['output'])
  // }

  async getDownloadedModels(): Promise<Model[]> {
    const modelsInStore: Model[] = storage.getSync('models')
    return Promise.resolve(modelsInStore.filter((model) => model.modelPath !== undefined))
  }

  getModelsDirectoryPath(): string {
    return this.modelsDirectoryPath
  }

  // async transcribeFile(
  //   audioFilePath: string,
  //   modelName: string
  // ): Promise<AutomaticSpeechRecognitionOutput | AutomaticSpeechRecognitionOutput[]> {
  //   console.log('Transcribe audio file:', audioFilePath, 'with model:', modelName)
  //   const buffer = fs.readFileSync(audioFilePath)
  //   const wav = new wavefile.WaveFile(buffer)
  //   wav.toBitDepth('32f')
  //   wav.toSampleRate(16000)
  //   // const blob = new Blob([buffer], { type: 'audio/wav' })
  //   // const blobUrl = URL.createObjectURL(blob)
  //   // const audioObject = URL.createObjectURL(blobUrl)
  //
  //   let audioData = wav.getSamples(true)
  //   // let audioData = wav.toBase64()
  //   // let audioData = wav.to§()
  //   // new Float64Array()
  //   if (Array.isArray(audioData)) {
  //     console.log('Transcribe audio file is array:', audioData.length)
  //     audioData = audioData[0]
  //   }
  //
  //   const transcriber = await pipeline('automatic-speech-recognition', modelName)
  //   const start = performance.now()
  //   const output = await transcriber(audioData, {
  //     return_timestamps: true,
  //     chunk_length_s: 30
  //   })
  //   const end = performance.now()
  //   console.log(`Execution duration: ${(end - start) / 1000} seconds`)
  //   console.log(output)
  //   return output
  // }
}

export const modelService = ModelService.Instance
