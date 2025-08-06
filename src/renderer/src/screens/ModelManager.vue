<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Download, BadgeCheck, CircleDashed } from 'lucide-vue-next'

import { onMounted, ref } from 'vue'
import { Model } from '../../../types/model'

const models = ref<Model[]>([])
const modelDownloadInProgress = ref<string>('')

function getModelList(): void {
  console.log('getModelList')
  window.asr.getModels().then((result) => (models.value = result))
}

onMounted(() => {
  getModelList()
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function downloadModel(model: string) {
  modelDownloadInProgress.value = model
  window.asr.downloadModel(model).then(() => {
    console.log('Model downloaded :')
    modelDownloadInProgress.value = ''
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
          <CardDescription>{{ model.description }}</CardDescription>
        </CardHeader>
        <CardContent> </CardContent>
        <CardFooter>
          <Download
            v-if="!model.modelPath && !modelDownloadInProgress"
            @click="downloadModel(model.model)"
          ></Download>

          <!--          <Trash v-if="!model.modelPath" @click="downloadModel(model.model)"></Trash>-->
          <BadgeCheck v-if="model.modelPath" color="green"></BadgeCheck>
          <CircleDashed
            v-if="modelDownloadInProgress === model.model"
            color="orange"
          ></CircleDashed>
        </CardFooter>
      </Card>
    </div>

    <!--    <div class="aspect-video rounded-xl bg-muted/50" />-->
    <!--    <div class="aspect-video rounded-xl bg-muted/50" />-->
    <!--    <div class="aspect-video rounded-xl bg-muted/50" />-->
    <!--    <div class="aspect-video rounded-xl bg-muted/50" />-->
  </div>
  <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
</template>

<style scoped></style>
