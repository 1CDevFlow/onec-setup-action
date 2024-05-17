import * as core from '@actions/core'
import { isCacheFeatureAvailable, restoreCasheByPrimaryKey } from './utils'
import * as tools from './tools'



export default async function run(): Promise<void> {
  const type = core.getInput('type')
  const edt_version = core.getInput('edt_version')
  const onec_version = core.getInput('onec_version')
//   const onegetVersion = core.getInput('oneget_version')

  const useCache = core.getBooleanInput('cache') && isCacheFeatureAvailable()
//   const useCacheDistr =
//     core.getBooleanInput('cache_distr') && isCacheFeatureAvailable()
  let installer

  if (type === 'edt') {
    installer = new tools.EDT(edt_version, process.platform)
  } else if (type === 'onec') {
    installer = new tools.Platform83(onec_version, process.platform)
  } else {
    throw new Error('failed to recognize the installer type')
  }

//   let installerRestoredKey: string | undefined
//   let installerRestored = false
  let instalationRestoredKey: string | undefined
  let instalationRestored = false

  if (useCache) {
    instalationRestoredKey = await installer.restoreInstalledTool()
    instalationRestored = instalationRestoredKey !== undefined
  }

  if (instalationRestored) {
    return
  }

//   if (useCacheDistr) {
//     installerRestoredKey = await installer.restoreInstallationPackage()
//     installerRestored = installerRestoredKey !== undefined
//   }

//   if (!installerRestored) {
//     const oneget = new OneGet(onegetVersion, process.platform)
//     await oneget.download()
//     await oneget.install()
//     await installer.download()
//     if (useCacheDistr) {
//       await installer.saveInstallerCache()
//     }
//   }

  await installer.install()
  await installer.updatePath()

  if (useCache) {
    await installer.saveInstalledCache()
  }
}
