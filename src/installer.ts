import * as core from '@actions/core'
import { isCacheFeatureAvailable } from './utils'
import { Logger } from './utils/logger'
import { InstallationService } from './core/installation-service'
import { InstallationConfig } from './core/interfaces'
import { DEFAULT_EDT_VERSION, DEFAULT_ONEC_VERSION } from './utils/constants'

/**
 * Основная функция запуска установки 1C:Enterprise или 1C:EDT
 * 
 * Эта функция является точкой входа для GitHub Action и выполняет:
 * 1. Получение входных параметров из GitHub Actions
 * 2. Валидацию входных данных
 * 3. Создание конфигурации установки
 * 4. Запуск процесса установки через InstallationService
 * 
 * @throws {ValidationError} При неверных входных параметрах
 * @throws {AuthenticationError} При отсутствии учетных данных
 * @throws {DownloadError} При ошибках загрузки дистрибутивов
 * @throws {InstallationError} При ошибках установки
 * 
 * @example
 * ```yaml
 * - uses: actions/checkout@v4
 * - uses: your-org/onec-setup-action@v1
 *   with:
 *     type: 'edt'
 *     edt_version: '2024.2.6'
 *   env:
 *     ONEC_USERNAME: ${{ secrets.ONEC_USERNAME }}
 *     ONEC_PASSWORD: ${{ secrets.ONEC_PASSWORD }}
 * ```
 */
export async function run(): Promise<void> {
  const logger = new Logger()
  const installationService = new InstallationService(logger)

  try {
    // Получаем входные данные
    const type = core.getInput('type') as 'edt' | 'onec'
    const edt_version = core.getInput('edt_version')
    const onec_version = core.getInput('onec_version')
    const username = process.env.ONEC_USERNAME || ''
    const password = process.env.ONEC_PASSWORD || ''

    // Определяем версию и тип
    const version =
      type === 'edt'
        ? edt_version || DEFAULT_EDT_VERSION
        : onec_version || DEFAULT_ONEC_VERSION

    // Логируем информацию об установке
    if (type === 'edt') {
      logger.info(`Installing 1C:EDT v.${version}`)
    } else {
      logger.info(`Installing 1C:Enterprise v.${version}`)
    }

    // Создаем конфигурацию установки
    const config: InstallationConfig = {
      type,
      version,
      platform: process.platform,
      useCache: core.getBooleanInput('cache') && isCacheFeatureAvailable(),
      useCacheDistr:
        core.getBooleanInput('cache_distr') && isCacheFeatureAvailable(),
      username,
      password
    }

    // Выполняем установку
    await installationService.install(config)
  } catch (error) {
    logger.setFailed(
      `Installation failed: ${error instanceof Error ? error.message : String(error)}`
    )
    throw error
  }
}
