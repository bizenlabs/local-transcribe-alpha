<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Model, Variant } from './model.type'
import { modelsData } from '@/screens/models/ollama/models'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BadgeCheck, Download } from 'lucide-vue-next'
import { Switch } from '@/components/ui/switch'
import ollama from 'ollama/browser'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { ModelResponse } from 'ollama'

const models = ref<Model[]>([])
const downloadedModels = ref<ModelResponse[]>([])

const modelDownloadInProgress = ref<Variant | undefined>()
const modelDownloadPercentage = ref<number>(0)

onMounted(async () => {
  await loadModels()
})

async function loadModels(): Promise<void> {
  getCatalogModelsAndSaveInRef()
  await getDownloadedModelsAndSaveInRef()
  markDownloadedModelsInCatalogRef()
}

function getCatalogModelsAndSaveInRef(): void {
  models.value = [...modelsData]
}

async function getDownloadedModelsAndSaveInRef(): Promise<void> {
  downloadedModels.value = (await ollama.list()).models
}

function markDownloadedModelsInCatalogRef(): void {
  models.value.forEach((model) => {
    model.defaultVariant.downloaded = isModelDownloaded(model.defaultVariant.name)

    model.variants?.forEach((variant) => {
      variant.downloaded = isModelDownloaded(variant.name)
    })
  })
}

function isModelDownloaded(modelName: string): boolean {
  return downloadedModels.value.findIndex((ollamaModel) => ollamaModel.name === modelName) !== -1
}

async function downloadModel(modelVariant: Variant): Promise<void> {
  if (modelDownloadInProgress.value) {
    return
  }
  modelDownloadInProgress.value = modelVariant
  modelDownloadPercentage.value = 0

  let progress = await ollama.pull({
    model: modelVariant.name,
    stream: true
  })

  for await (const part of progress) {
    modelDownloadInProgress.value.downloadProgress = part
    if (part.completed && part.total) {
      let percentage = Math.round((part.completed / part.total) * 100)
      modelDownloadPercentage.value = percentage > 100 ? 100 : percentage
    }
  }

  modelDownloadInProgress.value = undefined
  modelDownloadPercentage.value = 0
  await loadModels()
}
</script>

<template>
  <h2>Text Model Manager</h2>
  <div class="grid auto-rows-min gap-2 p-1 md:grid-cols-1">
    <div v-for="model in models" :key="model.id">
      <Card>
        <CardHeader>
          <CardTitle>{{ model.name }}</CardTitle>
          <CardDescription>{{ model.description }}</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-row gap-6">
            <span class="flex flex-row gap-2">
              <CardDescription class="font-bold">{{ model.defaultVariant.size }}</CardDescription>
              <BadgeCheck v-if="model.defaultVariant.downloaded" color="green"></BadgeCheck>
              <Download
                v-if="!model.defaultVariant.downloaded && modelDownloadInProgress === undefined"
                class="flex gap-5"
                color="gray"
                @click="downloadModel(model.defaultVariant)"
              >
              </Download>
            </span>

            <span v-if="model.variants" class="mx-2">
              <Switch
                :model-value="model.showVariants"
                @update:model-value="(value) => (model.showVariants = value)"
              />
              <span class="text-sm text-shadow-gray-950 mx-3">Show Variants</span></span
            >
          </div>

          <div v-if="model.showVariants">
            <Separator class="my-2 w-[100px]" />
            <Table class="w-2">
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[100px]"> Name </TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead class="text-right"> Download </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="variant in model.variants" :key="variant.name">
                  <TableCell class="font-medium">
                    {{ variant.name }}
                  </TableCell>
                  <TableCell>{{ variant.size }}</TableCell>
                  <TableCell>{{ variant.context }}</TableCell>
                  <TableCell class="text-right">
                    <BadgeCheck v-if="variant.downloaded" color="green"></BadgeCheck>
                    <Download
                      v-if="!variant.downloaded && modelDownloadInProgress === undefined"
                      class="flex gap-5"
                      color="gray"
                      @click="downloadModel(variant)"
                    ></Download>
                  </TableCell>
                  <TableCell class="text-right">
                    <div
                      v-if="
                        modelDownloadInProgress &&
                        modelDownloadInProgress.name === variant.name &&
                        modelDownloadPercentage > 0
                      "
                    >
                      <Progress v-model="modelDownloadPercentage" />
                      <span class="text-sm text-gray-400">
                        {{ modelDownloadInProgress.downloadProgress?.status }} -
                        {{ modelDownloadPercentage }} %
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div
            v-if="
              modelDownloadInProgress &&
              modelDownloadInProgress.name === model.defaultVariant.name &&
              modelDownloadPercentage > 0
            "
            id="main_model_download_progress"
          >
            <Progress v-model="modelDownloadPercentage" />
            <span class="text-sm text-gray-400">
              {{ modelDownloadInProgress.downloadProgress?.status }} -
              {{ modelDownloadPercentage }} %
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped></style>
