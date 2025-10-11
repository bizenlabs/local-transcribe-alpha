import path from 'path'
import { app } from 'electron'
import { downloadFile } from '../../utils/fileDownloader'
import fs from 'node:fs'

import decompress from 'decompress'

import { execSync } from 'child_process'

export interface Dependency {
  name: string
  url?: string
  fileName?: string
  destination?: string
  binPath: string
}
//TODO single place
const appDataDir = app.getPath('userData')

const appBinDest = path.join(appDataDir, 'bin')
const archivesDest = path.join(appDataDir, 'bin', 'archives')

const macDependencies = {
  brew: {
    url: 'https://github.com/Homebrew/brew/archive/refs/tags/4.6.15.zip',
    fileName: 'brew-4.6.15.zip',
    binPath: path.join(appDataDir, 'bin', 'brew-4.6.15', 'bin', 'brew')
  },
  whisper: {
    binPath: path.join(appDataDir, 'bin', 'brew-4.6.15', 'bin', 'whisper-server')
  },
  ollama: {
    binPath: path.join(appDataDir, 'bin', 'brew-4.6.15', 'bin', 'ollama')
  }
}

const winDependencies = {
  whisper: {
    url: 'https://github.com/ggml-org/whisper.cpp/releases/download/v1.7.6/whisper-bin-x64.zip',
    fileName: 'whisper-bin-x64.zip',
    binPath: path.join(appDataDir, 'bin', 'whisper', 'Release', 'whisper-server.exe')
  },
  ollama: {
    url: 'https://github.com/ollama/ollama/releases/download/v0.11.10/ollama-windows-amd64.zip',
    fileName: 'ollama-windows-amd64.zip',
    binPath: path.join(appDataDir, 'bin', 'ollama', 'ollama.exe')
  }
}

export class DependencyManager {
  private static _instance: DependencyManager

  public static get Instance(): DependencyManager {
    return this._instance || (this._instance = new this())
  }

  public getBrewPath(): string {
    return macDependencies.brew.binPath
  }

  public getWhisperPath(): string {
    if (process.platform == 'darwin') {
      return macDependencies.whisper.binPath
    } else {
      return winDependencies.whisper.binPath
    }
  }

  public getOllamaPath(): string {
    if (process.platform == 'darwin') {
      return macDependencies.ollama.binPath
    } else {
      return winDependencies.ollama.binPath
    }
  }

  public async installBrew(onProgress: (percentage: string) => void): Promise<void> {
    if (process.platform == 'darwin') {
      if (this.checkIfFileExists(macDependencies.brew.binPath)) {
        console.log('Brew Binary File Exists: ', macDependencies.brew.binPath)
        return
      }
      await downloadFile(macDependencies.brew.url, archivesDest, onProgress)
      console.log('download complete brew zip')
      const downloadedArchivePath: string = path.join(archivesDest, macDependencies.brew.fileName)
      await decompress(downloadedArchivePath, appBinDest)
      console.log('decompressed brew: ', appBinDest)
    }
  }

  public async installWhisper(onProgress: (percentage: string) => void): Promise<void> {
    if (process.platform == 'darwin') {
      this.brewInstallWhisper()
    } else if (process.platform == 'win32' && process.arch === 'x64') {
      if (this.checkIfFileExists(winDependencies.whisper.binPath)) {
        console.log('Whisper binary File Exists')
        return
      }
      await downloadFile(winDependencies.whisper.url, archivesDest, onProgress)
      console.log('download complete whisper zip')
      const downloadedArchivePath: string = path.join(
        archivesDest,
        winDependencies.whisper.fileName
      )
      await decompress(downloadedArchivePath, path.join(appDataDir, 'bin', 'whisper'))
      console.log('decompressed whisper: ', appBinDest)
    }
  }

  public async installOllama(onProgress: (percentage: string) => void): Promise<void> {
    if (process.platform == 'darwin') {
      this.brewInstallOllama()
    } else if (process.platform == 'win32' && process.arch === 'x64') {
      if (this.checkIfFileExists(winDependencies.ollama.binPath)) {
        console.log('Ollama binary File Exists')
        return
      }
      await downloadFile(winDependencies.ollama.url, archivesDest, onProgress)
      console.log('download complete ollama zip')
      const downloadedArchivePath: string = path.join(archivesDest, winDependencies.ollama.fileName)
      await decompress(downloadedArchivePath, path.join(appDataDir, 'bin', 'ollama'))
      console.log('decompressed whisper: ', appBinDest)
    }
  }

  private brewInstallWhisper(): void {
    const command = `"${this.getBrewPath()}" list whisper-cpp || "${this.getBrewPath()}" install whisper-cpp`
    execSync(command)
    console.log('DEP_INSTALLED', 'brew')
  }

  private brewInstallOllama(): void {
    const command = `"${this.getBrewPath()}" list ollama || "${this.getBrewPath()}" install ollama`
    execSync(command)
    console.log('DEP_INSTALLED', 'ollama')
  }

  private checkIfFileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }
}

export const dependencyManager = DependencyManager.Instance
