<script lang="ts" setup>
import { Separator } from '@/components/ui/separator'
import {
  AudioLines,
  Brain,
  Check,
  ChevronsUpDown,
  FileDown,
  FolderPlus,
  Search,
  Trash,
  TvMinimalPlay,
  Rows4,
  Scroll,
  FileUp
} from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
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
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger
} from '@/components/ui/combobox'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, millisToMinutesAndSeconds } from '@/lib/utils'
import { languages } from '../../../../types/languageCodes'
import { Badge } from '@/components/ui/badge'
import VueMarkdown from 'vue-markdown-render'
import MarkdownItAnchor from 'markdown-it-anchor'

import { Input } from '@/components/ui/input'
import { AlertDescription } from '@/components/ui/alert'
import { VideoProgress } from 'ytdlp-nodejs'
import ollama, { ModelResponse } from 'ollama/browser'
import { isValidHttpUrl } from '@/utils/urlValidator'
import ModelNotDownloaded from '@/screens/transcription/ModelNotDownloaded.vue'
import { Transcript } from '../../../../types/transcript.type'

const downloadedModels = ref<ModelResponse[]>([])
const runningModels = ref<ModelResponse[]>([])
const selectedOllamaModel = ref<string>('llama3.2:3b')

async function getDownloadedModelsAndSaveInRef(): Promise<void> {
  downloadedModels.value = (await ollama.list()).models
  console.log('downloadedModels', downloadedModels.value)
}

async function getRunningModelsAndSaveInRef(): Promise<void> {
  runningModels.value = (await ollama.ps()).models
  console.log('runningModels', runningModels.value)
}

function isModelOnline(modelName: string): boolean {
  return runningModels.value.findIndex((ollamaModel) => ollamaModel.name === modelName) !== -1
}

const heading = ref<string>('File Transcription')
const filePath = ref('')
const transcriptionTimestamp = ref<string[]>([])
const transcription = ref<string>('')
const transcript = ref<Transcript>()
const summary = ref<string>()
const isTranscribing = ref<boolean>(false)
const isModelAvailable = ref<boolean>(false)

const models = ref<Model[]>([])
const selectedModel = ref<number>(0)
const transcriptionPercentage = ref<number>(0)
const timeTakenToTranscribe = ref<string>('')
const timeTakenToSummarize = ref<string>('')
const youTubeUrl = ref<string>('')
const isValidYouTubeUrl = ref<boolean>(true)
const isDownloadInProgress = ref<boolean>(false)
const downloadPercentage = ref<number>(0)

const isOllamaSummarize = ref<boolean>(false)
const lang = ref<(typeof languages)[0]>(languages[0])
const plugins = [MarkdownItAnchor]
const prompt = ref<string>('')
const downloadUrl = ref<string>('')

const isModelLoading = ref<boolean>(false)
const transcriptView = ref<'transcript' | 'segment'>('transcript')

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

onMounted(async () => {
  await getModelList()
  selectedModel.value = models.value[0].id
  updateTranscriptionProgress()
  updateDownloadProgress()
  await getDownloadedModelsAndSaveInRef()
  await getRunningModelsAndSaveInRef()
})

function updateTranscriptionView(view: 'transcript' | 'segment'): void {
  transcriptView.value = view
  console.log('transcriptionView', view)
  prepareDownloadUrl()
}

function prepareDownloadUrl(): void {
  if (transcriptView.value === 'transcript') {
    if (transcript.value?.text) {
      let blob = new Blob([transcript.value?.text], { type: 'text/plain' })
      downloadUrl.value = window.URL.createObjectURL(blob)
      console.log('downloadUrl', downloadUrl.value)
    }
  }
  if (transcriptView.value === 'segment') {
    if (transcript.value && transcript.value.segments) {
      let text = ''
      transcript.value.segments.forEach((segment) => {
        text += segment.start.toFixed(2) + '-' + segment.end.toFixed(2)
        text += '\n'
        text += segment.text
        text += '\n'
        console.log(text)
      })
      let blob = new Blob([text.replace(/\n/g, '\r\n')], { type: 'text/plain', endings: 'native' })
      downloadUrl.value = window.URL.createObjectURL(blob)
      console.log('seg text', text)
    }
  }
}

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
  transcription.value = ''
  transcript.value = undefined
  summary.value = ''
  let model = models.value.find((model) => model.id === selectedModel.value)
  if (model && model.downloadPath) {
    const startTime = performance.now()
    await window.asr.transcribeFileWhisper(filePath.value).then((result) => {
      transcript.value = result
      transcription.value = result.text
      transcriptionTimestamp.value = []
      isTranscribing.value = false
      prepareDownloadUrl()
    })
    const endTime = performance.now()
    timeTakenToTranscribe.value = millisToMinutesAndSeconds(endTime - startTime)
  }
}

async function validateURL(url: string): Promise<void> {
  console.log(url)
  isValidYouTubeUrl.value = isValidHttpUrl(youTubeUrl.value)
}
async function downloadYouTubeVideo(): Promise<void> {
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
  timeTakenToSummarize.value = ''
  if (!prompt.value) {
    return
  }
  // await getDownloadedModelsAndSaveInRef()
  // await getRunningModelsAndSaveInRef()
  const userPrompt = prompt.value ? prompt.value : 'Please summarize the following text: '
  console.log('userPrompt', userPrompt)
  const startTime = performance.now()
  isOllamaSummarize.value = true
  const response = await ollama.chat({
    model: selectedOllamaModel.value,
    stream: true,
    messages: [
      {
        role: 'user',
        content: userPrompt + '  ' + transcription.value
      }
    ]
  })

  for await (const part of response) {
    summary.value += part.message.content
  }
  const endTime = performance.now()
  timeTakenToSummarize.value = millisToMinutesAndSeconds(endTime - startTime)
  isOllamaSummarize.value = false
  prompt.value = ''
}
async function onSelectedModelChanged(): Promise<void> {
  isModelLoading.value = true
  let model = models.value.find((t) => t.id === selectedModel.value)
  if (model) {
    console.log('loading selectedModel', model.name)
    await window.asr.loadModel({ ...model })
  }
  await getModelList()
  isModelLoading.value = false
}
</script>

<template>
  <h4>{{ heading }}</h4>
  <Separator orientation="horizontal" />

  <div class="col-span-full">
    <ModelNotDownloaded v-if="!isModelAvailable" />

    <!--File not selected    -->
    <div
      v-if="!filePath"
      class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-2 py-10"
    >
      <div class="text-center">
        <span @click="selectFile">
          <FolderPlus class="mx-auto size-9 text-gray-300" />
          <strong class="mt-1 font-semibold text-gray-900">Select File</strong>
          <br />
          <strong class="text-xs/5 text-gray-600">mp3, wav up to X? MB</strong>
        </span>
      </div>

      <div class="text-center mx-1">
        <span>
          <TvMinimalPlay class="mx-auto size-9 text-gray-300"></TvMinimalPlay>
          <strong class="mt-1 font-semibold text-gray-900">YouTube</strong>
        </span>
        <Input
          v-model="youTubeUrl"
          class="w-full h-9"
          placeholder="https://www.youtube.com/watch?v=se0nIBJjVfI"
          type="url"
          @input="validateURL"
        />
        <Progress v-if="isDownloadInProgress" v-model="downloadPercentage" />
        <br />
        <Button v-if="youTubeUrl.trim() && isValidYouTubeUrl" @click="downloadYouTubeVideo">
          <FileDown></FileDown> Download
        </Button>
        <AlertDescription v-if="youTubeUrl.trim() && !isValidYouTubeUrl" class="text-red-600">
          Invalid URL.
        </AlertDescription>
      </div>
    </div>
  </div>

  <section v-if="filePath" id="transcription">
    <div class="flex items-center space-x-2 text-sm text-gray-500">
      <AudioLines class="inline" /> {{ filePath }}
      <Trash :size="18" class="ml-2 text-red-400 inline" @click="clearSelectedFile" />
      <div class="ml-auto mr-4">
        <Button :disabled="!isModelAvailable || isTranscribing" @click="transcribeFileWhisper">
          <AudioLines :class="{ 'animate-bounce': isTranscribing }" class="mr-2 h-4 w-4" />
          Start Transcription
        </Button>
      </div>
    </div>

    <div v-if="models.length > 0 && isModelAvailable">
      <br />
      <span v-if="isTranscribing">
        <Progress v-model="transcriptionPercentage" />
        <br />
      </span>

      <div id="transcription-parameters" class="flex items-center space-x-2 text-sm">
        <Label class="m-2 font-bold text-black" for="select-model">Model:</Label>
        <Select
          id="select-model"
          v-model="selectedModel"
          :disabled="!isModelAvailable || isTranscribing"
          @update:model-value="onSelectedModelChanged()"
        >
          <SelectTrigger class="w-[280px]">
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
        <br />
        <Label class="m-2 font-bold text-black" for="select-language">Language:</Label>
        <Combobox
          id="select-language"
          v-model="lang"
          :disabled="!isModelAvailable || isTranscribing"
          by="label"
        >
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child class="w-[280px]">
              <Button class="justify-between" variant="outline">
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
      </div>
    </div>
    <br />
  </section>

  <!--  {{ transcription }}-->

  <section>
    <div v-if="transcript">
      <Label class="font-bold text-black" for="select-model">
        Transcript:
        <span v-if="timeTakenToTranscribe"> ({{ timeTakenToTranscribe }} minutes)</span></Label
      >
      <div class="flex items-center space-x-1 w-[280px] cursor-pointer mt-3">
        <Badge variant="secondary" @click="updateTranscriptionView('transcript')">
          Transcript <Scroll />
        </Badge>
        <Badge variant="secondary" @click="updateTranscriptionView('segment')">
          Segments <Rows4 />
        </Badge>

        <a :href="downloadUrl" download="transcript.txt">
          <Badge variant="secondary"> Export <FileUp /> </Badge
        ></a>
      </div>

      <ScrollArea class="h-[200px] rounded-md border p-4 mt-3">
        <div v-if="transcriptView === 'transcript'">
          <p class="text-sm/7 text-gray-700 dark:text-gray-400">
            {{ transcript.text }}
          </p>
          <br />
        </div>
        <div v-if="transcriptView === 'segment'">
          <div v-for="seg in transcript.segments" :key="seg.id" class="flex flex-3">
            <Badge variant="secondary">
              {{ seg.start.toFixed(2) }} - {{ seg.end.toFixed(2) }}
            </Badge>
            <p class="text-sm/7 whitespace-pre-wrap text-gray-700 dark:text-gray-400">
              {{ seg.text }}
            </p>
            <br />
          </div>
        </div>
      </ScrollArea>

      <br />
      <div v-if="summary">
        <Label class="font-bold text-black" for="select-model">
          Output:
          <span v-if="timeTakenToSummarize"> ({{ timeTakenToSummarize }} minutes)</span>
        </Label>

        <ScrollArea class="h-[200px] rounded-md border p-4 mt-2">
          <vue-markdown
            :plugins="plugins"
            :source="summary"
            class="text-sm/7 whitespace-pre-wrap"
          />
        </ScrollArea>
        <br />
      </div>

      <br />

      <div class="grid w-full gap-2">
        <Select v-model="selectedOllamaModel" @update:open="getRunningModelsAndSaveInRef">
          <SelectTrigger class="w-[280px]">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="model in downloadedModels" :key="model.name" :value="model.name">
              {{ model.name }}
              <span
                :class="[
                  isModelOnline(model.name)
                    ? 'bg-green-400 forced-colors:bg-[Highlight]'
                    : 'bg-gray-200 dark:bg-white/25',
                  'inline-block size-2 shrink-0 rounded-full border border-transparent'
                ]"
                aria-hidden="true"
              />
            </SelectItem>
          </SelectContent>
        </Select>
        <div class="flex items-center space-x-1 w-[280px] cursor-pointer">
          <Badge variant="secondary" @click="prompt = 'Summarize this transcript.'">
            Summarize
          </Badge>
          <Badge
            variant="secondary"
            @click="prompt = 'Extract all questions asked in this transcript.'"
          >
            Extract questions
          </Badge>
          <Badge
            variant="secondary"
            @click="
              prompt = 'Extract questions Identify and highlight the key points in this transcript.'
            "
          >
            Highlight Key points
          </Badge>
        </div>

        <Textarea
          v-model="prompt"
          class="min-h-[120px]"
          :disabled="isOllamaSummarize"
          placeholder="Chat with your transcript."
          @keydown.enter.exact.prevent="ollamaSummarize()"
        />

        <Button :disabled="isOllamaSummarize" @click="ollamaSummarize"><Brain></Brain>Enter</Button>
      </div>
    </div>
  </section>
  <br />
</template>
