import * as core from '@actions/core'
import * as cache from '@actions/cache'
import * as tc from '@actions/tool-cache'
import { exec } from '@actions/exec'

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
    core.info(`oneget was extracted`)
    // await exec.exec(
    //   `curl -L https://github.com/v8platform/oneget/releases/download/${version}/oneget_${platform}_x86_64.${extension} --output oneget.${extension}`
    // )

    await cache.saveCache([gstsrc], key)
    core.addPath(oneGetFolder)

    core.info(`New cache created for this key: "${key}"`)
  } else {
    core.info(`Found oneget cache; using it. (key: "${key}")`)
  }
}
async function run(): Promise<void> {
  const platformType = process.platform
  const onegetVersion = 'v0.6.0'

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
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }

  await exec('oneget')
}
