import { reactive } from 'vue'
import getPort from 'get-port'

export const store = reactive({
  isDependenciesReady: true
})

export const port = reactive({
  whisperPort: await getPort({ port: 8090 }),
  ollamaPort: await getPort({ port: 11434 })
})
