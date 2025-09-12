import path from 'path'
import { app } from 'electron'
import { downloadFile } from '../../utils/fileDownloader'
import fs from 'node:fs'

import decompress from 'decompress'

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
const jdkDest = path.join(appDataDir, 'bin', 'jdk')
const mac_arm_dependencies: Dependency[] = [
  {
    name: 'ollama',
    url: 'https://github.com/ollama/ollama/releases/download/v0.11.10/ollama-darwin.tgz',
    fileName: 'ollama-darwin.tgz',
    destination: ollamaDest,
    binPath: path.join(appDataDir, 'bin', 'ollama', 'ollama')
  },
  {
    name: 'jdk',
    url: 'https://download.oracle.com/java/21/latest/jdk-21_macos-aarch64_bin.tar.gz',
    fileName: 'jdk-21_macos-aarch64_bin.tar.gz',
    destination: jdkDest,
    binPath: path.join(
      appDataDir,
      'bin',
      'jdk',
      'jdk-21.0.8.jdk',
      'Contents',
      'Home',
      'bin',
      'java'
    )
  }
]
const windows_x64_dependencies: Dependency[] = [
  {
    name: 'ollama',
    url: 'https://github.com/ollama/ollama/releases/download/v0.11.10/ollama-windows-amd64.zip',
    fileName: 'ollama-windows-amd64.zip',
    destination: ollamaDest,
    binPath: path.join(appDataDir, 'bin', 'ollama', 'ollama.exe')
  },
  {
    name: 'jdk',
    url: 'https://download.oracle.com/java/21/latest/jdk-21_windows-x64_bin.zip',
    fileName: 'jdk-21_windows-x64_bin.zip',
    destination: jdkDest,
    binPath: path.join(appDataDir, 'bin', 'jdk', 'jdk-21.0.8', 'bin', 'java')
  }
]
const linux_x64_dependencies: Dependency[] = [
  {
    name: 'ollama',
    url: 'https://github.com/ollama/ollama/releases/download/v0.11.10/ollama-linux-amd64.tgz',
    fileName: 'ollama-linux-amd64.tgz',
    destination: ollamaDest,
    binPath: path.join(appDataDir, 'bin', 'ollama', 'bin', 'ollama')
  },
  {
    name: 'jdk',
    url: 'https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.tar.gz',
    fileName: 'jdk-21_linux-x64_bin.tar.gz',
    destination: jdkDest,
    binPath: ''
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

  public getOllamaPath(): string {
    return <string>(
      this.resolveDependencies().find((dependency) => dependency.name === 'ollama')?.binPath
    )
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

  //TODO add mac x86 support
  private resolveDependencies(): Dependency[] {
    if (process.platform == 'darwin' && process.arch === 'arm64') {
      return mac_arm_dependencies
    } else if (process.platform == 'win32' && process.arch === 'x64') {
      return windows_x64_dependencies
    } else if (process.platform == 'linux' && process.arch === 'x64') {
      return linux_x64_dependencies
    }
    return []
  }

  private checkIfFileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }
}

export const dependencyManager = DependencyManager.Instance
