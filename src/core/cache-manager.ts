/**
 * Менеджер кеша для onec-setup-action
 */

import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { ICacheManager } from './interfaces'
import { Logger } from '../utils/logger'

/**
 * Реализация менеджера кеша
 */
export class CacheManager implements ICacheManager {
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * Восстанавливает кеш по ключу
   */
  async restoreCache(
    paths: string[],
    primaryKey: string,
    restoreKeys?: string[]
  ): Promise<string | undefined> {
    try {
      const matchedKey = await cache.restoreCache(
        paths,
        primaryKey,
        restoreKeys || [primaryKey]
      )

      if (matchedKey) {
        this.logger.info(`Cache restored from key: ${matchedKey}`)
        core.setOutput('cache-hit', true)
      } else {
        this.logger.info(`${primaryKey} cache is not found`)
        core.setOutput('cache-hit', false)
      }

      return matchedKey
    } catch (error) {
      this.logger.warning(
        `Failed to restore cache: ${error instanceof Error ? error.message : String(error)}`
      )
      core.setOutput('cache-hit', false)
      return undefined
    }
  }

  /**
   * Сохраняет кеш
   */
  async saveCache(paths: string[], key: string): Promise<void> {
    try {
      this.logger.info(`Trying to save: ${paths.toString()}`)
      await cache.saveCache(paths, key)
      this.logger.info(`Cache saved with key: ${key}`)
    } catch (error) {
      this.logger.warning(
        `Failed to save cache: ${error instanceof Error ? error.message : String(error)}`
      )
      throw error
    }
  }

  /**
   * Проверяет доступность функции кеширования
   */
  isFeatureAvailable(): boolean {
    return cache.isFeatureAvailable()
  }
}

/**
 * Функция для восстановления кеша по основному ключу (для обратной совместимости)
 */
export async function restoreCacheByPrimaryKey(
  paths: string[],
  primaryKey: string
): Promise<string | undefined> {
  const logger = new Logger()
  const cacheManager = new CacheManager(logger)
  return await cacheManager.restoreCache(paths, primaryKey)
}
