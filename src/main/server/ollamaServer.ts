import { ChildProcess, exec } from 'node:child_process'
import { dependencyManager } from '../modules/core/DependencyManager'
import kill from 'tree-kill'

export default class OllamaServer {
  private ollamaProcess: ChildProcess | undefined

  public static get Instance(): OllamaServer {
    return this._instance || (this._instance = new this())
  }
  private static _instance: OllamaServer
  public async startOllamaServer(): Promise<string> {
    const command = '"' + dependencyManager.getOllamaPath() + '"' + ' serve '
    this.ollamaProcess = exec(command, (error, stdout, stderr) => {
      console.log(stdout, stderr, error)
    })
    return Promise.resolve('text')
  }

  public async stopOllamaServer(): Promise<string> {
    const pid = this.ollamaProcess?.pid
    if (pid) {
      kill(pid)
      console.log(`Ollama process killed: pid=${pid}`)
      this.ollamaProcess = undefined
    }
    return Promise.resolve('ollama stopped')
  }
}
export const ollamaService = OllamaServer.Instance
