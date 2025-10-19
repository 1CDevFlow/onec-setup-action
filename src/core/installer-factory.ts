/**
 * Фабрика инсталляторов для onec-setup-action
 */

import {
  IInstaller,
  ICacheManager,
  IPlatformDetector,
  IPathManager,
  ILogger
} from './interfaces'
import { BaseInstaller } from './base-installer'
import { CacheManager } from './cache-manager'
import { PlatformDetector } from './platform-detector'
import { PathManager } from './path-manager'
import { Logger } from '../utils/logger'
import { ValidationError } from '../errors/base-errors'

/**
 * Конфигурация для создания инсталлятора
 */
export interface InstallerConfig {
  /** Тип устанавливаемого продукта */
  type: 'edt' | 'onec'
  /** Версия продукта для установки */
  version: string
  /** Платформа операционной системы */
  platform: string
  /** Менеджер кеша (опционально) */
  cacheManager?: ICacheManager
  /** Детектор платформы (опционально) */
  platformDetector?: IPlatformDetector
  /** Логгер (опционально) */
  logger?: ILogger
}

/**
 * Фабрика для создания инсталляторов 1C:Enterprise и 1C:EDT
 *
 * Использует паттерн Factory для создания соответствующих инсталляторов
 * на основе типа продукта и платформы.
 *
 * @example
 * ```typescript
 * const installer = await InstallerFactory.createInstaller({
 *   type: 'edt',
 *   version: '2024.2.6',
 *   platform: 'linux'
 * })
 * ```
 */
export class InstallerFactory {
  /**
   * Создает инсталлятор на основе конфигурации
   *
   * @param config - Конфигурация для создания инсталлятора
   * @returns Promise с созданным инсталлятором
   * @throws {ValidationError} При неподдерживаемом типе инсталлятора
   */
  static async createInstaller(config: InstallerConfig): Promise<IInstaller> {
    const logger = config.logger || new Logger()
    const platformDetector =
      config.platformDetector || new PlatformDetector(config.platform)
    const cacheManager = config.cacheManager || new CacheManager(logger)

    // Создаем менеджер путей
    const pathManager = new PathManager(platformDetector, config.type, logger)

    // Создаем конкретный инсталлятор
    if (config.type === 'edt') {
      return await this.createEdtInstaller(
        config,
        cacheManager,
        pathManager,
        logger
      )
    } else if (config.type === 'onec') {
      return await this.createOnecInstaller(
        config,
        cacheManager,
        pathManager,
        logger
      )
    } else {
      throw new ValidationError(`Unsupported installer type: ${config.type}`)
    }
  }

  /**
   * Создает инсталлятор EDT
   */
  private static async createEdtInstaller(
    config: InstallerConfig,
    cacheManager: ICacheManager,
    pathManager: IPathManager,
    logger: ILogger
  ): Promise<IInstaller> {
    // Динамически импортируем EDT класс для избежания циклических зависимостей
    const { EDT } = await import('../tools/edt')

    // Создаем EDT инсталлятор с новой архитектурой
    return new EDTInstaller(
      config.version,
      config.platform,
      cacheManager,
      pathManager,
      logger,
      EDT
    )
  }

  /**
   * Создает инсталлятор OneC
   */
  private static async createOnecInstaller(
    config: InstallerConfig,
    cacheManager: ICacheManager,
    pathManager: IPathManager,
    logger: ILogger
  ): Promise<IInstaller> {
    // Динамически импортируем Platform83 класс
    const { Platform83 } = await import('../tools/platform83')

    // Создаем OneC инсталлятор с новой архитектурой
    return new OnecInstaller(
      config.version,
      config.platform,
      cacheManager,
      pathManager,
      logger,
      Platform83
    )
  }
}

/**
 * Адаптер для EDT инсталлятора
 */
class EDTInstaller extends BaseInstaller {
  readonly INSTALLED_CACHE_PRIMARY_KEY = 'edt'
  private edtInstaller: { download(): Promise<void>; install(): Promise<void> }

  constructor(
    public readonly version: string,
    public readonly platform: string,
    cacheManager: ICacheManager,
    pathManager: IPathManager,
    logger: ILogger,
    EDTClass: new (version: string, platform: string) => { download(): Promise<void>; install(): Promise<void> }
  ) {
    super(cacheManager, pathManager, logger)
    // Создаем оригинальный EDT инсталлятор
    this.edtInstaller = new EDTClass(version, platform)
  }

  async download(): Promise<void> {
    await this.edtInstaller.download()
  }

  async install(): Promise<void> {
    await this.edtInstaller.install()
  }
}

/**
 * Адаптер для OneC инсталлятора
 */
class OnecInstaller extends BaseInstaller {
  readonly INSTALLED_CACHE_PRIMARY_KEY = 'onec'
  private onecInstaller: { download(): Promise<void>; install(): Promise<void> }

  constructor(
    public readonly version: string,
    public readonly platform: string,
    cacheManager: ICacheManager,
    pathManager: IPathManager,
    logger: ILogger,
    Platform83Class: new (version: string, platform: string) => { download(): Promise<void>; install(): Promise<void> }
  ) {
    super(cacheManager, pathManager, logger)
    // Создаем оригинальный Platform83 инсталлятор
    this.onecInstaller = new Platform83Class(version, platform)
  }

  async download(): Promise<void> {
    await this.onecInstaller.download()
  }

  async install(): Promise<void> {
    await this.onecInstaller.install()
  }
}
