import { createMemoryHistory, createRouter } from 'vue-router'

import AudioModelManager from '@/screens/transcription/AudioModelManager.vue'
import Realtime from '@/screens/transcription/Realtime.vue'
import File from '@/screens/transcription/File.vue'
import Home from '@/screens/Home.vue'
import General from '@/screens/settings/General.vue'
import TextModelManager from '@/screens/TextModelManager.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/audio-file-transcribe', component: File },
  { path: '/audio-realtime-transcribe', component: Realtime },
  { path: '/audio-model-manager', component: AudioModelManager },
  { path: '/text-model-manager', component: TextModelManager },
  { path: '/general-settings', component: General }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

export default router
