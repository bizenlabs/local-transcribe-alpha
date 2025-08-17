import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function millisToMinutesAndSeconds(millis): string {
  const minutes = Math.floor(millis / 60000)
  const seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ':' + (+seconds < 10 ? '0' : '') + seconds
}
