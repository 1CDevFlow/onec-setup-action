import * as core from '@actions/core'
import { isCacheFeatureAvailable } from './utils'
import { Logger } from './utils/logger'
import { InstallationService } from './core/installation-service'
import { InstallationConfig } from './core/interfaces'
import { DEFAULT_EDT_VERSION, DEFAULT_ONEC_VERSION } from './utils/constants'

/**
 * Основная функция запуска установки
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
