<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import { Trash } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import {
  AudioLines,
  FolderPlus,
  AlertCircle,
  ChevronsUpDown,
  Search,
  Check,
  ChevronsUp
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { Model } from '../../../../types/model'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Combobox,
  ComboboxList,
  ComboboxGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxAnchor,
  ComboboxTrigger
} from '@/components/ui/combobox'
import { cn, millisToMinutesAndSeconds } from '@/lib/utils'
import { languages } from '../../../../types/languageCodes'
import { Switch } from '@/components/ui/switch'
import { WhisperParams } from '../../../../types/whisperParameters'
import { Slider } from '@/components/ui/slider'
import VueMarkdown from 'vue-markdown-render'
import MarkdownItAnchor from 'markdown-it-anchor'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronsDown, TvMinimalPlay, FileDown } from 'lucide-vue-next'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { AlertDescription } from '@/components/ui/alert'
import { VideoProgress } from 'ytdlp-nodejs'
import ollama from 'ollama/browser'

const heading = ref<string>('File Transcription')
const filePath = ref('')
const transcriptionTimestamp = ref<string[]>([])
const transcription = ref<string>('')
const summary = ref<string>()
const isTranscribing = ref<boolean>(false)
const isModelAvailable = ref<boolean>(false)
const useGPU = ref<boolean>(true)
const isOpen = ref(false)

const models = ref<Model[]>([])
const selectedModel = ref<number>(0)
const selectedLLMModel = ref<number>(0)
const transcriptionPercentage = ref<number>(0)
const timeTakenToTranscribe = ref<string>('')
const timeTakenToSummarize = ref<string>('')
const youTubeUrl = ref<string>('')
const isValidYouTubeUrl = ref<boolean>(true)
const numberOfThreads = ref<number[] | undefined>([8])
const numberOfProcessors = ref<number[] | undefined>([2])
const isDownloadInProgress = ref<boolean>(false)
const downloadPercentage = ref<number>(0)

const lang = ref<(typeof languages)[0]>(languages[0])
const plugins = [MarkdownItAnchor]

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

onMounted(() => {
  getModelList()
  updateTranscriptionProgress()
  updateDownloadProgress()
})

function updateDownloadProgress(): void {
  window.asr.onDownloadYTProgress((videoProgress: VideoProgress) => {
    console.log('videoProgress', videoProgress)
    downloadPercentage.value = videoProgress.percentage
  })
}

async function selectFile(): Promise<void> {
  filePath.value = await window.api.openFile()
}

function updateTranscriptionProgress(): void {
  window.asr.onTranscriptionProgress(
    (percentage: number) => (transcriptionPercentage.value = percentage)
  )
}

function clearSelectedFile(): void {
  filePath.value = ''
  transcriptionTimestamp.value = []
  transcription.value = ''
  summary.value = ''
  youTubeUrl.value = ''
}

async function transcribeFileWhisper(): Promise<void> {
  isTranscribing.value = true
  transcriptionPercentage.value = 0
  timeTakenToTranscribe.value = ''
  let model = models.value.find((model) => model.id === selectedModel.value)
  if (model && model.downloadPath) {
    const startTime = performance.now()
    const params: WhisperParams = {
      language: 'en',
      model: 'modelPath',
      fname_inp: 'convertedAudioFilePath',
      use_gpu: useGPU.value,
      flash_attn: false,
      no_prints: true,
      comma_in_time: false,
      translate: true,
      no_timestamps: true,
      detect_language: false,
      audio_ctx: 0,
      max_len: 0,
      n_threads: numberOfThreads.value ? numberOfThreads.value[0] : 2,
      n_processors: numberOfProcessors.value ? numberOfProcessors.value[0] : 2
    }
    await window.asr
      .transcribeFileWhisper(filePath.value, model.downloadPath, lang.value.value, params)
      .then((result) => {
        result.forEach((element) => {
          if (element[2]) {
            transcription.value += element[2]
          }
        })
        transcriptionTimestamp.value = result
        isTranscribing.value = false
      })
    const endTime = performance.now()
    timeTakenToTranscribe.value = millisToMinutesAndSeconds(endTime - startTime)
  }
}

// async function startLLMServer(): Promise<void> {
//   let model = models.value.find((model) => model.id === selectedLLMModel.value)
//   if (model && model.downloadPath) {
//     await window.asr.summarize('', model.downloadPath)
//   }
// }

async function startOllamaServer(): Promise<void> {
  await window.asr.startServer('', 'model?.downloadPath')
}

function isValidHttpUrl(urlToValidate: string): boolean {
  let url

  try {
    url = new URL(urlToValidate)
  } catch (_) {
    console.error(_)
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}
async function validateURL(url: string): Promise<void> {
  console.log(url)
  isValidYouTubeUrl.value = isValidHttpUrl(youTubeUrl.value)
}
async function downloadAudio(): Promise<void> {
  isValidYouTubeUrl.value = isValidHttpUrl(youTubeUrl.value)
  if (!isValidYouTubeUrl.value) {
    return
  }
  isDownloadInProgress.value = true
  downloadPercentage.value = 0
  window.asr.downloadYT(youTubeUrl.value).then((downloadPath) => {
    isDownloadInProgress.value = false
    filePath.value = downloadPath
    console.log(downloadPath)
  })
}

async function ollamaSummarize(): Promise<void> {
  summary.value = ''
  const startTime = performance.now()
  const response = await ollama.chat({
    model: 'llama3.2:1b',
    messages: [
      { role: 'user', content: 'Please summarize the following text: ' + transcription.value }
    ]
  })
  const endTime = performance.now()
  timeTakenToSummarize.value = millisToMinutesAndSeconds(endTime - startTime)
  summary.value = response.message.content
}

async function summarize(): Promise<void> {
  let count = 0
  summary.value = ''
  const startTime = performance.now()
  axios
    .post('http://127.0.0.1:8080/v1/chat/completions', {
      messages: [
        {
          role: 'user',
          content: 'Please summarize the following text: ' + transcription.value
        }
      ],
      stream: false,
      cache_prompt: false,
      reasoning_format: 'none',
      samplers: 'edkypmxt',
      temperature: 0.8,
      dynatemp_range: 0,
      dynatemp_exponent: 1,
      top_k: 40,
      top_p: 0.95,
      min_p: 0.05,
      typical_p: 1,
      xtc_probability: 0,
      xtc_threshold: 0.1,
      repeat_last_n: 64,
      repeat_penalty: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      dry_multiplier: 0,
      dry_base: 1.75,
      dry_allowed_length: 2,
      dry_penalty_last_n: -1,
      max_tokens: -1,
      timings_per_token: false
    })
    .then(function (response) {
      console.log(response.data)
      const endTime = performance.now()
      timeTakenToSummarize.value = millisToMinutesAndSeconds(endTime - startTime)

      response.data['choices'].forEach((choice) => {
        summary.value += choice.message.content
      })
      console.log(count++)
    })
    .catch(function (error) {
      console.log(error)
    })
  // summary.value = await window.asr.summarize(transcription.value)
}
</script>

<template>
  <h4>{{ heading }}</h4>
  <Separator orientation="horizontal" />

  <div class="col-span-full">
    <div
      v-if="!isModelAvailable"
      id="no-model-downloaded"
      class="rounded-md bg-yellow-50 p-4 dark:bg-yellow-500/10 dark:outline dark:outline-yellow-500/15"
    >
      <div class="flex">
        <div class="shrink-0">
          <AlertCircle class="size-5 text-yellow-400 dark:text-yellow-300" aria-hidden="true" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-100">Download Model</h3>
          <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-100/80">
            <p>Please download a model to start transcription.</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="!filePath"
      class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-3 py-10"
    >
      <div class="text-center">
        <span @click="selectFile">
          <FolderPlus class="mx-auto size-9 text-gray-300" />
          <p class="mt-1 font-semibold text-gray-900">Select File</p>
          <p class="text-xs/5 text-gray-600">mp3, wav up to X? MB</p>
        </span>
      </div>
      <span class="size-9 text-gray-300"></span>

      <div class="text-center mx-20">
        <span>
          <TvMinimalPlay class="mx-auto size-9 text-gray-300"></TvMinimalPlay>
          <p class="mt-1 font-semibold text-gray-900">Transcribe YouTube</p>
        </span>
        <Input
          v-model="youTubeUrl"
          type="url"
          placeholder="https://www.youtube.com/watch?v=se0nIBJjVfI"
          @input="validateURL"
        />
        <Progress v-if="isDownloadInProgress" v-model="downloadPercentage" />
        <br />
        <Button v-if="isValidYouTubeUrl" @click="downloadAudio"
          ><FileDown></FileDown> Download</Button
        >

        <AlertDescription v-if="!isValidYouTubeUrl" class="text-red-600">
          Invalid URL.
        </AlertDescription>
      </div>
    </div>
  </div>

  <section v-if="filePath" id="transcription">
    <!--    <div>-->
    <!--      <p class="text-lg font-medium">Transcription Configuration</p>-->
    <!--      <p class="text-sm text-muted-foreground">-->
    <!--        Select the right configuration for your transcription.-->
    <!--      </p>-->
    <!--    </div>-->
    <!--    <Separator />-->
    <Label class="m-2">File</Label>
    <div class="flex items-center space-x-2 text-sm text-gray-500">
      <AudioLines class="inline" /> {{ filePath }}
      <Trash class="ml-2 text-red-400 inline" :size="18" @click="clearSelectedFile" />
      <div class="ml-auto mr-4">
        <br />
        <Button :disabled="!isModelAvailable || isTranscribing" @click="transcribeFileWhisper">
          <AudioLines class="mr-2 h-4 w-4" :class="{ 'animate-bounce': isTranscribing }" />
          Start Transcription
        </Button>
        <br />
        <br />

        <div v-if="transcription && transcription.length > 1">
          <Button @click="ollamaSummarize">
            <AudioLines class="mr-2 h-4 w-4" :class="{ 'animate-bounce': isTranscribing }" />
            Summarize
          </Button>
          <!--          <Label class="m-2" for="select-model">LLM Model</Label>-->
          <!--          <Select id="select-llm-model" v-model="selectedLLMModel">-->
          <!--            <SelectTrigger class="w-[280px]">-->
          <!--              <SelectValue placeholder="Select Model" />-->
          <!--            </SelectTrigger>-->
          <!--            <SelectContent>-->
          <!--              <SelectGroup>-->
          <!--                <SelectItem-->
          <!--                  v-for="model in models"-->
          <!--                  :key="model.id"-->
          <!--                  :value="model.id"-->
          <!--                  :disabled="!model.downloadPath"-->
          <!--                >-->
          <!--                  {{ model.name }}-->
          <!--                </SelectItem>-->
          <!--              </SelectGroup>-->
          <!--            </SelectContent>-->
          <!--          </Select>-->
          <!--          <br />-->
        </div>

        <br />

        <br />
      </div>
    </div>

    <div v-if="models.length > 0 && isModelAvailable">
      <br />
      <Progress v-if="isTranscribing" v-model="transcriptionPercentage" />
      <p v-if="timeTakenToTranscribe">Time Taken Transcribe: {{ timeTakenToTranscribe }} minutes</p>
      <p v-if="timeTakenToSummarize">Time Taken Summarize: {{ timeTakenToSummarize }} minutes</p>
      <Label class="m-2" for="select-model">Model</Label>
      <Select id="select-model" v-model="selectedModel">
        <SelectTrigger class="w-[280px]">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="model in models"
              :key="model.id"
              :value="model.id"
              :disabled="!model.downloadPath"
            >
              {{ model.name }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <br />
      <Label class="m-2" for="select-language">Language</Label>
      <Combobox id="select-language" v-model="lang" by="label">
        <ComboboxAnchor as-child>
          <ComboboxTrigger as-child class="w-[280px]">
            <Button variant="outline" class="justify-between">
              {{ lang?.label ?? 'Select language' }}

              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </ComboboxTrigger>
        </ComboboxAnchor>

        <ComboboxList class="w-[280px]">
          <div class="relative w-full max-w-sm items-center">
            <ComboboxInput
              class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10"
              placeholder="Select language..."
            />
            <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
              <Search class="size-4 text-muted-foreground" />
            </span>
          </div>

          <ComboboxEmpty> No language found. </ComboboxEmpty>

          <ComboboxGroup>
            <ComboboxItem v-for="language in languages" :key="language.value" :value="language">
              {{ language.label }}

              <ComboboxItemIndicator>
                <Check :class="cn('ml-auto h-4 w-4')" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          </ComboboxGroup>
        </ComboboxList>
      </Combobox>
      <br />
      <Collapsible v-model:open="isOpen" class="w-[300px]">
        <div class="flex items-center justify-between space-x-4 px-3">
          <!--          <h3 class="text-sm font-bold">Advanced Options</h3>-->
          <Label>Advanced Options</Label>
          <CollapsibleTrigger as-child>
            <Button variant="ghost" size="sm" class="w-9 p-0">
              <!--              <ChevronsUpDown class="h-4 w-4" />-->
              <ChevronsDown v-if="!isOpen" />
              <ChevronsUp v-if="isOpen" />
              <span class="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div class="flex items-center space-x-2">
            <Switch id="use-gpu" v-model="useGPU" />
            <Label for="use-gpu">Use GPU</Label>
          </div>
          <div class="flex items-center space-x-2 w-[280px]">
            <Label class="m-2 text-s" for="number-threads">Number of Threads</Label>
            <p>{{ numberOfThreads ? numberOfThreads[0] : '' }}</p>
            <Slider
              id="number-threads"
              :value="numberOfThreads"
              :default-value="[8]"
              :max="50"
              :min="1"
              :step="1"
              @update:model-value="(value) => (numberOfThreads = value)"
            />
          </div>
          <div class="flex items-center space-x-2 w-[280px]">
            <Label class="m-2 text-s" for="number-threads">Number of Processors</Label>
            <p>{{ numberOfProcessors ? numberOfProcessors[0] : '' }}</p>
            <Slider
              id="number-threads"
              :value="numberOfProcessors"
              :default-value="[8]"
              :max="16"
              :min="1"
              :step="1"
              @update:model-value="(value) => (numberOfProcessors = value)"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
    <br />
  </section>

  <div v-if="summary">
    <h2>Summary</h2>

    <vue-markdown :source="summary" :plugins="plugins" />

    <!--    {{ summary }}-->
    <!--    <div v-html="summary"></div>-->
  </div>

  <br /><br />
  <!--  {{ transcription }}-->
  <br /><br />
  <section>
    <div v-if="transcriptionTimestamp && transcriptionTimestamp.length > 0">
      <div v-for="(snippet, index) in transcriptionTimestamp" :key="index">
        {{ snippet }}
      </div>
    </div>
  </section>
</template>

<style scoped></style>
