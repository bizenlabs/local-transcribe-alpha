export default class Summarizer {
  // public async summary(text: string): Promise<string> {
  //   const modelsDirectoryPath: string = resolve(app.getPath('userData'), 'models')
  //   // console.log(path.join(modelsDirectoryPath, 'mistral-Summarizer-7b-instruct-v0.2.Q4_K_S.gguf'))
  //   // const llama = await getLlama({
  //   //   debug: true
  //   // })
  //   console.log('modelsDirectoryPath ', modelsDirectoryPath)
  //   const llama = await getLlama('lastBuild')
  //   console.log('llama ', llama)
  //   const model = await llama.loadModel({
  //     modelPath: path.join(
  //       modelsDirectoryPath,
  //       'hf_mradermacher_Meta-Llama-3.1-8B-Instruct.Q4_K_M.gguf'
  //     )
  //   })
  //   console.log('model ', model.size)
  //
  //   const context = await model.createContext({
  //     // threads: 0,
  //     // ignoreMemorySafetyChecks: true,
  //     contextSize: {
  //       max: 4096
  //     }
  //     // flashAttention: false,
  //     // batchSize: 4096
  //   })
  //
  //   console.log('Context created ', context.contextSize)
  //   const completion = new LlamaCompletion({
  //     contextSequence: context.getSequence()
  //   })
  //
  //   const input = `summarize the text in brackets ${text} ignore timestamp]`
  //
  //   const res = await completion.generateCompletion(input, {
  //     maxTokens: 100
  //   })
  //   console.log('Completion completed successfully.', res)
  //   // const q1 = 'Hi there, how are you?'
  //   // console.log('User: ' + q1)
  //   //
  //   // const a1 = await session.prompt(q1)
  //   // console.log('AI: ' + a1)
  //   //
  //   // const q2 = 'Write a small note for school teacher'
  //   // console.log('User: ' + q2)
  //   //
  //   // const a2 = await session.prompt(q2)
  //   // console.log('AI: ' + a2)
  //   return Promise.resolve(text)
  // }
}

// export const summarize = async (text: string): Promise<string> => {
//   console.log(text)
//   const modelsDirectoryPath: string = resolve(app.getPath('userData'), 'models')
//   console.log(path.join(modelsDirectoryPath, 'mistral-Summarizer-7b-instruct-v0.2.Q4_K_S.gguf'))
//
//   // const modelPath = await resolveModelFile(
//   //   'hf:mradermacher/Meta-Llama-3.1-8B-Instruct-GGUF:Q4_K_M',
//   //   modelsDirectoryPath
//   // )
//
//   const llama = await getLlama({
//     debug: true
//   })
//
//   // const model = await llama.loadModel({
//   //   modelPath: path.join(modelsDirectoryPath, 'mistral-Summarizer-7b-instruct-v0.2.Q4_K_S.gguf')
//   // })
//   const model = await llama.loadModel({
//     modelPath: path.join(modelsDirectoryPath, 'hf_codegood_gemma-2b-it-Q4_K_M.Q4_K_M.gguf')
//   })
//
//   console.log('Model successfully loaded', model.size)
//   try {
//     const context = await model.createContext({
//       threads: 0,
//       ignoreMemorySafetyChecks: true
//       // contextSize: {
//       //   max: 4096
//       // },
//       // flashAttention: false,
//       // batchSize: 4096
//     })
//     console.log('context size', context.contextSize)
//   } catch (err) {
//     console.error('Failed to create context', err)
//   }
//
//   // const session = new LlamaChatSession({
//   //   contextSequence: context.getSequence()
//   // })
//   // const summary = await session.prompt(text)
//   // console.log('AI: ' + summary)
//   // return Promise.resolve(summary)
//   return Promise.resolve('summary')
// }

// const model = await llama.loadModel({
//   modelPath: path.join(modelsDirectoryPath, 'mistral-Summarizer-7b-instruct-v0.2.Q4_K_S.gguf')
// })
