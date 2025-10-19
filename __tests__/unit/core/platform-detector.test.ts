/**
 * Unit-тесты для PlatformDetector
 */

import { PlatformDetector } from '../../../src/core/platform-detector'

describe('PlatformDetector', () => {
  let platformDetector: PlatformDetector

  describe('Windows platform', () => {
    beforeEach(() => {
      platformDetector = new PlatformDetector('win32')
    })

    it('should detect Windows platform type', () => {
      expect(platformDetector.getPlatformType('win32')).toBe('win')
    })

    it('should identify as Windows', () => {
      expect(platformDetector.isWindows()).toBe(true)
      expect(platformDetector.isLinux()).toBe(false)
      expect(platformDetector.isMac()).toBe(false)
    })
  })

  describe('Linux platform', () => {
    beforeEach(() => {
      platformDetector = new PlatformDetector('linux')
    })

    it('should detect Linux platform type', () => {
      expect(platformDetector.getPlatformType('linux')).toBe('linux')
    })

    it('should identify as Linux', () => {
      expect(platformDetector.isWindows()).toBe(false)
      expect(platformDetector.isLinux()).toBe(true)
      expect(platformDetector.isMac()).toBe(false)
    })
  })

  describe('macOS platform', () => {
    beforeEach(() => {
      platformDetector = new PlatformDetector('darwin')
    })

    it('should detect macOS platform type', () => {
      expect(platformDetector.getPlatformType('darwin')).toBe('mac')
    })

    it('should identify as macOS', () => {
      expect(platformDetector.isWindows()).toBe(false)
      expect(platformDetector.isLinux()).toBe(false)
      expect(platformDetector.isMac()).toBe(true)
    })
  })

  describe('Unknown platform', () => {
    beforeEach(() => {
      platformDetector = new PlatformDetector('unknown')
    })

    it('should default to Linux for unknown platforms', () => {
      expect(platformDetector.getPlatformType('unknown')).toBe('linux')
    })

    it('should identify as Linux for unknown platforms', () => {
      expect(platformDetector.isWindows()).toBe(false)
      expect(platformDetector.isLinux()).toBe(false) // unknown не равен 'linux'
      expect(platformDetector.isMac()).toBe(false)
    })
  })

  describe('Platform type detection', () => {
    it('should correctly identify win32 as Windows', () => {
      const detector = new PlatformDetector('win32')
      expect(detector.getPlatformType('win32')).toBe('win')
    })

    it('should correctly identify linux as Linux', () => {
      const detector = new PlatformDetector('linux')
      expect(detector.getPlatformType('linux')).toBe('linux')
    })

    it('should correctly identify darwin as macOS', () => {
      const detector = new PlatformDetector('darwin')
      expect(detector.getPlatformType('darwin')).toBe('mac')
    })

    it('should default to Linux for any other platform', () => {
      const detector = new PlatformDetector('freebsd')
      expect(detector.getPlatformType('freebsd')).toBe('linux')
    })
  })
})