import path from 'path'
import { exec } from 'node:child_process'
import { app } from 'electron'
import { dependencyManager } from '../modules/core/DependencyManager'

export default class Server {
  public async startAPIServer(): Promise<string> {
    let jarPath: string
    const workDir = app.getPath('userData')
    if (process.platform == 'darwin') {
      jarPath = path
        .join(__dirname, '../../resources/bin/server/server.jar')
        .replace('app.asar', 'app.asar.unpacked')
    } else {
      jarPath = path
        .join(__dirname, '../../resources/bin/api/server/server.jar')
        .replace('app.asar', 'app.asar.unpacked')
    }
    const command = '"' + dependencyManager.getJavaPath() + '"' + ' -jar ' + jarPath
    exec(command, { env: { BIZENLABS_APP_DATA_DIR: workDir } }, (error, stdout, stderr) => {
      console.log(stdout, stderr, error)
    })
    return Promise.resolve('text')
  }

  public async startOllamaServer(): Promise<string> {
    const command = '"' + dependencyManager.getOllamaPath() + '"' + ' serve '
    exec(command, (error, stdout, stderr) => {
      console.log(stdout, stderr, error)
    })
    return Promise.resolve('text')
  }

  //
}
