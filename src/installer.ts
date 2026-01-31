import * as core from '@actions/core'
import { isCacheFeatureAvailable } from './utils'
import * as tools from './tools'
import { CacheManager } from './tools/cacheManager'
import { PathManager } from './tools/pathManager'
import { logger } from './onegetjs/logger'

export async function run(): Promise<void> {
  const type = core.getInput('type')
  const edt_version = core.getInput('edt_version')
  const onec_version = core.getInput('onec_version')

  const useCache = core.getBooleanInput('cache') && isCacheFeatureAvailable()
  const useCacheDistr =
    core.getBooleanInput('cache_distr') && isCacheFeatureAvailable()
  let installer

  if (type === 'edt') {
    if (edt_version === undefined) {
      throw new Error('EDT version not specified')
    }
    installer = new tools.EDT(edt_version, process.platform)
  } else if (type === 'onec') {
    logger.info('Install 1C:Enterprise v.' + onec_version)
    if (onec_version === undefined) {
      throw new Error('Onec version not specified')
    }
    installer = new tools.Platform83(onec_version, process.platform)
  } else {
    throw new Error('failed to recognize the installer type')
  }

  const cacheManager = new CacheManager()
  const pathManager = new PathManager()

  let installerRestoredKey: string | undefined
  let installerRestored = false
  let installationRestoredKey: string | undefined
  let installationRestored = false

  if (useCache) {
    installationRestoredKey = await cacheManager.restoreInstalled(
      installer.computeInstalledKey(),
      installer.cache_
    )
    installationRestored = installationRestoredKey !== undefined
  }

  if (installationRestored) {
    await pathManager.addExecutablesToPath(
      installer.cache_[0],
      installer.getRunFileNames()
    )
    return
  }

  if (useCacheDistr) {
    installerRestoredKey = await cacheManager.restoreInstaller(
      installer.computeInstallerKey(),
      [installer.getInstallersPath()]
    )
    installerRestored = installerRestoredKey !== undefined
  }

  if (!installerRestored) {
    await installer.download()
    logger.info('Installer downloaded')
    if (useCacheDistr) {
      await cacheManager.saveInstaller(installer.computeInstallerKey(), [
        installer.getInstallersPath()
      ])
      logger.info('Installer cached')
    }
  }

  await installer.install()
  logger.info('Installing success')
  await pathManager.addExecutablesToPath(
    installer.cache_[0],
    installer.getRunFileNames()
  )
  logger.info('Env variable `PATH` updated')

  if (useCache) {
    await cacheManager.saveInstalled(
      installer.computeInstalledKey(),
      installer.cache_
    )
  }
}
