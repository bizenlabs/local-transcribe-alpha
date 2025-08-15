<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import { Trash } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { AudioLines, FolderPlus, AlertCircle } from 'lucide-vue-next'
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

const heading = ref<string>('File Transcription')
const filePath = ref('')
const transcription = ref<string[]>([])
const isTranscribing = ref<boolean>(false)
const isModelAvailable = ref<boolean>(false)

const models = ref<Model[]>([])
const selectedModel = ref<number>(0)

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
})

async function selectFile(): Promise<void> {
  filePath.value = await window.api.openFile()
}

function clearSelectedFile(): void {
  filePath.value = ''
  transcription.value = []
}

async function transcribeFileWhisper(): Promise<void> {
  isTranscribing.value = true
  let model = models.value.find((model) => model.id === selectedModel.value)
  if (model && model.downloadPath) {
    await window.asr.transcribeFileWhisper(filePath.value, model.downloadPath).then((result) => {
      transcription.value = result
      isTranscribing.value = false
    })
  }
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
      </div>
    </div>

    <div v-if="models.length > 0 && isModelAvailable">
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
    </div>
    <br />
  </section>

  <section>
    <div v-if="transcription && transcription.length > 0">
      <div v-for="(snippet, index) in transcription" :key="index">
        {{ snippet }}
      </div>
    </div>
  </section>
</template>

<style scoped></style>
