import path from 'path'
import { execFile } from 'node:child_process'

export const startServer = async (): Promise<void> => {
  // const ffmpegBin = pathToFfmpeg?.replace('app.asar', 'app.asar.unpacked')

  let binPath: string
  if (process.platform == 'darwin') {
    binPath = path
      .join(__dirname, '../../resources/bin/llama/llama-server')
      .replace('app.asar', 'app.asar.unpacked')
  } else {
    binPath = path
      .join(__dirname, '../../resources/bin/llama/llama-server')
      .replace('app.asar', 'app.asar.unpacked')
  }
  const command = `${binPath}  -hf ggml-org/gemma-3-1b-it-GGUF`
  console.log('Llama command:', command)
  execFile(command)
}
