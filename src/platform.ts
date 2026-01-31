import { OSName } from './onegetjs/model'

const PLATFORM_WIN = 'win32'
const PLATFORM_LIN = 'linux'
const PLATFORM_MAC = 'darwin'

export function getPlatform(): string {
  return process.platform
}

export function isWindows(): boolean {
  return process.platform === PLATFORM_WIN
}

export function isLinux(): boolean {
  return process.platform === PLATFORM_LIN
}

export function isMac(): boolean {
  return process.platform === PLATFORM_MAC
}

export function getPlatformType(): OSName {
  switch (process.platform) {
    case PLATFORM_WIN:
      return 'win'
    case PLATFORM_MAC:
      return 'mac'
    case PLATFORM_LIN:
      return 'linux'
    default:
      throw new Error(`Unrecognized os ${process.platform}`)
  }
}
