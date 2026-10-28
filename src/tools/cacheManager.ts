import * as core from '@actions/core'
import { logger } from '../onegetjs/logger'
import * as cache from '@actions/cache'
import { exec } from '@actions/exec'
import { isLinux } from '../platform'
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
    await this.prepareCachePaths(paths)
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

  /**
   * Подготавливает каталоги кэша к распаковке архива actions/cache.
   *
   * Установленные продукты 1С лежат в системных каталогах (/opt/1C, /etc/1C/...),
   * которые недоступны на запись пользователю раннера. actions/cache распаковывает
   * архив tar от имени раннера без sudo, поэтому без подготовки путей restore
   * всегда падает с `Cannot mkdir: Permission denied` и кэш фактически не работает.
   *
   * Для каждого пути: создаёт каталог и передаёт владение пользователю раннера.
   * Только Linux; на Windows/macOS распаковка в системные каталоги и так проходит
   * от имени процесса раннера.
   */
  private async prepareCachePaths(paths: string[]): Promise<void> {
    if (!isLinux()) {
      return
    }

    const user = process.env['USER'] || 'runner'
    for (const dir of paths) {
      logger.info(`Preparing cache path ${dir}`)
      await exec('sudo', ['mkdir', '-p', dir])
      await exec('sudo', ['chown', '-R', `${user}:`, dir])
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
