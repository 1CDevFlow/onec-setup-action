/**
 * Базовый класс инсталлятора для onec-setup-action
 */

import { IInstaller, ICacheManager, IPathManager } from './interfaces'
import { Logger } from '../utils/logger'
import {
  CACHE_KEY_PREFIX,
  INSTALLER_CACHE_PRIMARY_KEY
} from '../utils/constants'

/**
 * Базовый класс для всех инсталляторов
 */
export abstract class BaseInstaller implements IInstaller {
  protected cacheManager: ICacheManager
  protected pathManager: IPathManager
  protected logger: Logger

  abstract readonly version: string
  abstract readonly platform: string
  abstract readonly INSTALLED_CACHE_PRIMARY_KEY: string

  constructor(
    cacheManager: ICacheManager,
    pathManager: IPathManager,
    logger: Logger
  ) {
    this.cacheManager = cacheManager
    this.pathManager = pathManager
    this.logger = logger
  }

  /**
   * Скачивает установщик
   */
  abstract download(): Promise<void>

  /**
   * Устанавливает приложение
   */
  abstract install(): Promise<void>

  /**
   * Восстанавливает установленный инструмент из кеша
   */
  async restoreInstalledTool(): Promise<string | undefined> {
    const primaryKey = this.computeInstalledKey()
    const cacheDirs = this.pathManager.getCacheDirectories()

    const matchedKey = await this.cacheManager.restoreCache(
      cacheDirs,
      primaryKey
    )

    if (matchedKey) {
      await this.pathManager.updatePath()
    }

    return matchedKey
  }

  /**
   * Восстанавливает установщик из кеша
   */
  async restoreInstaller(): Promise<string | undefined> {
    const primaryKey = this.computeInstallerKey()
    const installerPath = this.pathManager.getInstallerCachePath()

    const matchedKey = await this.cacheManager.restoreCache(
      [installerPath],
      primaryKey
    )

    return matchedKey
  }

  /**
   * Сохраняет установленный инструмент в кеш
   */
  async saveInstalledTool(): Promise<void> {
    const primaryKey = this.computeInstalledKey()
    const cacheDirs = this.pathManager.getCacheDirectories()

    await this.cacheManager.saveCache(cacheDirs, primaryKey)
  }

  /**
   * Сохраняет установщик в кеш
   */
  async saveInstaller(): Promise<void> {
    const primaryKey = this.computeInstallerKey()
    const installerPath = this.pathManager.getInstallerCachePath()

    await this.cacheManager.saveCache([installerPath], primaryKey)
  }

  /**
   * Вычисляет ключ кеша для установленного инструмента
   */
  protected computeInstalledKey(): string {
    return `${CACHE_KEY_PREFIX}--${this.INSTALLED_CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`
  }

  /**
   * Вычисляет ключ кеша для установщика
   */
  protected computeInstallerKey(): string {
    return `${CACHE_KEY_PREFIX}--${INSTALLER_CACHE_PRIMARY_KEY}--${this.INSTALLED_CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`
  }
}
