<script lang="ts" setup>
import { AlertCircle } from 'lucide-vue-next'
</script>
<template>
  <div
    id="no-model-downloaded"
    class="rounded-md bg-yellow-50 p-4 dark:bg-yellow-500/10 dark:outline dark:outline-yellow-500/15"
  >
    <div class="flex">
      <div class="shrink-0">
        <AlertCircle aria-hidden="true" class="size-5 text-yellow-400 dark:text-yellow-300" />
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-100">Download Model</h3>
        <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-100/80">
          <p>Please download a model to start transcription.</p>
        </div>
      </div>
    </div>
  </div>
</template>
