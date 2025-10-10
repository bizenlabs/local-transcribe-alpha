<script setup lang="ts">
import { Check, Dot } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'
import {
  Stepper,
  StepperDescription,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from '@/components/ui/stepper'
import { onMounted, ref } from 'vue'
import router from '@/router'
import { store } from '@/lib/store'

const steps = [
  {
    step: 1,
    title: 'Utilities',
    description: 'System utilities'
  },
  {
    step: 2,
    title: 'Transcriber',
    description: 'Setting Transcriber'
  },
  {
    step: 3,
    title: 'Youtube',
    description: 'Transcribe Youtube videos'
  },
  {
    step: 4,
    title: 'Local AI ',
    description: 'Your Data, Your Control!'
  },
  {
    step: 5,
    title: 'Knitting things up! ',
    description: 'Local Server'
  }
]

const brewProgress = ref<number>(0)
const whisperProgress = ref<number>(0)
const ollamaProgress = ref<number>(0)
const currentStep = ref<number>(1)

onMounted(async () => {
  await setup()
})

async function setup(): Promise<void> {
  store.isDependenciesReady = false

  await updateBrewDownloadProgress()
  await downloadBrew()

  await updateWhisperDownloadProgress()
  await downloadWhisper()

  await updateYtDLPDownloadProgress()
  await downloadYtDLP()

  await updateOllamaDownloadProgress()
  await downloadOllama()

  await startWhisperServer()
  await startOllamaServer()
  store.isDependenciesReady = true
  loadHomePage()
}

async function downloadBrew(): Promise<void> {
  await window.download.brew()
  currentStep.value += 1
  console.log('Brew download complete')
}

async function updateBrewDownloadProgress(): Promise<void> {
  window.download.brewProgress((percentage: string) => {
    brewProgress.value = +percentage
  })
}

async function updateWhisperDownloadProgress(): Promise<void> {
  window.download.whisperProgress((percentage: string) => {
    whisperProgress.value = +percentage
  })
}
async function downloadWhisper(): Promise<void> {
  whisperProgress.value = 0
  window.download.whisper()
  console.log('Whisper download complete')
  currentStep.value += 1
}

async function updateOllamaDownloadProgress(): Promise<void> {
  window.download.ollamaProgress((percentage: string) => {
    ollamaProgress.value = +percentage
  })
}
async function downloadOllama(): Promise<void> {
  ollamaProgress.value = 0
  await window.download.ollama()
  currentStep.value += 1
  console.log('Ollama download complete')
}
async function startOllamaServer(): Promise<void> {
  await window.server.startOllama()
  console.log('Ollama Started!')
}
async function startWhisperServer(): Promise<void> {
  await window.server.startWhisper()
  console.log('Whisper Started!')
  currentStep.value += 1
}

// async function startBackendServer(): Promise<void> {
//   await window.server.startBackend()
//   console.log('Backend Started!')
// }

async function updateYtDLPDownloadProgress(): Promise<void> {
  // window.download.ollamaProgress((percentage: string) => {
  //   ollamaProgress.value = +percentage
  // })
}
async function downloadYtDLP(): Promise<void> {
  currentStep.value += 1
  // ollamaProgress.value = 0
  // window.download.ollama().then(() => {
  //   currentStep.value += 1
  //   console.log('Ollama download complete')
  // })
}

function loadHomePage(): void {
  router.push('/audio-file-transcribe')
}
</script>

<template>
  <h2>Setting up your private AI system</h2>
  <Separator orientation="horizontal" />
  <br /><br />

  <Stepper v-model="currentStep" class="flex w-full items-start gap-2">
    <StepperItem
      v-for="step in steps"
      :key="step.step"
      v-slot="{ state }"
      class="relative flex w-full flex-col items-center justify-center"
      :step="step.step"
    >
      <StepperSeparator
        v-if="step.step !== steps[steps.length - 1].step"
        class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
      />

      <StepperTrigger as-child>
        <Button
          :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
          size="icon"
          disabled
          class="z-10 rounded-full shrink-0"
          :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
        >
          <Check v-if="state === 'completed'" class="size-5" />
          <Loader2 v-if="state === 'active'" class="animate-spin" />
          <Dot v-if="state === 'inactive'" />
        </Button>
      </StepperTrigger>

      <div class="mt-5 flex flex-col items-center text-center">
        <StepperTitle
          :class="[state === 'active' && 'text-primary']"
          class="text-sm font-semibold transition lg:text-base"
        >
          {{ step.title }}
        </StepperTitle>
        <StepperDescription
          :class="[state === 'active' && 'text-primary']"
          class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm"
        >
          {{ step.description }}
        </StepperDescription>
      </div>
    </StepperItem>
  </Stepper>
  <!--  </div>-->
</template>

<style scoped></style>
