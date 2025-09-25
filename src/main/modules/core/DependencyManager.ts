import path from 'path'
import { app } from 'electron'
import { downloadFile } from '../../utils/fileDownloader'
import fs from 'node:fs'

import decompress from 'decompress'
import { modelsData } from '../../asr/models'
import { modelService } from '../../asr/model.service'

export interface Dependency {
  name: string
  url: string
  fileName: string
  destination: string
  binPath: string
}
//TODO single place
const appDataDir = app.getPath('userData')
// private readonly modelsDirectoryPath: string = resolve(app.getPath('userData'), 'models')

const ollamaDest = path.join(appDataDir, 'bin', 'ollama')
const whisperDest = path.join(appDataDir, 'bin', 'whisper')
const mac_arm_dependencies: Dependency[] = [
  {
    name: 'whisper',
    url: 'https://github.com/bizenlabs/binaries/releases/download/v1.0.0/whisper-server.zip',
    fileName: 'whisper-server.zip',
    destination: whisperDest,
    binPath: path.join(appDataDir, 'bin', 'whisper', 'whisper-server')
  },
  {
    name: 'ollama',
    url: 'https://github.com/ollama/ollama/releases/download/v0.11.10/ollama-darwin.tgz',
    fileName: 'ollama-darwin.tgz',
    destination: ollamaDest,
    binPath: path.join(appDataDir, 'bin', 'ollama', 'ollama')
  }
]
const windows_x64_dependencies: Dependency[] = [
  {
    name: 'whisper',
    url: 'https://github.com/ggml-org/whisper.cpp/releases/download/v1.7.6/whisper-bin-x64.zip',
    fileName: 'whisper-bin-x64.zip',
    destination: ollamaDest,
    binPath: path.join(appDataDir, 'bin', 'whisper', 'whisper-server.exe')
  },
  {
    name: 'ollama',
    url: 'https://github.com/ollama/ollama/releases/download/v0.11.10/ollama-windows-amd64.zip',
    fileName: 'ollama-windows-amd64.zip',
    destination: ollamaDest,
    binPath: path.join(appDataDir, 'bin', 'ollama', 'ollama.exe')
  }
]

export class DependencyManager {
  private static _instance: DependencyManager

  public static get Instance(): DependencyManager {
    return this._instance || (this._instance = new this())
  }

  public getJavaPath(): string {
    return <string>(
      this.resolveDependencies().find((dependency) => dependency.name === 'jdk')?.binPath
    )
  }

  public getWhisperPath(): string {
    return <string>(
      this.resolveDependencies().find((dependency) => dependency.name === 'whisper')?.binPath
    )
  }

  public getOllamaPath(): string {
    return <string>(
      this.resolveDependencies().find((dependency) => dependency.name === 'ollama')?.binPath
    )
  }

  public async downloadDefaultModel(): Promise<void> {
    const onProgress = (percentage: string): void => console.log('default progress', percentage)
    await modelService.downloadModel(modelsData[0], onProgress)
    console.log('Downloaded default model...')
  }

  public async checkAndDownloadWhisper(onProgress: (percentage: string) => void): Promise<void> {
    await this.downloadDefaultModel()
    const whisper = this.resolveDependencies().find((dependency) => dependency.name === 'whisper')
    if (!whisper) {
      throw new Error('whisper Dependency not found for ' + process.platform + ' ' + process.arch)
    }
    const fullPath: string = path.join(whisper.destination, whisper.fileName)
    if (this.checkIfFileExists(fullPath)) {
      console.log('Files Exists')
      return
    }
    await downloadFile(whisper.url, whisper.destination, onProgress)
    console.log('downloadFile')
    await decompress(fullPath, whisper.destination).then((files) => {
      console.log('done!', files.length)
    })
    console.log('fullPath', fullPath)
  }

  public async checkAndDownloadOllama(onProgress: (percentage: string) => void): Promise<void> {
    const ollama = this.resolveDependencies().find((dependency) => dependency.name === 'ollama')
    if (!ollama) {
      throw new Error('Ollama Dependency not found for ' + process.platform + ' ' + process.arch)
    }
    console.log('here')
    const fullPath: string = path.join(ollama.destination, ollama.fileName)
    if (
      this.checkIfFileExists(path.join(ollama.destination, 'ollama')) ||
      this.checkIfFileExists(path.join(ollama.destination, 'ollama.exe'))
    ) {
      console.log('Files Exists')
      return
    }
    await downloadFile(ollama.url, ollama.destination, onProgress)
    console.log('downloadFile')
    await decompress(fullPath, ollama.destination).then((files) => {
      console.log('done!', files.length)
    })
    console.log('fullPath', fullPath)
  }

  public async checkAndDownloadJDK(onProgress: (percentage: string) => void): Promise<void> {
    const jdk = this.resolveDependencies().find((dependency) => dependency.name === 'jdk')
    if (!jdk) {
      throw new Error('JDK Dependency not found for ' + process.platform + ' ' + process.arch)
    }
    const fullPath: string = path.join(jdk.destination, jdk.fileName)
    if (this.checkIfFileExists(fullPath)) {
      console.log('Files Exists')
      return
    }
    await downloadFile(jdk.url, jdk.destination, onProgress)
    console.log('downloadFile')
    await decompress(fullPath, jdk.destination).then((files) => {
      console.log('done!', files.length)
    })
    console.log('fullPath', fullPath)
  }

  //TODO add mac x86 & Windows GPU support
  private resolveDependencies(): Dependency[] {
    if (process.platform == 'darwin' && process.arch === 'arm64') {
      return mac_arm_dependencies
    } else if (process.platform == 'win32' && process.arch === 'x64') {
      return windows_x64_dependencies
    }
    return []
  }

  private checkIfFileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }
}

export const dependencyManager = DependencyManager.Instance
