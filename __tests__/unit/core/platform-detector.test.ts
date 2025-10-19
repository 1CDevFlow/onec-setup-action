/**
 * Unit-тесты для PlatformDetector
 */

import { PlatformDetector } from '../../../src/core/platform-detector'
import { PlatformError } from '../../../src/errors/base-errors'
import {
  PLATFORM_WIN,
  PLATFORM_LIN,
  PLATFORM_MAC
} from '../../../src/utils/constants'

describe('PlatformDetector', () => {
  let platformDetector: PlatformDetector

  describe('getPlatformType', () => {
    it('should detect Windows platform', () => {
      platformDetector = new PlatformDetector(PLATFORM_WIN)
      expect(platformDetector.getPlatformType(PLATFORM_WIN)).toBe('win')
    })

    it('should detect Linux platform', () => {
      platformDetector = new PlatformDetector(PLATFORM_LIN)
      expect(platformDetector.getPlatformType(PLATFORM_LIN)).toBe('linux')
    })

    it('should detect macOS platform', () => {
      platformDetector = new PlatformDetector(PLATFORM_MAC)
      expect(platformDetector.getPlatformType(PLATFORM_MAC)).toBe('mac')
    })

    it('should throw error for unsupported platform', () => {
      platformDetector = new PlatformDetector('unsupported')
      expect(() => platformDetector.getPlatformType('unsupported')).toThrow(
        PlatformError
      )
    })
  })

  describe('platform checks', () => {
    it('should correctly identify Windows', () => {
      platformDetector = new PlatformDetector(PLATFORM_WIN)
      expect(platformDetector.isWindows()).toBe(true)
      expect(platformDetector.isLinux()).toBe(false)
      expect(platformDetector.isMac()).toBe(false)
    })

    it('should correctly identify Linux', () => {
      platformDetector = new PlatformDetector(PLATFORM_LIN)
      expect(platformDetector.isWindows()).toBe(false)
      expect(platformDetector.isLinux()).toBe(true)
      expect(platformDetector.isMac()).toBe(false)
    })

    it('should correctly identify macOS', () => {
      platformDetector = new PlatformDetector(PLATFORM_MAC)
      expect(platformDetector.isWindows()).toBe(false)
      expect(platformDetector.isLinux()).toBe(false)
      expect(platformDetector.isMac()).toBe(true)
    })
  })

  describe('getCurrentPlatform', () => {
    it('should return current platform', () => {
      const platform = 'test-platform'
      platformDetector = new PlatformDetector(platform)
      expect(platformDetector.getCurrentPlatform()).toBe(platform)
    })
  })

  describe('getCurrentPlatformType', () => {
    it('should return current platform type', () => {
      platformDetector = new PlatformDetector(PLATFORM_WIN)
      expect(platformDetector.getCurrentPlatformType()).toBe('win')
    })
  })
})
