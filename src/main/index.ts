import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import electronUpdater, { type AppUpdater, UpdateCheckResult } from 'electron-updater'
import { whisperService } from './modules/whisper/whisper.service'
import { downloadYT } from './utils/youTube'
import { VideoProgress } from 'ytdlp-nodejs'

import { dependencyManager } from './modules/core/DependencyManager'
import { ollamaService } from './server/ollamaServer'

import startBackend from './modules/server/api'

// import pkg from 'sqlite3'

export function getAutoUpdater(): AppUpdater {
  const { autoUpdater } = electronUpdater
  return autoUpdater
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      nodeIntegration: false,
      nodeIntegrationInWorker: true,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // new Server().startAPIServer().then(() => console.log('Backend started'))
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  getAutoUpdater()
    .checkForUpdatesAndNotify()
    .then((result: UpdateCheckResult | null) => {
      if (result && result.isUpdateAvailable) {
        dialog
          .showMessageBox({
            title: 'Updates Available',
            message: 'Restart App to update.'
          })
          .then(() => {
            console.log('Restart App to update.')
          })
      }
    })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC test
  registerIPC()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  try {
    await whisperService.stopWhisperServer()
    console.log('App closing: whisper server stopped')
    await ollamaService.stopOllamaServer()
    console.log('App closing: ollama server stopped')
  } catch (error) {
    console.error(error)
    app.quit()
  } finally {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function registerIPC(): void {
  registerDownloadIPC()
  registerServerIPC()

  ipcMain.handle('asr:loadModel', async (_event, ...args) => {
    console.log('asr:loadModel', args[0])
    return whisperService.loadModel(args[0])
  })

  ipcMain.handle('asr:getModels', async () => {
    console.log('asr:getModels')
    return whisperService.getAvailableModels()
  })

  ipcMain.handle('asr:startServer', async (_event, ...args) => {
    console.log('asr:startServer', _event, ...args)
    // return await modelService.summary(args[0])
    // await modelService.startWhisperServer()
    // await modelService.stopWhisperServer()
    // return await startServer()
    // return await new Saransh().summary(args[0], args[1])
    // return await summarizer.summary(args[0])
    // return await summarize(args[0])
  })

  // ipcMain.handle('asr:downloadModel1', async (_event, ...args) => {
  //   await modelService.downloadModel(args[0])
  // })

  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle('dialog:openImageFile', handleImageFileOpen)

  ipcMain.handle('asr:file-whisper', async (_event, ...args) => {
    return await whisperService.transcribeFile(args[0])
  })

  ipcMain.handle('asr:downloadModel', async (event, ...args) => {
    const onProgress = function (percentage: string): void {
      event.sender.send('modelDownloadProgress', percentage)
    }
    return await whisperService.downloadModel(args[0], onProgress)
  })

  ipcMain.handle('asr:downloadYT', async (event, ...args) => {
    const onProgress = function (videoProgress: VideoProgress): void {
      event.sender.send('ytDownloadProgress', videoProgress)
    }
    return await downloadYT(args[0], onProgress)
  })

  ipcMain.handle('download:jdk', async (event) => {
    const onProgress = function (percentage: string): void {
      event.sender.send('jdkProgress', percentage)
    }
    return await dependencyManager.installWhisper(onProgress)
  })
}

function registerDownloadIPC(): void {
  ipcMain.handle('download:brew', async (event) => {
    const onProgress = function (percentage: string): void {
      event.sender.send('brewProgress', percentage)
    }
    return await dependencyManager.installBrew(onProgress)
  })

  ipcMain.handle('download:whisper', async (event) => {
    const onProgress = function (percentage: string): void {
      event.sender.send('whisperProgress', percentage)
    }
    return await dependencyManager.installWhisper(onProgress)
  })

  ipcMain.handle('download:ollama', async (event) => {
    const onProgress = function (percentage: string): void {
      event.sender.send('ollamaProgress', percentage)
    }
    return await dependencyManager.installOllama(onProgress)
  })
}

function registerServerIPC(): void {
  ipcMain.handle('server:start:backend', async () => {
    return await startBackend()
  })

  ipcMain.handle('server:start:whisper', async () => {
    return await whisperService.startWhisperServer()
  })

  ipcMain.handle('server:start:ollama', async () => {
    // await startWhisperServer()
    return await ollamaService.startOllamaServer().then(() => console.log('Backend started'))
  })
}
//TODO only one dialog open
async function handleFileOpen(): Promise<string> {
  console.log('Opening file...')
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [
      {
        name: 'Audio Files',
        extensions: ['wav', 'mp3', 'flac', 'ogg', 'm4a', 'mp4']
        // extensions: ['wav', 'mp3', 'flac', 'ogg', 'm4a']
      }
    ]
  })
  if (!canceled) {
    return filePaths[0]
  }
  return ''
}

async function handleImageFileOpen(): Promise<string> {
  console.log('Opening file...')
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [
      {
        name: 'Image Files',
        extensions: ['jpg', 'jpeg', 'dcm', 'png']
      }
    ]
  })
  if (!canceled) {
    return filePaths[0]
  }
  return ''
}
