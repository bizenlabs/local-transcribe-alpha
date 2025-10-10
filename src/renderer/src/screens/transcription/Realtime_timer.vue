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
import { RawAxiosRequestHeaders } from 'axios'
import { ScrollArea } from '@/components/ui/scroll-area'
import RecordRTC, { Options } from 'recordrtc'
import { StereoAudioRecorder } from 'recordrtc'

const isModelAvailable = ref<boolean>(false)
const isModelLoading = ref<boolean>(false)
const models = ref<Model[]>([])
const selectedModel = ref<number>(0)
const isTranscribing = ref<boolean>(false)

const stream = ref<MediaStream>()
const recorder = ref<RecordRTC>()

const transcript = ref<string>('')

async function startTranscription(): Promise<void> {
  transcript.value = ''
  stopStream()
  await startStream()
  await startRecorder()
  isTranscribing.value = true
}

async function stopTranscription(): Promise<void> {
  await stopRecorder()
  await recorder.value?.destroy()
  // await transcribe()
  stopStream()
  isTranscribing.value = false
}

async function transcribeTimerCallback(): Promise<void> {
  if (isTranscribing.value === true) {
    console.log('transcribeTimerCallback')
    await stopRecorder()
    console.log('transcribeTimerCallback stopRecorder')

    await transcribe()
    console.log('transcribeTimerCallback transcribe')

    await startRecorder()
    console.log('transcribeTimerCallback startRecorder')
  }
}

async function startStream(): Promise<void> {
  stream.value = await navigator.mediaDevices.getUserMedia({
    audio: true
  })
}
function stopStream(): void {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
    stream.value = undefined
  }
}
// const recorderConfig: Options = {
//   mimeType: 'audio/wav',
//   numberOfAudioChannels: 1,
//   recorderType: StereoAudioRecorder,
//   sampleRate: 44100,
//   type: 'audio'
// }
async function startRecorder(): Promise<void> {
  if (!stream.value) {
    await startStream()
  }
  if (stream.value) {
    // const {
    //   default: { RecordRTCPromisesHandler, StereoAudioRecorder }
    // } = await import('recordrtc')
    const recorderConfig: Options = {
      mimeType: 'audio/wav',
      numberOfAudioChannels: 1, // mono
      recorderType: StereoAudioRecorder,
      desiredSampRate: 16000, // Sample rate = 44.1khz
      type: 'audio'
    }
    recorder.value = new RecordRTC(stream.value, recorderConfig)
    const recordState = await recorder.value.getState()
    if (recordState === 'inactive' || recordState === 'stopped') {
      await recorder.value.startRecording()
    }
  }
}

async function stopRecorder(): Promise<void> {
  if (recorder.value) {
    const recordState = await recorder.value.getState()
    if (recordState === 'recording' || recordState === 'paused') {
      await recorder.value.stopRecording()
    }
  }
}
async function transcribe(): Promise<void> {
  if (recorder.value) {
    const recordState = await recorder.value.getState()
    if (recordState === 'stopped') {
      let blob = await recorder.value.getBlob()
      const buffer = await blob.arrayBuffer()
      console.log({ wav: buffer.byteLength })
      const file = new File([blob], 'speech.mp3', { type: 'audio/mpeg' })
      let segment = await whisperTranscribe(file)
      transcript.value += segment
    }
  }
}

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

onMounted(async () => {
  await getModelList()
  selectedModel.value = models.value[0].id

  let intervalID = setInterval(transcribeTimerCallback, 2000)
  console.log('recordAndTranscribe:intervalID', intervalID)
})

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
      <Label class="m-2 font-bold text-black" for="select-model">Model:</Label>
      <Select
        id="select-model"
        v-model="selectedModel"
        :disabled="!isModelAvailable || isTranscribing"
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
        <div v-if="!isTranscribing" class="ml-3 mr-4">
          <Button :disabled="!isModelAvailable" @click="startTranscription">
            <Mic class="mr-2 h-4 w-4" />
            Start Transcription
          </Button>
        </div>

        <div v-if="isTranscribing" class="ml-3 mr-4">
          <Button variant="destructive" :disabled="!isModelAvailable" @click="stopTranscription">
            <CircleStop class="mr-2 h-4 w-4" />
            Stop Transcription
          </Button>
        </div>
      </div>
    </div>
  </div>
  <section id="transcript">
    <ScrollArea class="h-[200px] rounded-md border p-4 mt-2"> {{ transcript }} </ScrollArea>
  </section>
</template>

<style scoped></style>
