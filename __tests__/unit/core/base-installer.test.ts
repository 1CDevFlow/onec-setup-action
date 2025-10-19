/**
 * Unit-тесты для BaseInstaller
 */

import { BaseInstaller } from '../../../src/core/base-installer'
import { ICacheManager, IPathManager } from '../../../src/core/interfaces'
import { Logger } from '../../../src/utils/logger'

// Мокаем зависимости
jest.mock('../../../src/utils/logger')

describe('BaseInstaller', () => {
  let mockCacheManager: jest.Mocked<ICacheManager>
  let mockPathManager: jest.Mocked<IPathManager>
  let mockLogger: jest.Mocked<Logger>
  let testInstaller: TestInstaller

  // Тестовый класс, наследующий BaseInstaller
  class TestInstaller extends BaseInstaller {
    readonly version = '1.0.0'
    readonly platform = 'linux'
    readonly INSTALLED_CACHE_PRIMARY_KEY = 'test'

    async download(): Promise<void> {
      // Mock implementation
    }

    async install(): Promise<void> {
      // Mock implementation
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Создаем моки
    mockCacheManager = {
      restoreCache: jest.fn(),
      saveCache: jest.fn(),
      isFeatureAvailable: jest.fn().mockReturnValue(true)
    }

    mockPathManager = {
      getCacheDirectories: jest.fn().mockReturnValue(['/test/cache']),
      getInstallerCachePath: jest.fn().mockReturnValue('/test/installer'),
      getExecutableNames: jest.fn().mockReturnValue(['test']),
      updatePath: jest.fn()
    }

    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      setFailed: jest.fn()
    } as any

    testInstaller = new TestInstaller(
      mockCacheManager,
      mockPathManager,
      mockLogger
    )
  })

  describe('restoreInstalledTool', () => {
    it('should restore cache and update path when cache is found', async () => {
      const cacheKey = 'test-cache-key'
      mockCacheManager.restoreCache.mockResolvedValue(cacheKey)

      const result = await testInstaller.restoreInstalledTool()

      expect(mockCacheManager.restoreCache).toHaveBeenCalledWith(
        ['/test/cache'],
        'setup--test--1.0.0--linux'
      )
      expect(mockPathManager.updatePath).toHaveBeenCalled()
      expect(result).toBe(cacheKey)
    })

    it('should return undefined when cache is not found', async () => {
      mockCacheManager.restoreCache.mockResolvedValue(undefined)

      const result = await testInstaller.restoreInstalledTool()

      expect(mockCacheManager.restoreCache).toHaveBeenCalledWith(
        ['/test/cache'],
        'setup--test--1.0.0--linux'
      )
      expect(mockPathManager.updatePath).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe('restoreInstaller', () => {
    it('should restore installer cache when found', async () => {
      const cacheKey = 'installer-cache-key'
      mockCacheManager.restoreCache.mockResolvedValue(cacheKey)

      const result = await testInstaller.restoreInstaller()

      expect(mockCacheManager.restoreCache).toHaveBeenCalledWith(
        ['/test/installer'],
        'setup--installer--test--1.0.0--linux'
      )
      expect(result).toBe(cacheKey)
    })

    it('should return undefined when installer cache is not found', async () => {
      mockCacheManager.restoreCache.mockResolvedValue(undefined)

      const result = await testInstaller.restoreInstaller()

      expect(mockCacheManager.restoreCache).toHaveBeenCalledWith(
        ['/test/installer'],
        'setup--installer--test--1.0.0--linux'
      )
      expect(result).toBeUndefined()
    })
  })

  describe('saveInstalledTool', () => {
    it('should save installed tool to cache', async () => {
      await testInstaller.saveInstalledTool()

      expect(mockCacheManager.saveCache).toHaveBeenCalledWith(
        ['/test/cache'],
        'setup--test--1.0.0--linux'
      )
    })
  })

  describe('saveInstaller', () => {
    it('should save installer to cache', async () => {
      await testInstaller.saveInstaller()

      expect(mockCacheManager.saveCache).toHaveBeenCalledWith(
        ['/test/installer'],
        'setup--installer--test--1.0.0--linux'
      )
    })
  })

  describe('cache key computation', () => {
    it('should compute correct installed cache key', () => {
      // Доступ к protected методу через тестовый класс
      const key = (testInstaller as any).computeInstalledKey()
      expect(key).toBe('setup--test--1.0.0--linux')
    })

    it('should compute correct installer cache key', () => {
      // Доступ к protected методу через тестовый класс
      const key = (testInstaller as any).computeInstallerKey()
      expect(key).toBe('setup--installer--test--1.0.0--linux')
    })
  })
})
