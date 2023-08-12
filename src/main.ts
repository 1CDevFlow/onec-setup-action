import * as core from '@actions/core'
import * as cache from '@actions/cache'
import * as tc from '@actions/tool-cache'
import {exec} from '@actions/exec'

async function installOneGet(version: string, platform: string): Promise<void> {
  const key = `oneget----${platform}----${version}`

  const gstsrc = '/tmp/oneget'
  const cacheKey = await cache.restoreCache([gstsrc], key)

  if (!cacheKey) {
    core.info(`oneget cache not found; creating a new one. (key: "${key}")`)

    let extension
    if (platform === 'Windows') {
      extension = 'zip'
    } else {
      extension = 'tar.gz'
    }

    const onegetPath = await tc.downloadTool(
      `https://github.com/v8platform/oneget/releases/download/${version}/oneget_${platform}_x86_64.${extension}`,
      `oneget.${extension}`
    )
    core.info(`oneget was downloaded`)

    let oneGetFolder
    if (platform === 'Windows') {
      oneGetFolder = await tc.extractZip(onegetPath, gstsrc)
    } else {
      oneGetFolder = await tc.extractTar(onegetPath, gstsrc)
    }
    core.info(`oneget was extracted ${oneGetFolder} -> ${gstsrc}`)

    await cache.saveCache([gstsrc], key)

    core.info(`New cache created for this key: "${key}"`)
  } else {
    core.info(`Found oneget cache; using it. (key: "${key}")`)
  }

  core.addPath(gstsrc)
  await exec('chmod', ['+x', `${gstsrc}/oneget`])
}


async function installEDT(version: string, platform: string): Promise<void> {
  const key = `edt----${platform}----${version}`
  const gstsrc = '/edt'
  const cacheKey = await cache.restoreCache([gstsrc], key)

  if (!cacheKey) {
    core.info(`oneget cache not found; creating a new one. (key: "${key}")`)

    if (platform === 'Windows') {
    } else {
    }
    let onegetPlatform = ''
    if (platform === 'Windows') {
      onegetPlatform = 'win'
    } else {
      onegetPlatform = 'linux'
    }

    await exec('oneget',['get',`edt:${onegetPlatform}@${version}`])
    
    core.info(`edt was downloaded`)

    let oneGetFolder
    if (platform === 'Windows') {
      oneGetFolder = await tc.extractZip(onegetPath, gstsrc)
    } else {
      oneGetFolder = await tc.extractTar(onegetPath, gstsrc)
    }
    core.info(`oneget was extracted ${oneGetFolder} -> ${gstsrc}`)

    await cache.saveCache([gstsrc], key)

    core.info(`New cache created for this key: "${key}"`)
  } else {
    core.info(`Found oneget cache; using it. (key: "${key}")`)
  }

  core.addPath(gstsrc)
  await exec('chmod', ['+x', `${gstsrc}/oneget`])

}

async function run(): Promise<void> {
  const platformType = process.platform
  const onegetVersion = 'v0.6.0'
  const edtVersion = '2023.1.1'
  try {
    let platform = ''

    switch (platformType) {
      case 'win32': {
        platform = 'Windows'
        break
      }
      case 'darwin': {
        platform = 'Darwin'
        break
      }
      case 'linux': {
        platform = 'Linux'
        break
      }
      default: {
        throw new Error('Not supported on this OS type')
      }
    }

    await installOneGet(onegetVersion, platform)
    await installEDT(edtVersion, platform)

  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }

  await exec('oneget')
}
