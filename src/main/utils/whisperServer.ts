// import path from 'path'
// import { exec } from 'node:child_process'
//
// export const startWhisperServer = async (): Promise<void> => {
//   // const ffmpegBin = pathToFfmpeg?.replace('app.asar', 'app.asar.unpacked')
//
//   let binPath: string
//   if (process.platform == 'darwin') {
//     binPath = path
//       .join(__dirname, '../../resources/bin/whisper.cpp/mac/whisper-server  --port 8090')
//       .replace('app.asar', 'app.asar.unpacked')
//   } else {
//     binPath = path
//       .join(__dirname, '../../resources/bin/whisper.cpp/win/x64/whisper-server')
//       .replace('app.asar', 'app.asar.unpacked')
//   }
//   const command = `${binPath}`
//   console.log('Whisper server command:', command)
//   const p = exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.log(error)
//     }
//     console.log(stderr)
//     console.log(stdout)
//   })
//   console.log('PID:', p.pid)
//
// }
