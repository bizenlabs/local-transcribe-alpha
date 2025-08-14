import { Downloader, DownloaderReport } from 'nodejs-file-downloader'

export const downloadFile = async (
  url: string,
  directory: string,
  onProgress: (percentage: string) => void
): Promise<DownloaderReport> => {
  const downloader = new Downloader({
    url,
    directory,
    cloneFiles: false,
    onProgress
  })
  return downloader.download()
}
