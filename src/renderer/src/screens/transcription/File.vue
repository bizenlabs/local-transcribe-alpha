<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import { Trash } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { AudioLines, FolderPlus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Model } from '../../../../types/model'
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
const transcribing = ref<boolean>(false)

const models = ref<Model[]>([])
const selectedModel = ref<number>(0)

function getModelList(): void {
  console.log('getModelList')
  window.asr.getModels().then((result) => (models.value = result))
}

onMounted(() => {
  getModelList()
  if (models.value.length > 0) {
    selectedModel.value = models.value[0].id
  }
})

async function selectFile(): Promise<void> {
  filePath.value = await window.api.openFile()
}

function clearSelectedFile(): void {
  filePath.value = ''
  transcription.value = []
}

async function transcribeFile(): Promise<void> {
  transcribing.value = true
  let model = models.value.find((model) => model.id === selectedModel.value)
  if (model && model.modelPath) {
    await window.asr.transcribeFile(filePath.value, model.modelPath).then((result) => {
      transcription.value = result
      transcribing.value = false
    })
  }
}
</script>

<template>
  <h4>{{ heading }}</h4>
  <Separator orientation="horizontal" />

  <div class="col-span-full">
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
        <Button @click="transcribeFile">
          <AudioLines class="mr-2 h-4 w-4" :class="{ 'animate-bounce': transcribing }" />
          Start Transcription
        </Button>
      </div>
    </div>

    <div v-if="models.length > 0">
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
              :disabled="!model.modelPath"
            >
              {{ model.name }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
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
