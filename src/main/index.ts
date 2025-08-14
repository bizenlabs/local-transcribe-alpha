import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import electronUpdater, { type AppUpdater, UpdateCheckResult } from 'electron-updater'
import { modelService } from './asr/model.service'

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
      nodeIntegration: false
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
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function registerIPC(): void {
  ipcMain.handle('asr:getModels', async () => {
    console.log('asr:getModels')
    return modelService.getModels()
  })

  ipcMain.handle('asr:downloadModel', async (_event, ...args) => {
    await modelService.downloadModel(args[0])
  })

  ipcMain.handle('dialog:openFile', handleFileOpen)

  ipcMain.handle('asr:file', async (_event, ...args) => {
    return await modelService.transcribeFile(args[0], args[1])
  })

  ipcMain.handle('asr:file-whisper', async (_event, ...args) => {
    return await modelService.transcribeFileWhisper(args[0], args[1])
  })
}

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
