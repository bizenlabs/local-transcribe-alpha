import { exec } from 'node:child_process'
import { dependencyManager } from '../modules/core/DependencyManager'

export default class Server {
  public async startOllamaServer(): Promise<string> {
    const command = '"' + dependencyManager.getOllamaPath() + '"' + ' serve '
    exec(command, (error, stdout, stderr) => {
      console.log(stdout, stderr, error)
    })
    return Promise.resolve('text')
  }
}
