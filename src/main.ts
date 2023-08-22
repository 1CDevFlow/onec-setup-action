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
  abstract version: string
  abstract platform: string

  // constructor(version: string, platform: string) {
  // }

  abstract getCacheDirs(): string[]
  abstract install(): Promise<void>

  protected async handleLoadedCache(): Promise<void> {}

  async restoreCache(): Promise<string | undefined> {
    const primaryKey = await this.computeKey()
    const cachePath = this.cache_

    let matchedKey: string | undefined

    try {
      matchedKey = await cache.restoreCache(cachePath.slice(), primaryKey)
    } catch (err) {
      const message = (err as Error).message
      core.info(`[warning]${message}`)
      core.setOutput('cache-hit', false)
      return
    }

    await this.handleLoadedCache()

    await this.handleMatchResult(matchedKey, primaryKey)
    return matchedKey
  }

  async computeKey(): Promise<string> {
    return `${this.CACHE_KEY_PREFIX}--${this.CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`
  }

  async handleMatchResult(
    matchedKey: string | undefined,
    primaryKey: string
  ): Promise<void> {
    if (matchedKey) {
      core.info(`Cache restored from key: ${matchedKey}`)
    } else {
      core.info(`${primaryKey} cache is not found`)
    }
    core.setOutput('cache-hit', matchedKey === primaryKey)
  }
  async saveCache(): Promise<void> {
    try {
      await cache.saveCache(this.cache_.slice(), await this.computeKey())
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
  constructor(version: string, platform: string) {
    //super(version, platform)
    super()
    this.version = version
    this.platform = platform
    this.cache_ = this.getCacheDirs()
  }

  async install(): Promise<void> {
    const installerPattern = 'setup-full'

    let onegetPlatform = ''
    if (this.platform === 'win32') {
      onegetPlatform = 'win'
    } else if (this.platform === 'darwin') {
      onegetPlatform = 'mac'
    } else {
      onegetPlatform = 'linux'
    }

    try {
      await exec('oneget', [
        'get',
        '--extract',
        `platform:${onegetPlatform}.full.x64@${this.version}`
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
  }

  getCacheDirs(): string[] {
    switch (this.platform) {
      case 'win32': {
        return ['C:/Program Files/1cv8']
      }
      case 'darwin': {
        return ['/opt/1cv8'] // /Applications/1cv8.localized/8.3.21.1644/ but inly .app
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
  constructor(version: string, platform: string) {
    super()
    this.version = version
    this.platform = platform
    this.cache_ = this.getCacheDirs()
  }
  async install(): Promise<void> {
    let extension

    if (this.platform === 'win32') {
      extension = 'zip'
    } else {
      extension = 'tar.gz'
    }

    const archivePath = `/tmp/oneget.${extension}`
    await io.rmRF(archivePath)

    const onegetPath = await tc.downloadTool(
      `https://github.com/v8platform/oneget/releases/download/${this.version}/oneget_${this.platform}_x86_64.${extension}`,
      `${archivePath}`
    )
    core.info(`oneget was downloaded`)

    let oneGetFolder
    if (this.platform === 'win32') {
      oneGetFolder = await tc.extractZip(onegetPath, this.cache_[0])
    } else {
      oneGetFolder = await tc.extractTar(onegetPath, this.cache_[0])
    }
    core.info(`oneget was extracted ${oneGetFolder} -> ${this.cache_[0]}`)

    core.addPath(this.cache_[0])
    await exec('chmod', ['+x', `${this.cache_[0]}/oneget`])
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
  constructor(version: string, platform: string) {
    super()
    this.version = version
    this.platform = platform
    this.cache_ = this.getCacheDirs()
  }

  async install(): Promise<void> {
    const installerPattern = '1ce-installer-cli'
    let onegetPlatform = ''

    if (this.platform === 'win32') {
      onegetPlatform = 'win'
    } else if (this.platform === 'darwin') {
      onegetPlatform = 'mac'
    } else {
      onegetPlatform = 'linux'
    }

    try {
      await exec('oneget', [
        'get',
        '--extract',
        `edt:${onegetPlatform}@${this.version}`
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
  }

  getCacheDirs(): string[] {
    switch (this.platform) {
      case 'win32': {
        return ['C:/Program Files/1C']
      }
      case 'darwin': {
        return ['/Applications/1C']
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

export async function run(): Promise<void> {
  const onegetVersion = 'v0.6.0'
  const type = core.getInput('type')
  const edt_version = core.getInput('edt_version')
  const onec_version = core.getInput('onec_version')
  const useCache = core.getBooleanInput('cache') && isCacheFeatureAvailable()
  let installer: OnecTool

  if (type === 'edt') {
    installer = new EDT(edt_version, process.platform)
  } else if (type === 'onec') {
    installer = new OnecPlatform(onec_version, process.platform)
  } else {
    throw new Error('not recognized installer type')
  }

  let restoredKey: string | undefined
  let restored = false

  if (useCache) {
    restoredKey = await installer.restoreCache()
    restored = restoredKey !== undefined
  }

  if (!restored) {
    const oneget = new OneGet(onegetVersion, process.platform)

    await oneget.install()

    await installer.install()

    if (useCache) {
      await installer.saveCache()
    }
  }
}

run()
