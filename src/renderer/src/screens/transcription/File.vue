<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import { Trash } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { AudioLines, FolderPlus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Model } from '../../../../types/model'

const filePath = ref('')
const transcription = ref([''])

const models = ref<Model[]>([])

function getModelList(): void {
  console.log('getModelList')
  window.asr.getModels().then((result) => (models.value = result))
}

onMounted(() => {
  getModelList()
})

async function selectFile(): Promise<void> {
  filePath.value = await window.api.openFile()
}

async function transcribeFile(): Promise<void> {
  if (models.value[0]?.modelPath) {
    await window.asr.transcribeFile(filePath.value, models.value[0]?.modelPath).then((result) => {
      transcription.value = result
    })
  }
}
</script>

<template>
  <h4>File Transcription</h4>
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

    <div v-if="filePath" class="hidden md:block">
      <div class="col-span-3 lg:col-span-4 lg:border-l">
        <div class="h-full px-3 py-2 lg:px-8">
          <div class="h-full space-y-6">
            <div class="space-between flex items-center">
              <p class="h-full space-y-3 text-l font-bold tracking-tight text-gray-900">
                Transcription Configuration
              </p>
              <div class="ml-auto mr-4">
                <Button @click="transcribeFile">
                  <AudioLines class="mr-2 h-4 w-4" />
                  Start Transcription
                </Button>
              </div>
            </div>
          </div>
          <br />
          <p class="text-sm text-gray-600">
            <span class="font-bold text-gray-950">Selected File:</span> {{ filePath }}
            <Trash class="ml-2 text-sm text-red-600 inline" @click="filePath = ''" />
          </p>
        </div>
      </div>
    </div>
  </div>
  <div>
    {{ transcription }}
  </div>
</template>

<style scoped></style>
