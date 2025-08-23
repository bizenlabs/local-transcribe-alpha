import path, { resolve } from 'path'
import * as fs from 'node:fs'
import pathToFfmpeg from 'ffmpeg-static'
import { app } from 'electron'

import { execSync } from 'child_process'

export const convertToWavType = async (inputFilePath: string): Promise<string> => {
  checkIfFileExists(inputFilePath)
  console.log('Input File Exists')

  const fileExtension = path.extname(inputFilePath).toLowerCase()

  if (fileExtension === '.xyz') {
    console.log(`Input file is already xyz: ${inputFilePath}`)
    return inputFilePath
  } else {
    const workDir: string = resolve(app.getPath('userData'), 'audio')
    console.log(`Input file is not WAV converting: ${inputFilePath}`)
    const outputFilePath = path.join(
      path.dirname(workDir),
      `${path.basename('input', fileExtension)}.wav`
    )
    console.log(`Converting to a new WAV file: ${outputFilePath}`)

    const ffmpegBin = pathToFfmpeg?.replace('app.asar', 'app.asar.unpacked')

    const command = `${ffmpegBin} -nostats -loglevel error -y -i "${inputFilePath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputFilePath}"`
    console.log('FFMPEG command:', command)
    execSync(command)
    console.log(`Converted to a new WAV file: ${outputFilePath}`)
    return outputFilePath
  }
}

export const checkIfFileExists = (filePath: string): void => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Error: No such file: ${filePath}`)
  }
}
