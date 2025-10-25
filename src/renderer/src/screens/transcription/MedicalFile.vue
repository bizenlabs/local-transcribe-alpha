<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import { AudioLines, Trash } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ollama, { ModelResponse } from 'ollama/browser'
import { millisToMinutesAndSeconds } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import MarkdownItAnchor from 'markdown-it-anchor'
import VueMarkdown from 'vue-markdown-render'
import { ScrollArea } from '@/components/ui/scroll-area'

const filePath = ref('')
const selectedOllamaModel = ref<string>('')
const downloadedModels = ref<ModelResponse[]>([])
const runningModels = ref<ModelResponse[]>([])
const plugins = [MarkdownItAnchor]
const prompt = ref<string>('')
const summary = ref<string>('')
const timeTaken = ref<string>('')
const base64Image = ref<string>('')
const isLLmInProgress = ref<boolean>(false)

onMounted(async () => {
  await getDownloadedModelsAndSaveInRef()
  await getRunningModelsAndSaveInRef()
})

function clearSelectedFile(): void {
  filePath.value = ''
}

async function getDownloadedModelsAndSaveInRef(): Promise<void> {
  try {
    downloadedModels.value = (await ollama.list()).models
  } catch (error) {
    console.log(error)
  }
  console.log('downloadedModels', downloadedModels.value)
}

async function getRunningModelsAndSaveInRef(): Promise<void> {
  runningModels.value = (await ollama.ps()).models
  console.log('runningModels', runningModels.value)
}

function isModelOnline(modelName: string): boolean {
  return runningModels.value.findIndex((ollamaModel) => ollamaModel.name === modelName) !== -1
}

async function ollamaSummarize(): Promise<void> {
  summary.value = ''
  timeTaken.value = ''
  isLLmInProgress.value = true

  const userPrompt = prompt.value ? prompt.value : 'Please describe this image '
  console.log('userPrompt', userPrompt)
  const startTime = performance.now()

  try {
    const response = await ollama.chat({
      model: selectedOllamaModel.value,
      stream: true,
      messages: [
        {
          role: 'user',
          content: userPrompt,
          images: [base64Image.value]
        }
      ]
    })

    for await (const part of response) {
      summary.value += part.message.content
    }
    const endTime = performance.now()
    timeTaken.value = millisToMinutesAndSeconds(endTime - startTime)
    prompt.value = ''
    isLLmInProgress.value = false
  } catch (error) {
    console.log(error)
    prompt.value = ''
    summary.value = ''
    isLLmInProgress.value = false
  }
}

function onChange(event): void {
  filePath.value = event.target.files[0]

  let file = event.target.files[0]
  const reader = new FileReader()

  reader.readAsDataURL(file)

  reader.onload = function () {
    // console.log(reader.result)
    let result = (reader.result as string).split('base64,')
    base64Image.value = result[1]
    // console.log(base64Image)
  }
  reader.onerror = function (error) {
    console.log('Error: ', error)
  }
}
</script>

<template>
  <h4>Image Analysis</h4>
  <Separator orientation="horizontal" />
  <!--  <label for="file-input" class="btn">-->
  <!--    Upload Image File: <input type="file" @change="onChange($event)" >-->
  <!--  </label>-->
  <!--  {{ selectedOllamaModel }}-->
  <div class="col-span-full">
    <!--File not selected    -->
    <div
      v-if="!filePath"
      class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-2 py-10"
    >
      <div class="text-center">
        <input type="file" @change="onChange($event)" />
        <!--        <span @click="selectFile">-->
        <!--          &lt;!&ndash;          <input type="file" @change="onChange($event)" >&ndash;&gt;-->
        <!--          <FolderPlus class="mx-auto size-9 text-gray-300" />-->
        <!--          <strong class="mt-1 font-semibold text-gray-900">Select File</strong>-->
        <!--          <br />-->
        <!--          <strong class="text-xs/5 text-gray-600">'jpg', 'jpeg', 'dcm', 'png'</strong>-->
        <!--        </span>-->
      </div>
    </div>
    <section v-if="filePath" id="transcription">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <AudioLines class="inline" /> {{ filePath }}
        <Trash :size="18" class="ml-2 text-red-400 inline" @click="clearSelectedFile" />
        <div class="ml-auto mr-4">
          <Button :disabled="isLLmInProgress || !selectedOllamaModel" @click="ollamaSummarize">
            <AudioLines class="mr-2 h-4 w-4" />
            Start Analysis
          </Button>
        </div>
      </div>
    </section>
  </div>
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
    <!--    <div class="flex items-center space-x-1 w-[280px] cursor-pointer">-->
    <!--      <Badge variant="secondary" @click="prompt = 'Summarize this transcript.'"> Summarize </Badge>-->
    <!--      <Badge-->
    <!--        variant="secondary"-->
    <!--        @click="prompt = 'Extract all questions asked in this transcript.'"-->
    <!--      >-->
    <!--        Extract questions-->
    <!--      </Badge>-->
    <!--      <Badge-->
    <!--        variant="secondary"-->
    <!--        @click="-->
    <!--          prompt = 'Extract questions Identify and highlight the key points in this transcript.'-->
    <!--        "-->
    <!--      >-->
    <!--        Highlight Key points-->
    <!--      </Badge>-->
    <!--    </div>-->
    <ScrollArea class="h-[200px] rounded-md border p-4 mt-2">
      <vue-markdown :plugins="plugins" :source="summary" class="text-sm/7 whitespace-pre-wrap" />
    </ScrollArea>

    <!--    <Textarea-->
    <!--      v-model="prompt"-->
    <!--      class="min-h-[120px]"-->
    <!--      placeholder="Chat with your transcript."-->
    <!--      @keydown.enter.exact.prevent="ollamaSummarize()"-->
    <!--    />-->

    <!--    <Button @click="ollamaSummarize"><Brain></Brain>Enter</Button>-->
  </div>
</template>

<style scoped></style>
