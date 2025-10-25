import { createMemoryHistory, createRouter } from 'vue-router'

import AudioModelManager from '@/screens/transcription/AudioModelManager.vue'
import RealtimeTimer from '@/screens/transcription/Realtime_timer.vue'
import File from '@/screens/transcription/File.vue'
import General from '@/screens/settings/General.vue'
import OllamaModels from '@/screens/models/ollama/OllamaModels.vue'
import AppDependencies from '@/screens/AppDependencies.vue'
import { store } from '@/lib/store'
import Realtime from '@/screens/transcription/Realtime.vue'
import MedicalFile from '@/screens/transcription/MedicalFile.vue'

const routes = [
  { path: '/', redirect: '/dependency-manager' },
  { path: '/dependency-manager', component: AppDependencies },
  { path: '/audio-file-transcribe', component: File },
  { path: '/medical-file', component: MedicalFile },
  { path: '/audio-realtime-transcribe', component: RealtimeTimer },
  { path: '/audio-realtime-mediaapi', component: Realtime },
  { path: '/audio-model-manager', component: AudioModelManager },
  { path: '/text-model-manager', component: OllamaModels },
  { path: '/general-settings', component: General }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})
router.beforeResolve(() => {
  return store.isDependenciesReady
})
export default router
