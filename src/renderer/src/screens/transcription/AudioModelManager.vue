<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Download, BadgeCheck } from 'lucide-vue-next'

import type { Model } from '../../../../types/model'

const models = ref<Model[]>([])
const isDownloadInProgress = ref<number>(0)
const modelDownloadPercentage = ref<number>(0)

onMounted(() => {
  getModelList()
  updateDownloadProgress()
})

function getModelList(): void {
  window.asr.getModels().then((result) => (models.value = result))
}

function updateDownloadProgress(): void {
  window.asr.onDownloadProgress(
    (percentage: string) => (modelDownloadPercentage.value = +percentage)
  )
}

async function downloadModel(model: Model): Promise<void> {
  isDownloadInProgress.value = model.id
  window.asr.downloadModel({ ...model }).then(() => {
    console.log('Model downloaded :')
    isDownloadInProgress.value = 0
    modelDownloadPercentage.value = 0
    getModelList()
  })
}
</script>

<template>
  <div class="grid auto-rows-min gap-4 md:grid-cols-3">
    <div v-for="model in models" :key="model.id" class="aspect-video rounded-xl bg-muted/50">
      <Card>
        <CardHeader>
          <CardTitle>{{ model.name }}</CardTitle>
          <CardDescription>{{ model.size }}</CardDescription>
        </CardHeader>
        <CardContent>
          <CardDescription>{{ model.description }}</CardDescription>
        </CardContent>
        <CardFooter>
          <Download
            v-if="!model.downloadPath && !isDownloadInProgress"
            @click="downloadModel(model)"
          ></Download>
          <BadgeCheck v-if="model.downloadPath" color="green"></BadgeCheck>
          <Progress v-if="model.id === isDownloadInProgress" v-model="modelDownloadPercentage" />
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<style scoped></style>
