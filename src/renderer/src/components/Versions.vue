<script setup lang="ts">
import { reactive } from 'vue'
import { Button } from '@/components/ui/button'

const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
  <Button class="m-10">Test</Button>
  <ul class="versions">
    <li class="electron-version">Electron v{{ versions.electron }}</li>
    <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="node-version">Node v{{ versions.node }}</li>
  </ul>
</template>
