import path from 'path'
import { exec } from 'node:child_process'
import ollama from 'ollama'

export const startServer = async (): Promise<void> => {
  // const ffmpegBin = pathToFfmpeg?.replace('app.asar', 'app.asar.unpacked')

  let binPath: string
  if (process.platform == 'darwin') {
    binPath = path
      .join(__dirname, '../../resources/bin/ollama/ollama serve')
      .replace('app.asar', 'app.asar.unpacked')
  } else {
    binPath = path
      .join(__dirname, '../../resources/bin/ollama-windows/ollama.exe serve')
      .replace('app.asar', 'app.asar.unpacked')
  }
  const command = `${binPath}`
  console.log('OLlama command:', command)
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(error)
    }
    console.log(stderr)
    console.log(stdout)
  })

  await ollama.pull({
    model: 'llama3.2:1b'
  })
  console.log('Model Pulled')
}
