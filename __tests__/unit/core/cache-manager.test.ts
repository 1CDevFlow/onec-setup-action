/**
 * Unit-тесты для CacheManager
 */

import { CacheManager } from '../../../src/core/cache-manager'
import { Logger } from '../../../src/utils/logger'

// Мокаем @actions/cache
jest.mock('@actions/cache', () => ({
  restoreCache: jest.fn(),
  saveCache: jest.fn(),
  isFeatureAvailable: jest.fn()
}))

// Мокаем @actions/core
jest.mock('@actions/core', () => ({
  setOutput: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  setFailed: jest.fn()
}))

describe('CacheManager', () => {
  let cacheManager: CacheManager
  let logger: Logger
  let mockRestoreCache: jest.Mock
  let mockSaveCache: jest.Mock
  let mockIsFeatureAvailable: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    logger = new Logger()
    cacheManager = new CacheManager(logger)

    // Получаем моки после импорта
    const cache = require('@actions/cache')
    mockRestoreCache = cache.restoreCache
    mockSaveCache = cache.saveCache
    mockIsFeatureAvailable = cache.isFeatureAvailable
  })

  describe('restoreCache', () => {
    it('should restore cache successfully', async () => {
      const paths = ['/test/path']
      const primaryKey = 'test-key'
      const matchedKey = 'test-key'

      mockRestoreCache.mockResolvedValue(matchedKey)

      const result = await cacheManager.restoreCache(paths, primaryKey)

      expect(mockRestoreCache).toHaveBeenCalledWith(paths, primaryKey, [
        primaryKey
      ])
      expect(result).toBe(matchedKey)
      const core = require('@actions/core')
      expect(core.setOutput).toHaveBeenCalledWith('cache-hit', true)
    })

    it('should return undefined when cache not found', async () => {
      const paths = ['/test/path']
      const primaryKey = 'test-key'

      mockRestoreCache.mockResolvedValue(undefined)

      const result = await cacheManager.restoreCache(paths, primaryKey)

      expect(result).toBeUndefined()
      const core = require('@actions/core')
      expect(core.setOutput).toHaveBeenCalledWith('cache-hit', false)
    })

    it('should handle restore cache errors', async () => {
      const paths = ['/test/path']
      const primaryKey = 'test-key'
      const error = new Error('Cache error')

      mockRestoreCache.mockRejectedValue(error)

      const result = await cacheManager.restoreCache(paths, primaryKey)

      expect(result).toBeUndefined()
      const core = require('@actions/core')
      expect(core.setOutput).toHaveBeenCalledWith('cache-hit', false)
    })
  })

  describe('saveCache', () => {
    it('should save cache successfully', async () => {
      const paths = ['/test/path']
      const key = 'test-key'

      mockSaveCache.mockResolvedValue(undefined)

      await cacheManager.saveCache(paths, key)

      expect(mockSaveCache).toHaveBeenCalledWith(paths, key)
    })

    it('should handle save cache errors', async () => {
      const paths = ['/test/path']
      const key = 'test-key'
      const error = new Error('Save error')

      mockSaveCache.mockRejectedValue(error)

      await expect(cacheManager.saveCache(paths, key)).rejects.toThrow(
        'Save error'
      )
    })
  })

  describe('isFeatureAvailable', () => {
    it('should return cache feature availability', () => {
      mockIsFeatureAvailable.mockReturnValue(true)

      const result = cacheManager.isFeatureAvailable()

      expect(result).toBe(true)
      expect(mockIsFeatureAvailable).toHaveBeenCalled()
    })
  })
})
