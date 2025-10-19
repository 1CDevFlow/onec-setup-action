/**
 * Детектор платформы для onec-setup-action
 */

import { IPlatformDetector } from './interfaces'
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
   *
   * @param platform - строка платформы
   * @returns тип платформы, по умолчанию 'linux' для неизвестных платформ
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
        // По умолчанию возвращаем Linux для неизвестных платформ
        return 'linux'
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
