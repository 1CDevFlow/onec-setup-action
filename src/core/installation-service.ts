/**
 * Сервис установки для onec-setup-action
 */

import {
  IInstaller,
  IInputValidator,
  ILogger,
  InstallationConfig
} from './interfaces'
import { InstallerFactory } from './installer-factory'
import { InputValidator } from '../validators/input-validator'
import { Logger } from '../utils/logger'
import { ValidationError } from '../errors/base-errors'

/**
 * Сервис для управления процессом установки 1C:Enterprise или 1C:EDT
 * 
 * Этот сервис координирует весь процесс установки, включая:
 * - Валидацию входных параметров
 * - Создание соответствующего инсталлятора
 * - Управление кешированием
 * - Обработку ошибок
 * 
 * @example
 * ```typescript
 * const service = new InstallationService(logger)
 * await service.install({
 *   type: 'edt',
 *   version: '2024.2.6',
 *   platform: 'linux',
 *   useCache: true,
 *   useCacheDistr: false,
 *   username: 'user',
 *   password: 'pass'
 * })
 * ```
 */
export class InstallationService {
  private logger: ILogger
  private inputValidator: IInputValidator

  /**
   * Создает экземпляр InstallationService
   * 
   * @param logger - Логгер для записи сообщений (по умолчанию создается новый Logger)
   * @param inputValidator - Валидатор входных данных (по умолчанию создается новый InputValidator)
   */
  constructor(logger?: ILogger, inputValidator?: IInputValidator) {
    this.logger = logger || new Logger()
    this.inputValidator = inputValidator || new InputValidator()
  }

  /**
   * Выполняет установку на основе конфигурации
   * 
   * @param config - Конфигурация установки
   * @throws {ValidationError} При неверных входных параметрах
   * @throws {Error} При ошибках создания инсталлятора или установки
   */
  async install(config: InstallationConfig): Promise<void> {
    try {
      // Валидируем входные данные
      this.inputValidator.validateAll({
        type: config.type,
        edt_version: config.type === 'edt' ? config.version : '',
        onec_version: config.type === 'onec' ? config.version : '',
        username: config.username,
        password: config.password
      })

      // Создаем инсталлятор
      const installer = await InstallerFactory.createInstaller({
        type: config.type,
        version: config.version,
        platform: config.platform,
        logger: this.logger
      })

      // Выполняем установку
      await this.performInstallation(installer, config)
    } catch (error) {
      if (error instanceof ValidationError) {
        this.logger.setFailed(`Validation error: ${error.message}`)
      } else {
        this.logger.setFailed(
          `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
        )
      }
      throw error
    }
  }

  /**
   * Выполняет процесс установки с учетом кеширования
   * 
   * @param installer - Инсталлятор для выполнения установки
   * @param config - Конфигурация установки
   * @private
   */
  private async performInstallation(
    installer: IInstaller,
    config: InstallationConfig
  ): Promise<void> {
    // Проверяем кеш установленного инструмента
    if (config.useCache) {
      const installedKey = await installer.restoreInstalledTool()
      if (installedKey) {
        this.logger.info('Installation restored from cache')
        return
      }
    }

    // Проверяем кеш установщика
    let installerRestored = false
    if (config.useCacheDistr) {
      const installerKey = await installer.restoreInstaller()
      installerRestored = installerKey !== undefined
    }

    // Скачиваем установщик, если не восстановлен из кеша
    if (!installerRestored) {
      await installer.download()
      this.logger.info('Installer downloaded')

      // Сохраняем установщик в кеш
      if (config.useCacheDistr) {
        await installer.saveInstaller()
        this.logger.info('Installer cached')
      }
    }

    // Устанавливаем приложение
    await installer.install()
    this.logger.info('Installation completed successfully')

    // Сохраняем установленный инструмент в кеш
    if (config.useCache) {
      await installer.saveInstalledTool()
      this.logger.info('Installation cached')
    }
  }
}
