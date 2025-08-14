// import { promisify } from 'util'
// import { createRequire } from 'node:module'
// const require = createRequire(import.meta.url)
//
// const {
//   whisper
// } = require('/Users/kgidwani/workspace/local-transcribe-alpha/resources/bin/addon.node')
//
// const whisperAsync = promisify(whisper)
//
// const whisperParams = {
//   language: 'en',
//   model: '/Users/kgidwani/workspace/whisper.cpp/models/ggml-tiny.en.bin',
//   fname_inp: '/Users/kgidwani/workspace/whisper.cpp/samples/video.wav',
//   use_gpu: true,
//   flash_attn: false,
//   no_prints: true,
//   comma_in_time: false,
//   translate: true,
//   no_timestamps: false,
//   detect_language: false,
//   audio_ctx: 0,
//   max_len: 0,
//   progress_callback: (progress) => {
//     console.log(`progress: ${progress}%`)
//   }
// }
//
// // const argument = process.argv.slice(2)
// const arguments1 = []
// const params = Object.fromEntries(
//   arguments1.reduce((pre, item) => {
//     if (item.startsWith('--')) {
//       const [key, value] = item.slice(2).split('=')
//       if (key === 'audio_ctx') {
//         whisperParams[key] = parseInt(value)
//       } else if (key === 'detect_language') {
//         whisperParams[key] = value === 'true'
//       } else {
//         whisperParams[key] = value
//       }
//       return pre
//     }
//     return pre
//   }, [])
// )
//
// for (const key in params) {
//   if (whisperParams.hasOwnProperty(key)) {
//     whisperParams[key] = params[key]
//   }
// }
//
// console.log('whisperParams =', whisperParams)
//
// whisperAsync(whisperParams).then((result) => {
//   console.log()
//   console.log(result)
// })
