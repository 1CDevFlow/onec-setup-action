import * as core from '@actions/core'
import { isCacheFeatureAvailable } from './utils'
import * as tools from './tools'

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
    console.log('Install 1C:Enterprise v.' + onec_version)
    if (onec_version === undefined) {
      throw new Error('Onec version not specified')
    }
    installer = new tools.Platform83(onec_version, process.platform)
  } else {
    throw new Error('failed to recognize the installer type')
  }

  let installerRestoredKey: string | undefined
  let installerRestored = false
  let installationRestoredKey: string | undefined
  let installationRestored = false

  if (useCache) {
    installationRestoredKey = await installer.restoreInstalledTool()
    installationRestored = installationRestoredKey !== undefined
  }

  if (installationRestored) {
    return
  }

  if (useCacheDistr) {
    installerRestoredKey = await installer.restoreInstallationPackage()
    installerRestored = installerRestoredKey !== undefined
  }

  if (!installationRestored) {
    await installer.download()
    if (useCacheDistr) {
      await installer.saveInstallerCache()
    }
  }
  await installer.install()
  await installer.updatePath()

  if (useCache) {
    await installer.saveInstalledCache()
  }
}
