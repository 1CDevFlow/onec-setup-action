import * as core from '@actions/core'
import { logger } from '../onegetjs/logger'
import * as cache from '@actions/cache'
import { restoreCacheByPrimaryKey } from '../utils'

export class CacheManager {
  async restoreInstaller(
    key: string,
    paths: string[]
  ): Promise<string | undefined> {
    const matchedKey = await restoreCacheByPrimaryKey(paths, key)
    this.logCacheResult(matchedKey, key)
    return matchedKey
  }

  async restoreInstalled(
    key: string,
    paths: string[]
  ): Promise<string | undefined> {
    const matchedKey = await restoreCacheByPrimaryKey(paths, key)
    this.logCacheResult(matchedKey, key)
    return matchedKey
  }

  async saveInstaller(key: string, paths: string[]): Promise<void> {
    try {
      await cache.saveCache(paths, key)
    } catch (error) {
      if (error instanceof Error) logger.info(error.message)
    }
  }

  async saveInstalled(key: string, paths: string[]): Promise<void> {
    try {
      logger.info(`Trying to save: ${paths.toString()}`)
      await cache.saveCache(paths, key)
    } catch (error) {
      if (error instanceof Error) logger.info(error.message)
    }
  }

  private logCacheResult(matchedKey: string | undefined, primaryKey: string) {
    if (matchedKey) {
      logger.info(`Cache restored from key: ${matchedKey}`)
    } else {
      logger.info(`${primaryKey} cache is not found`)
    }
    core.setOutput('cache-hit', matchedKey === primaryKey)
  }
}
