/**
 * Unit-тесты для CacheManager
 */

import { CacheManager } from '../../../src/core/cache-manager'
import { Logger } from '../../../src/utils/logger'
import * as cache from '@actions/cache'
import * as core from '@actions/core'

// Мокаем зависимости
jest.mock('@actions/cache')
jest.mock('@actions/core')
jest.mock('../../../src/utils/logger')

describe('CacheManager', () => {
  let cacheManager: CacheManager
  let mockLogger: jest.Mocked<Logger>

  beforeEach(() => {
    jest.clearAllMocks()

    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      setFailed: jest.fn()
    } as jest.Mocked<Logger>

    cacheManager = new CacheManager(mockLogger)
  })

  describe('restoreCache', () => {
    it('should restore cache successfully and set cache-hit output', async () => {
      const paths = ['/test/path']
      const primaryKey = 'test-key'
      const matchedKey = 'matched-key'

      ;(cache.restoreCache as jest.Mock).mockResolvedValue(matchedKey)
      ;(core.setOutput as jest.Mock).mockImplementation(() => {})

      const result = await cacheManager.restoreCache(paths, primaryKey)

      expect(cache.restoreCache).toHaveBeenCalledWith(paths, primaryKey, [
        primaryKey
      ])
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Cache restored from key: ${matchedKey}`
      )
      expect(core.setOutput).toHaveBeenCalledWith('cache-hit', true)
      expect(result).toBe(matchedKey)
    })

    it('should handle cache miss and set cache-hit output to false', async () => {
      const paths = ['/test/path']
      const primaryKey = 'test-key'

      ;(cache.restoreCache as jest.Mock).mockResolvedValue(undefined)
      ;(core.setOutput as jest.Mock).mockImplementation(() => {})

      const result = await cacheManager.restoreCache(paths, primaryKey)

      expect(cache.restoreCache).toHaveBeenCalledWith(paths, primaryKey, [
        primaryKey
      ])
      expect(mockLogger.info).toHaveBeenCalledWith(
        `${primaryKey} cache is not found`
      )
      expect(core.setOutput).toHaveBeenCalledWith('cache-hit', false)
      expect(result).toBeUndefined()
    })

    it('should handle restore cache errors gracefully', async () => {
      const paths = ['/test/path']
      const primaryKey = 'test-key'
      const error = new Error('Cache restore failed')

      ;(cache.restoreCache as jest.Mock).mockRejectedValue(error)
      ;(core.setOutput as jest.Mock).mockImplementation(() => {})

      const result = await cacheManager.restoreCache(paths, primaryKey)

      expect(mockLogger.warning).toHaveBeenCalledWith(
        'Failed to restore cache: Cache restore failed'
      )
      expect(core.setOutput).toHaveBeenCalledWith('cache-hit', false)
      expect(result).toBeUndefined()
    })

    it('should use custom restore keys when provided', async () => {
      const paths = ['/test/path']
      const primaryKey = 'test-key'
      const restoreKeys = ['restore-key-1', 'restore-key-2']

      ;(cache.restoreCache as jest.Mock).mockResolvedValue(undefined)
      ;(core.setOutput as jest.Mock).mockImplementation(() => {})

      await cacheManager.restoreCache(paths, primaryKey, restoreKeys)

      expect(cache.restoreCache).toHaveBeenCalledWith(
        paths,
        primaryKey,
        restoreKeys
      )
    })
  })

  describe('saveCache', () => {
    it('should save cache successfully', async () => {
      const paths = ['/test/path']
      const key = 'test-key'

      ;(cache.saveCache as jest.Mock).mockResolvedValue(undefined)

      await cacheManager.saveCache(paths, key)

      expect(mockLogger.info).toHaveBeenCalledWith(
        `Trying to save: ${paths.toString()}`
      )
      expect(cache.saveCache).toHaveBeenCalledWith(paths, key)
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Cache saved with key: ${key}`
      )
    })

    it('should handle save cache errors and rethrow them', async () => {
      const paths = ['/test/path']
      const key = 'test-key'
      const error = new Error('Cache save failed')

      ;(cache.saveCache as jest.Mock).mockRejectedValue(error)

      await expect(cacheManager.saveCache(paths, key)).rejects.toThrow(
        'Cache save failed'
      )

      expect(mockLogger.warning).toHaveBeenCalledWith(
        'Failed to save cache: Cache save failed'
      )
    })
  })

  describe('isFeatureAvailable', () => {
    it('should return cache feature availability', () => {
      ;(cache.isFeatureAvailable as jest.Mock).mockReturnValue(true)

      const result = cacheManager.isFeatureAvailable()

      expect(cache.isFeatureAvailable).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false when cache feature is not available', () => {
      ;(cache.isFeatureAvailable as jest.Mock).mockReturnValue(false)

      const result = cacheManager.isFeatureAvailable()

      expect(cache.isFeatureAvailable).toHaveBeenCalled()
      expect(result).toBe(false)
    })
  })
})
