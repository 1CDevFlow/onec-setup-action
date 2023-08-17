import * as core from '@actions/core'
import * as cache from '@actions/cache'
import * as tc from '@actions/tool-cache'
import {exec} from '@actions/exec'
import * as glob from '@actions/glob'
import * as io from '@actions/io'
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

    const archivePath = `/tmp/oneget.${extension}`
    await io.rmRF(archivePath)

    const onegetPath = await tc.downloadTool(
      `https://github.com/v8platform/oneget/releases/download/${version}/oneget_${platform}_x86_64.${extension}`,
      `${archivePath}`
    )
    core.info(`oneget was downloaded`)

    let oneGetFolder
    if (platform === 'Windows') {
      oneGetFolder = await tc.extractZip(onegetPath, gstsrc)
    } else {
      oneGetFolder = await tc.extractTar(onegetPath, gstsrc)
    }
    core.info(`oneget was extracted ${oneGetFolder} -> ${gstsrc}`)
    try {
      await cache.saveCache([gstsrc], key)
    } catch (error) {
      if (error instanceof Error) core.info(error.message)
    }
    core.info(`New cache created for this key: "${key}"`)
  } else {
    core.info(`Found oneget cache; using it. (key: "${key}")`)
  }

  core.addPath(gstsrc)
  await exec('chmod', ['+x', `${gstsrc}/oneget`])
}

async function installEDT(version: string, platform: string): Promise<void> {
  const key = `edt----${platform}----${version}`
  const gstsrc = '/opt/1C'
  //const onegetDowloads = 'downloads'
  const installerPattern = '1ce-installer-cli'
  const cacheKey = await cache.restoreCache([gstsrc], key)

  if (!cacheKey) {
    core.info(`edt cache not found; creating a new one. (key: "${key}")`)

    let onegetPlatform = ''
    if (platform === 'Windows') {
      onegetPlatform = 'win'
    } else if (platform === 'Darwin') {
      onegetPlatform = 'mac'
    } else {
      onegetPlatform = 'linux'
    }

    try {
      await exec('oneget', [
        'get',
        '--extract',
        `edt:${onegetPlatform}@${version}`
      ])
    } catch (error) {
      if (error instanceof Error) core.info(error.message)
    }

    core.info(`edt was downloaded`)

    const patterns = [`**/${installerPattern}`]
    const globber = await glob.create(patterns.join('\n'))
    const files = await globber.glob()

    core.info(`finded ${files}`)

    await exec('sudo', [
      files[0],
      'install',
      '--ignore-hardware-checks',
      '--ignore-signature-warnings'
    ])

    try {
      await cache.saveCache([gstsrc], key)
    } catch (error) {
      if (error instanceof Error) core.info(error.message)
    }

    core.info(`New cache created for this key: "${key}"`)
  } else {
    core.info(`Found oneget cache; using it. (key: "${key}")`)
  }
}
async function installPlatform(
  version: string,
  platform: string
): Promise<void> {
  const key = `enec----${platform}----${version}`
  const gstsrc = '/opt/1cv8'
  //const onegetDowloads = 'downloads'
  const installerPattern = 'setup-full'
  const cacheKey = await cache.restoreCache([gstsrc], key)

  if (!cacheKey) {
    core.info(`onec cache not found; creating a new one. (key: "${key}")`)

    let onegetPlatform = ''
    if (platform === 'Windows') {
      onegetPlatform = 'win'
    } else if (platform === 'Darwin') {
      onegetPlatform = 'mac'
    } else {
      onegetPlatform = 'linux'
    }

    try {
      await exec('oneget', [
        'get',
        '--extract',
        `platform:${onegetPlatform}.full.x64@${version}`
      ])
    } catch (error) {
      if (error instanceof Error) core.info(error.message)
    }

    core.info(`onec was downloaded`)

    const patterns = [`**/${installerPattern}*`]
    const globber = await glob.create(patterns.join('\n'))
    const files = await globber.glob()

    core.info(`finded ${files}`)

    await exec('sudo', [
      files[0],
      '--mode',
      'unattended',
      '--enable-components',
      'server',
      '--disable-components',
      'client_full',
      'client_thin',
      'client_thin_fib',
      'ws'
    ])

    try {
      await cache.saveCache([gstsrc], key)
    } catch (error) {
      if (error instanceof Error) core.info(error.message)
    }

    core.info(`New cache created for this key: "${key}"`)
  } else {
    core.info(`Found oneget cache; using it. (key: "${key}")`)
  }
}

export async function run(): Promise<void> {
  const platformType = process.platform
  const onegetVersion = 'v0.6.0'
  const edtVersion = '2022.2.5'
  const platformVersion = '8.3.21.1890'

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
    await installPlatform(platformVersion, platform)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
