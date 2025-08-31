import { VideoProgress, YtDlp } from 'ytdlp-nodejs'
import pathToFfmpeg from 'ffmpeg-static'
import { resolve } from 'path'
import { app } from 'electron'

export const downloadYT = async (
  url: string,
  onProgress: (videoProgress: VideoProgress) => void
): Promise<string> => {
  const ytdlp = new YtDlp()
  const ffmpegBin = pathToFfmpeg?.replace('app.asar', 'app.asar.unpacked')
  const audioDirectoryPath: string = resolve(app.getPath('userData'), 'audio', 'downloaded.m4a')
  try {
    const output = await ytdlp.downloadAsync(url, {
      onProgress,
      format: 'm4a',
      noPlaylist: true,
      audioFormat: 'm4a',
      ffmpegLocation: ffmpegBin,
      output: audioDirectoryPath,
      forceOverwrites: true,
      noOverwrites: false
    })
    console.log('Download completed:', output)
  } catch (error) {
    console.error('Error:', error)
  }
  return audioDirectoryPath
}
