import { VideoProgress, YtDlp } from 'ytdlp-nodejs'
import pathToFfmpeg from 'ffmpeg-static'
import { resolve } from 'path'
import { app } from 'electron'
import path from 'path'
// import { startServer } from './ollama'

export const downloadYT = async (
  url: string,
  onProgress: (videoProgress: VideoProgress) => void
): Promise<string> => {

  // await startServer()


  const ffmpegPath = pathToFfmpeg?.replace('app.asar', 'app.asar.unpacked')

  let binaryPath: string
  if (process.platform == 'darwin') {
    binaryPath = path
      .join(__dirname, '../../resources/bin/yt-dlp/mac/yt-dlp_macos')
      .replace('app.asar', 'app.asar.unpacked')
  } else {
    binaryPath = path
      .join(__dirname, '../../resources/bin/yt-dlp/win/yt-dlp.exe')
      .replace('app.asar', 'app.asar.unpacked')
  }
  console.log('binPath', binaryPath)

  const ytdlp = new YtDlp({
    binaryPath,
    ffmpegPath
  })

  const file = (await ytdlp.getInfoAsync(url)).id + '.m4a'
  const audioDirectoryPath: string = resolve(app.getPath('userData'), 'audio', file)
  try {
    const output = await ytdlp.downloadAsync(url, {
      onProgress,
      format: 'm4a',
      noPlaylist: true,
      audioFormat: 'm4a',
      ffmpegLocation: ffmpegPath,
      output: audioDirectoryPath,
      forceOverwrites: true,
      noOverwrites: false
    })
    console.log('Download completed:', output)
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
  return audioDirectoryPath
}
