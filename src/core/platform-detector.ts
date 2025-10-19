/**
 * Детектор платформы для onec-setup-action
 */

import { IPlatformDetector } from './interfaces'
import { PlatformError } from '../errors/base-errors'
import { PLATFORM_WIN, PLATFORM_LIN, PLATFORM_MAC } from '../utils/constants'

/**
 * Реализация детектора платформы
 */
export class PlatformDetector implements IPlatformDetector {
  private currentPlatform: string

  constructor(platform: string = process.platform) {
    this.currentPlatform = platform
  }

  /**
   * Определяет тип платформы
   */
  getPlatformType(platform: string): 'win' | 'linux' | 'mac' {
    switch (platform) {
      case PLATFORM_WIN:
        return 'win'
      case PLATFORM_LIN:
        return 'linux'
      case PLATFORM_MAC:
        return 'mac'
      default:
        throw new PlatformError(`Unrecognized os ${platform}`)
    }
  }

  /**
   * Проверяет, является ли платформа Windows
   */
  isWindows(): boolean {
    return this.currentPlatform === PLATFORM_WIN
  }

  /**
   * Проверяет, является ли платформа Linux
   */
  isLinux(): boolean {
    return this.currentPlatform === PLATFORM_LIN
  }

  /**
   * Проверяет, является ли платформа macOS
   */
  isMac(): boolean {
    return this.currentPlatform === PLATFORM_MAC
  }

  /**
   * Получает текущую платформу
   */
  getCurrentPlatform(): string {
    return this.currentPlatform
  }

  /**
   * Получает тип текущей платформы
   */
  getCurrentPlatformType(): 'win' | 'linux' | 'mac' {
    return this.getPlatformType(this.currentPlatform)
  }
}
