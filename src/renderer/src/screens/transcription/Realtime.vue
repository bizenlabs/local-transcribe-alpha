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
import { defaultTranscript, UseWhisperTranscript } from '@/screens/transcription/whisper.types'
// import { RawAxiosRequestHeaders } from 'axios'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RawAxiosRequestHeaders } from 'axios'
import { IMediaRecorder } from 'extendable-media-recorder'
// import { IMediaRecorder, MediaRecorder, register } from 'extendable-media-recorder'
// import { connect } from 'extendable-media-recorder-wav-encoder'
// import Blob from

const isModelAvailable = ref<boolean>(false)
const isModelLoading = ref<boolean>(false)
const models = ref<Model[]>([])
const selectedModel = ref<number>(0)

const chunks = ref<Blob[]>([])
// const bigBlob = ref<Blob>(new Blob())
// const encoder = ref<Encoder>()
// const listener = ref<Harker>()
const recorder = ref<IMediaRecorder>()
const stream = ref<MediaStream>()
const audioDevices = ref<MediaDeviceInfo[]>()
const selectedAudioDeviceId = ref<string>()

// const timeout = ref<UseWhisperTimeout>(defaultTimeout)

const isRecording = ref<boolean>(false)
// const speaking = ref<boolean>(false)
// const transcribing = ref<boolean>(false)
const transcript = ref<UseWhisperTranscript>(defaultTranscript)

function setAudioDevices(): void {
  navigator.mediaDevices.enumerateDevices().then((mediaDevices: MediaDeviceInfo[]) => {
    const devices = mediaDevices.filter((mediaDevice: MediaDeviceInfo) => {
      return mediaDevice.kind === 'audioinput'
    })
    if (devices.length > 0) {
      audioDevices.value = devices
      selectedAudioDeviceId.value = devices[0].deviceId
    }
  })
}

/**
 * get user media stream event
 * - try to stop all previous media streams
 * - ask user for media stream with a system popup
 * - register hark speaking detection listeners
 */
const startStream = async (): Promise<void> => {
  stopStream()
  stream.value = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: selectedAudioDeviceId.value
    }
  })
}

const stopStream = (): void => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = undefined
  }
}
const createRecorder = async (): Promise<void> => {
  if (recorder.value) {
    recorder.value.stop()
    recorder.value = undefined
  }
  if (stream.value) {
    // const audioContext = new AudioContext({
    //   sampleRate: 16000
    // })
    // const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, {
    //   mediaStream: stream.value
    // })
    // const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext)
    // mediaStreamAudioSourceNode.connect(mediaStreamAudioDestinationNode)
    //
    // recorder.value = new MediaRecorder(stream.value, {
    //   mimeType: 'audio/webm'
    // })
    recorder.value = new MediaRecorder(stream.value)
    recorder.value.onstart = () => {
      console.log('recorder start')
      chunks.value = []
    }

    recorder.value.ondataavailable = (e) => {
      chunks.value.push(e.data)
      console.log('ondataavailable', e)
      console.log('ondataavailable:chunks', chunks.value.length)
    }

    recorder.value.onstop = async () => {
      const blob = new Blob(chunks.value)
      // console.log('onstop blob size', blob.size, blob.type, recorder.value?.mimeType)
      console.log('recorder stop')
      const file = new File([blob], 'speech.mp3')
      console.log('recorder file', file.size)
      const text = await whisperTranscribe(file)
      console.log('onTranscribing', { text })
      //stop stream
      //Final Transcribe
    }
  }
}
const stopRecorder = async (): Promise<void> => {
  if (recorder.value) {
    const recordState = recorder.value.state
    if (recordState === 'recording' || recordState === 'paused') {
      recorder.value.stop()
    }
    recorder.value = undefined
    isRecording.value = false
  }
}
const startRecording = async (): Promise<void> => {
  isRecording.value = true
  await startStream()
  await createRecorder()
  recorder.value?.start(500)
}

const stopRecording = async (): Promise<void> => {
  await stopRecorder()
  stopStream()
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
// const onTranscribing = async (): Promise<void> => {
//   console.log('transcribing speech')
//   try {
//     if (recorder.value) {
//       const recordState = await recorder.value.getState()
//       if (recordState === 'stopped') {
//         transcribing.value = true
//         let blob = await recorder.value.getBlob()
//         console.log('onTranscribing', blob.size, blob.type)
//         const buffer = await blob.arrayBuffer()
//         console.log({ wav: buffer.byteLength })
//
//         const file = new File([blob], 'speech.mp3', { type: 'audio/mpeg' })
//         const text = await whisperTranscribe(file)
//         console.log('onTranscribing', { text })
//         transcript.value = {
//           blob,
//           text
//         }
//         transcribing.value = false
//       }
//     }
//   } catch (err) {
//     console.info(err)
//     transcribing.value = false
//   }
// }

// function onSelectedDeviceChanged(): void {
//   const deviceId = e.target.value
//   const device = audioDevices.find((d) => d.deviceId === deviceId)
//   if (device) {
//     setSelectedAudioDevice(device)
//     console.log('Selected audio device:', device.label)
//   } else {
//     console.error('Selected device not found:', deviceId)
//   }
// }

async function onSelectedModelChanged(): Promise<void> {
  isModelLoading.value = true
  let model = models.value.find((t) => t.id === selectedModel.value)
  if (model) {
    await window.asr.loadModel({ ...model })
  }
  await getModelList()
  isModelLoading.value = false
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
  console.log('call before:')
  const response = await axios.post('http://127.0.0.1:8090/' + 'inference', body, {
    headers
  })
  console.log('call after:')
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
// const onStopStreaming = (): void => {
//   if (stream.value) {
//     stream.value.getTracks().forEach((track) => track.stop())
//     stream.value = undefined
//   }
// }

// async function onDataAvailable(blob: Blob): Promise<void> {
//   console.log('onDataAvailable', blob.type)
//   chunks.value.push(blob)
//
//   // // chunks.value.console.log('number of chunks', chunks.value.length)
//   // let combinedBlob = new Blob([bigBlob.value, blob])
//   // console.log('combinedBlob', combinedBlob.size)
//   // console.log('blob', blob.size)
//   // console.log('bigBlob before', bigBlob.value.size)
//   // bigBlob.value = combinedBlob
//   // console.log('bigBlob after', bigBlob.value.size)
//   const file = new File(chunks.value, 'segment.wav', { type: 'audio/wav' })
//   // // const file = new File([combinedBlob], 'segment.mp3', { type: 'audio/mpeg' })
//   // console.log('file', file.size)
//   const text = await whisperTranscribe(file)
//   // transcript.value.text += text
//   // transcript.value.blob = combinedBlob
//   // console.log('onDataAvailable', text)
//   transcript.value = {
//     blob,
//     text
//   }
// }

onMounted(async () => {
  await getModelList()
  // await register(await connect())
  setAudioDevices()
  selectedModel.value = models.value[0].id
  // var intervalID = setInterval(requestDataIfRecorderAvailable, 1000)
  // console.log('intervalID', intervalID)
  // updateTranscriptionProgress()
  // updateDownloadProgress()
  // getDownloadedModelsAndSaveInRef()
  // getRunningModelsAndSaveInRef()
})

// function requestDataIfRecorderAvailable(): void {
//   console.log('requestDataIfRecorderAvailable', recorder.value?.state)
//   if (recorder.value && recorder.value.state === 'recording') {
//     recorder.value.requestData()
//     console.log('requested data')
//   }
// }

async function getModelList(): Promise<void> {
  console.log('getModelList')
  const result = await window.asr.getModels()
  if (result.length > 0) {
    models.value = result
    let index = result.findIndex((model) => model.downloadPath !== null)
    if (index >= 0) {
      console.log('index found', index)
      isModelAvailable.value = true
    }
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
      <Label class="m-2 font-bold text-black" for="select-model">Audio:</Label>
      <Select
        id="select-audio-device"
        v-model="selectedAudioDeviceId"
        :disabled="!isModelAvailable"
      >
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Select Audio Device" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="device in audioDevices"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Label class="m-2 font-bold text-black" for="select-model">Model:</Label>
      <Select
        id="select-model"
        v-model="selectedModel"
        :disabled="!isModelAvailable"
        @update:model-value="onSelectedModelChanged()"
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
              <span
                :class="[
                  model.loaded
                    ? 'bg-green-400 forced-colors:bg-[Highlight]'
                    : 'bg-gray-200 dark:bg-white/25',
                  'inline-block size-2 shrink-0 rounded-full border border-transparent'
                ]"
                aria-hidden="true"
              />
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <div v-if="!isRecording" class="ml-3 mr-4">
          <Button :disabled="!isModelAvailable" @click="startRecording">
            <Mic class="mr-2 h-4 w-4" />
            Start Transcription
          </Button>
        </div>

        <div v-if="isRecording" class="ml-3 mr-4">
          <Button variant="destructive" :disabled="!isModelAvailable" @click="stopRecording">
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
