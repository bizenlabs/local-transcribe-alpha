<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import ModelNotDownloaded from '@/screens/transcription/ModelNotDownloaded.vue'
import { onMounted, ref } from 'vue'
import type { Model } from '../../../../types/model'
import { Label } from '@/components/ui/label'
import { Mic, CircleStop } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { Options, RecordRTCPromisesHandler } from 'recordrtc'
import { defaultTranscript, UseWhisperTranscript } from '@/screens/transcription/whisper.types'
import { RawAxiosRequestHeaders } from 'axios'
import { ScrollArea } from '@/components/ui/scroll-area'

const isModelAvailable = ref<boolean>(false)
const models = ref<Model[]>([])
const selectedModel = ref<number>(0)
const isTranscribing = ref<boolean>(false)

const chunks = ref<Blob[]>([])
// const encoder = ref<Encoder>()
// const listener = ref<Harker>()
const recorder = ref<RecordRTCPromisesHandler>()
const stream = ref<MediaStream>()
// const timeout = ref<UseWhisperTimeout>(defaultTimeout)

const recording = ref<boolean>(false)
// const speaking = ref<boolean>(false)
const transcribing = ref<boolean>(false)
const transcript = ref<UseWhisperTranscript>(defaultTranscript)

/**
 * get user media stream event
 * - try to stop all previous media streams
 * - ask user for media stream with a system popup
 * - register hark speaking detection listeners
 */
const onStartStreaming = async (): Promise<void> => {
  try {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
    }
    stream.value = await navigator.mediaDevices.getUserMedia({
      audio: true
    })
  } catch (err) {
    console.error(err)
  }
}

/**
 * stop speech recording event
 * - flush out lamejs encoder and set it to undefined
 * - if recorder state is recording or paused, stop the recorder
 * - stop user media stream
 * - clear stop timeout
 * - set recording state to false
 * - start Whisper transcription event
 * - destroy recordrtc instance and clear it from ref
 */
const onStopRecording = async (): Promise<void> => {
  try {
    if (recorder.value) {
      const recordState = await recorder.value.getState()
      if (recordState === 'recording' || recordState === 'paused') {
        await recorder.value.stopRecording()
      }
      onStopStreaming()
      recording.value = false
      await onTranscribing()
      await recorder.value.destroy()
      chunks.value = []
      recorder.value = undefined
    }
  } catch (err) {
    console.error(err)
  }
}

/**
 * start Whisper transcrition event
 * - make sure recorder state is stopped
 * - set transcribing state to true
 * - get audio blob from recordrtc
 * - if config.removeSilence is true, load ffmpeg-wasp and try to remove silence from speec
 * - if config.customServer is true, send audio data to custom server in base64 string
 * - if config.customServer is false, send audio data to Whisper api in multipart/form-data
 * - set transcript object with audio blob and transcription result from Whisper
 * - set transcribing state to false
 */
const onTranscribing = async (): Promise<void> => {
  console.log('transcribing speech')
  try {
    if (recorder.value) {
      const recordState = await recorder.value.getState()
      if (recordState === 'stopped') {
        transcribing.value = true
        let blob = await recorder.value.getBlob()
        const buffer = await blob.arrayBuffer()
        console.log({ wav: buffer.byteLength })

        const file = new File([blob], 'speech.mp3', { type: 'audio/mpeg' })
        const text = await whisperTranscribe(file)
        console.log('onTranscribing', { text })
        transcript.value = {
          blob,
          text
        }
        transcribing.value = false
      }
    }
  } catch (err) {
    console.info(err)
    transcribing.value = false
  }
}

async function whisperTranscribe(file: File): Promise<string> {
  let whisperConfig = {
    model: 'whisper-1',
    prompt: 'string',
    response_format: 'text',
    language: 'en'
  }

  // Whisper only accept multipart/form-data currently
  const body = new FormData()
  body.append('file', file)
  body.append('model', 'whisper-1')
  // if (mode === 'transcriptions') {
  //   body.append('language', whisperConfig?.language ?? 'en')
  // }
  if (whisperConfig?.prompt) {
    body.append('prompt', whisperConfig.prompt)
  }
  if (whisperConfig?.response_format) {
    body.append('response_format', whisperConfig.response_format)
  }
  // if (whisperConfig?.temperature) {
  //   body.append('temperature', `${whisperConfig.temperature}`)
  // }
  const headers: RawAxiosRequestHeaders = {}
  headers['Content-Type'] = 'multipart/form-data'
  // if (apiKey) {
  //   headers['Authorization'] = `Bearer ${apiKey}`
  // }
  const { default: axios } = await import('axios')
  const response = await axios.post('http://127.0.0.1:8090/' + 'inference', body, {
    headers
  })
  console.log('response', response.data.text)
  console.log('response', response)
  return response.data
}

/**
 * stop media stream event
 * - remove hark speaking detection listeners
 * - stop all media stream tracks
 * - clear media stream from ref
 */
const onStopStreaming = (): void => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = undefined
  }
}

function onDataAvailable(blob: Blob): void {
  console.log('onDataAvailable', blob)
}

onMounted(() => {
  getModelList()
  // updateTranscriptionProgress()
  // updateDownloadProgress()
  // getDownloadedModelsAndSaveInRef()
  // getRunningModelsAndSaveInRef()
})

function getModelList(): void {
  console.log('getModelList')
  window.asr.getModels().then((result) => {
    if (result.length > 0) {
      models.value = result
      selectedModel.value = models.value[0].id
      let index = result.findIndex((model) => model.downloadPath !== null)
      if (index >= 0) {
        console.log('index found', index)
        isModelAvailable.value = true
      }
    }
  })
}
/**
 * start speech recording event
 * - first ask user for media stream
 * - create recordrtc instance and pass media stream to it
 * - create lamejs encoder instance
 * - check recorder state and start or resume recorder accordingly
 * - start timeout for stop timeout config
 * - update recording state to true
 */
const onStartRecording = async (): Promise<void> => {
  try {
    if (!stream.value) {
      await onStartStreaming()
    }
    if (stream.value) {
      if (!recorder.value) {
        const {
          default: { RecordRTCPromisesHandler, StereoAudioRecorder }
        } = await import('recordrtc')
        const recorderConfig: Options = {
          mimeType: 'audio/wav',
          numberOfAudioChannels: 1, // mono
          recorderType: StereoAudioRecorder,
          sampleRate: 44100, // Sample rate = 44.1khz
          timeSlice: 1_000, // 1 sec
          type: 'audio',
          ondataavailable: onDataAvailable
        }
        recorder.value = new RecordRTCPromisesHandler(stream.value, recorderConfig)
      }
      // if (!encoder.current) {
      //   const { Mp3Encoder } = await import('lamejs')
      //   encoder.current = new Mp3Encoder(1, 44100, 96)
      // }
      const recordState = await recorder.value.getState()
      if (recordState === 'inactive' || recordState === 'stopped') {
        await recorder.value.startRecording()
      }
      if (recordState === 'paused') {
        await recorder.value.resumeRecording()
      }
      recording.value = true
    }
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <h2>Realtime Transcription</h2>
  <Separator orientation="horizontal" />
  <div class="col-span-full">
    <ModelNotDownloaded v-if="!isModelAvailable" />
    <div
      class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-2 py-10"
    >
      <Label class="m-2 font-bold text-black" for="select-model">Model:</Label>
      <Select
        id="select-model"
        v-model="selectedModel"
        :disabled="!isModelAvailable || isTranscribing"
      >
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="model in models"
              :key="model.id"
              :disabled="!model.downloadPath"
              :value="model.id"
            >
              {{ model.name }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <div v-if="!recording" class="ml-3 mr-4">
          <Button :disabled="!isModelAvailable || isTranscribing" @click="onStartRecording">
            <Mic class="mr-2 h-4 w-4" />
            Start Transcription
          </Button>
        </div>

        <div v-if="recording" class="ml-3 mr-4">
          <Button
            variant="destructive"
            :disabled="!isModelAvailable || isTranscribing"
            @click="onStopRecording"
          >
            <CircleStop class="mr-2 h-4 w-4" />
            Stop Transcription
          </Button>
        </div>
      </div>
    </div>
  </div>
  <section id="transcript">
    <ScrollArea class="h-[200px] rounded-md border p-4 mt-2"> {{ transcript.text }} </ScrollArea>
  </section>
</template>

<style scoped></style>

<!--        <div v-if="recording" class="ml-3 mr-4">-->
<!--          <Button-->
<!--            variant="outline"-->
<!--            :disabled="!isModelAvailable || isTranscribing"-->
<!--            @click="onPauseRecording"-->
<!--          >-->
<!--            <Pause class="mr-2 h-4 w-4" />-->
<!--            Pause Transcription-->
<!--          </Button>-->
<!--        </div>-->

<!--/**-->
<!--* pause speech recording event-->
<!--* - if recorder state is recording, pause the recorder-->
<!--* - clear stop timeout-->
<!--* - set recoriding state to false-->
<!--*/-->
<!--const onPauseRecording = async (): Promise<void> => {-->
<!--try {-->
<!--if (recorder.value) {-->
<!--const recordState = await recorder.value.getState()-->
<!--if (recordState === 'recording') {-->
<!--await recorder.value.pauseRecording()-->
<!--}-->
<!--recording.value = false-->
<!--}-->
<!--} catch (err) {-->
<!--console.error(err)-->
<!--}-->
<!--}-->
