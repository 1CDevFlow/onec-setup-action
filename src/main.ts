import * as core from '@actions/core'
import * as cache from '@actions/cache'
import * as tc from '@actions/tool-cache'
import {exec} from '@actions/exec'
import * as glob from '@actions/glob'
import * as io from '@actions/io'
import {isCacheFeatureAvailable} from './utils'

interface IOnecTools {
  CACHE_KEY_PREFIX: string
  CACHE_PRIMARY_KEY: string
  cache_: string[]
  version: string
  platform: string
  getCacheDirs(): string[]
}

abstract class OnecTool implements IOnecTools {
  CACHE_KEY_PREFIX = 'setup-onec'
  abstract CACHE_PRIMARY_KEY: string
  abstract cache_: string[]
  abstract version : string
  abstract platform: string
  constructor(
     version: string,
     platform: string
  ) {
  }

  abstract getCacheDirs(): string[]
  protected async handleLoadedCache() {}

  public async restoreCache() {
    const primaryKey = await this.computeKey()
    const cachePath = this.cache_

    let matchedKey: string | undefined
    try {
      matchedKey = await cache.restoreCache(cachePath, primaryKey)
    } catch (err) {
      const message = (err as Error).message
      core.info(`[warning]${message}`)
      core.setOutput('cache-hit', false)
      return
    }


    await this.handleLoadedCache()

    this.handleMatchResult(matchedKey, primaryKey)
  }

  public async computeKey() {

    return `${this.CACHE_KEY_PREFIX}--${this.CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`

  }

  public handleMatchResult(matchedKey: string | undefined, primaryKey: string) {
    if (matchedKey) {
      core.info(`Cache restored from key: ${matchedKey}`)
    } else {
      core.info(`${primaryKey} cache is not found`)
    }
    core.setOutput('cache-hit', matchedKey === primaryKey)
  }
  public async saveCache() {
  try {
    await cache.saveCache(this.cache_, await this.computeKey())
  } catch (error) {
    if (error instanceof Error) core.info(error.message)
  }
  }
}

class OnecPlatform extends OnecTool {
  CACHE_PRIMARY_KEY = 'onec'
  version: string
  cache_: string[]
  platform: string
  constructor(
     version: string,
     platform: string
  ) {
    super(version,platform)
    this.version = version
    this.platform = platform
    this.cache_ = this.getCacheDirs()
    
  }

  getCacheDirs(): string[] {

    switch (this.platform) {
      case 'win32': {
        return ['C:/Program Files/1cv8']
      }
      case 'darwin': {
        return ['/opt/1cv8']
      }
      case 'linux': {
        return ['/opt/1cv8']
      }
      default: {
        throw new Error('Not supported on this OS type')
      }
    }
  }

}

class OneGet extends OnecTool {
  CACHE_PRIMARY_KEY = 'oneget'
  version: string
  cache_: string[]
  platform: string
  constructor(
     version: string,
     platform: string
  ) {
    super(version,platform)
    this.version = version
    this.platform = platform
    this.cache_ = this.getCacheDirs()
    
  }

  getCacheDirs(): string[] {
    return ['/tmp/oneget']
  }
}
class EDT extends OnecTool {
  CACHE_PRIMARY_KEY = 'edt'
  version: string
  cache_: string[]
  platform: string
  constructor(
     version: string,
     platform: string
  ) {
    super(version,platform)
    this.version = version
    this.platform = platform
    this.cache_ = this.getCacheDirs()
    
  }

  getCacheDirs(): string[] {

    switch (this.platform) {
      case 'win32': {
        return ['C:/Program Files/1C']
      }
      case 'darwin': {
        return ['C:/Program Files/1C']
      }
      case 'linux': {
        return ['/opt/1C']
      }
      default: {
        throw new Error('Not supported on this OS type')
      }
    }
  }

}

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
      'client_full,client_thin,client_thin_fib,ws'
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
  let type = core.getInput('type')
  let edt_version = core.getInput('edt_version')
  let onec_version = core.getInput('onec_version')
  let useCache = core.getInput('cache') && isCacheFeatureAvailable()
  let installer: OnecTool
  

  if (type === 'edt') {

    let installer = new EDT(edt_version, process.platform)
  } else if(type === 'onec') {
    let installer = new OnecPlatform(onec_version, process.platform)
  } else {
    throw new Error('don\'t recognized installer type')
  }

  if (useCache) {
    await installer.restoreCache()

  }

  installer.install()

  if (useCache) {
    await installer.saveCache()

  }
  
}

export async function run2(): Promise<void> {
  const platformType = process.platform
  const onegetVersion = 'v0.6.0'
  const edtVersion = '2022.2.5'
  const platformVersion = '8.3.21.1890'
  const useCache = core.getInput('cache') && isCacheFeatureAvailable()
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
