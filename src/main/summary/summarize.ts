import path from 'path'
import { exec } from 'node:child_process'

export default class Saransh {
  public async summary(text: string): Promise<string> {
    // const ffmpegBin = pathToFfmpeg?.replace('app.asar', 'app.asar.unpacked')

    let binPath: string
    if (process.platform == 'darwin') {
      binPath = path
        .join(__dirname, '../../resources/bin/llama/llama-server')
        .replace('app.asar', 'app.asar.unpacked')
    } else {
      binPath = path
        .join(__dirname, '../../resources/bin/llama-windows/llama-server.exe')
        .replace('app.asar', 'app.asar.unpacked')
    }
    const command = `${binPath}  -hf bartowski/Llama-3.2-3B-Instruct-GGUF`
    console.log('Llama command:', command)
    exec(command, (error, stdout, stderr) => {
      console.log(stdout, stderr, error)
    })
    return Promise.resolve(text)
  }
}
