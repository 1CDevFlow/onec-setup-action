import * as core from '@actions/core'
import * as cache from '@actions/cache'
import * as tc from '@actions/tool-cache'
import { exec } from '@actions/exec'
import * as glob from '@actions/glob'
import * as io from '@actions/io'
import { isCacheFeatureAvailable, restoreCasheByPrimaryKey } from './utils'
import path from 'path'

const PLATFORM_WIN = 'win32'
const PLATFORM_LIN = 'linux'
const PLATFORM_MAC = 'darwin'

interface IOnecTools {
  CACHE_KEY_PREFIX: string
  CACHE_PRIMARY_KEY: string
  cache_: string[]
  version: string
  platform: string
  getCacheDirs(): string[]
  installerPath: string
  instalationPath: string
}

abstract class OnecTool implements IOnecTools {
  CACHE_KEY_PREFIX = 'setup-onec'
  abstract CACHE_PRIMARY_KEY: string
  abstract cache_: string[]
  abstract version: string
  abstract platform: string
  abstract runFileName: string[]
  abstract installerPath: string
  abstract instalationPath: string
  abstract getCacheDirs(): string[]
  abstract install(): Promise<void>

  async updatePath(): Promise<void> {
    for (const element of this.runFileName) {
      const pattern = `${this.cache_[0]}/**/${element}`
      core.info(pattern)
      const globber = await glob.create(pattern)
      for await (const file of globber.globGenerator()) {
        core.info(`add to PATH ${path.dirname(file)} (${file}) `)
        core.addPath(path.dirname(file))
      }
    }
  }

  protected async handleLoadedCache(): Promise<void> {
    await this.updatePath()
  }

  async restoreCache(): Promise<string | undefined> {
    const primaryKey = this.computeKey()

    const matchedKey = await restoreCasheByPrimaryKey(this.cache_, primaryKey)

    await this.handleLoadedCache()
    await this.handleMatchResult(matchedKey, primaryKey)

    return matchedKey
  }

  computeKey(): string {
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
      core.info(`Trying to save: ${this.cache_.slice().toString()}`)
      await cache.saveCache(this.cache_.slice(), this.computeKey())
    } catch (error) {
      if (error instanceof Error) core.info(error.message)
    }
  }

  protected isWindows(): boolean {
    return PLATFORM_WIN === this.platform;
  }

  protected isMac(): boolean {
    return PLATFORM_MAC === this.platform;
  }

  protected isLinux(): boolean {
    return PLATFORM_LIN === this.platform;
  }

  protected getOnegetPlatform(): String {

    switch (this.platform) {
      case PLATFORM_WIN: {
        return 'win';
      }
      case PLATFORM_MAC: {
        return 'mac';
      }
      case PLATFORM_LIN: {
        return 'linux';
      }
      default: {
        core.setFailed("Unrecognized os " + this.platform)
        return ''
      }
    }
  }
}

class OnecPlatform extends OnecTool {
  runFileName = ['ibcmd', 'ibcmd.exe']
  CACHE_PRIMARY_KEY = 'onec'
  version: string
  cache_: string[]
  platform: string
  installerPath = ''
  instalationPath = ''

  constructor(version: string, platform: string) {
    super()
    this.version = version
    this.platform = platform
    this.cache_ = this.getCacheDirs()
  }

  async install(): Promise<void> {
    const installerPattern = 'setup-full'
    const onegetPlatform = this.getOnegetPlatform();
    
    let filter;
    
    core.debug(`isWindows: ${this.isWindows()}`);
    core.debug(`isLinux: ${this.isLinux()}`);
    core.debug(`isMac: ${this.isMac()}`);

    if(this.isWindows()) {
      filter = 'windows64full';
    } else if(this.isLinux()) {
      filter = 'server64_8';
    }

    try {
      await exec('oneget', [
        'get',
        '--extract',
        '--filter',
        'platform=${filter}',
        `platform:${onegetPlatform}.full.x64@${this.version}`
      ])
    } catch (error) {
      if (error instanceof Error) core.info(error.message)
    }

    core.info(`onec was downloaded`)

    const patterns = [`**/${installerPattern}*`]
    const globber = await glob.create(patterns.join('\n'))
    const files = await globber.glob()

    core.info(`found ${files}`)

    const install_arg = [
      '--mode',
      'unattended',
      '--enable-components',
      'server,client_full',
      '--disable-components',
      'client_thin,client_thin_fib,ws'
    ]
    
    if(this.isLinux()) {
      await exec('sudo', [files[0], ...install_arg])
    } else if(this.isWindows()){
      await exec(files[0], install_arg)
    } else {
      core.setFailed("Unrecognized os " + this.platform)
    }
  }

  getCacheDirs(): string[] {
    switch (this.platform) {
      case PLATFORM_WIN: {
        return ['C:/Program Files/1cv8']
      }
      case PLATFORM_MAC: {
        return ['/opt/1cv8'] // /Applications/1cv8.localized/8.3.21.1644/ but only .app
      }
      case PLATFORM_LIN: {
        return ['/opt/1cv8']
      }
      default: {
        throw new Error('Not supported on this OS type')
      }
    }
  }
}

class OneGet extends OnecTool {
  runFileName = ['oneget']
  CACHE_PRIMARY_KEY = 'oneget'
  version: string
  cache_: string[]
  platform: string
  installerPath = ''
  instalationPath = ''
  constructor(version: string, platform: string) {
    super()
    this.version = version
    this.platform = platform
    this.cache_ = this.getCacheDirs()
  }
  async install(): Promise<void> {
    let extension
    let platform
    if (this.isWindows()) {
      platform = 'windows'
      extension = 'zip'
    } else if (this.isLinux()) {
      platform = 'linux'
      extension = 'tar.gz'
    } else if (this.isMac()) {
      platform = 'darwin'
      extension = 'tar.gz'
    }
    const archivePath = `/tmp/oneget.${extension}`
    await io.rmRF(archivePath)

    const onegetPath = await tc.downloadTool(
      `https://github.com/v8platform/oneget/releases/download/v${this.version}/oneget_${platform}_x86_64.${extension}`,
      `${archivePath}`
    )
    core.info(`oneget was downloaded`)

    let oneGetFolder
    if (this.isWindows()) {
      oneGetFolder = await tc.extractZip(onegetPath, this.cache_[0])
    } else {
      oneGetFolder = await tc.extractTar(onegetPath, this.cache_[0])
    }
    core.info(`oneget was extracted ${oneGetFolder} -> ${this.cache_[0]}`)

    core.addPath(this.cache_[0])
    if (!this.isWindows()) {
      await exec('chmod', ['+x', `${this.cache_[0]}/oneget`])
    }
  }

  getCacheDirs(): string[] {
    return ['/tmp/oneget']
  }
}
class EDT extends OnecTool {
  runFileName = ['ring', 'ring.bat', '1cedtcli.bat', '1cedtcli.sh']
  CACHE_PRIMARY_KEY = 'edt'
  version: string
  cache_: string[]
  platform: string
  installerPath = ''
  instalationPath = ''
  constructor(version: string, platform: string) {
    super()
    this.version = version
    this.platform = platform
    this.cache_ = this.getCacheDirs()
  }

  async install(): Promise<void> {
    let installerPattern

    if (this.isWindows()) {
      installerPattern = '1ce-installer-cli.exe'
    } else {
      installerPattern = '1ce-installer-cli'
    }

    const onegetPlatform = this.getOnegetPlatform();

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
    if (this.isWindows()) {
      const pattern = `**/1c_edt_distr_offline*.zip`
      core.info(pattern)
      const globber = await glob.create(pattern)
      for await (const file of globber.globGenerator()) {
        await tc.extractZip(file)
      }
    }
    const patterns = [`**/${installerPattern}`]
    const globber = await glob.create(patterns.join('\n'))
    const files = await globber.glob()

    core.info(`finded ${files}`)

    const install_arg = [
      'install',
      '--ignore-hardware-checks',
      '--ignore-signature-warnings'
    ]

    if(this.isLinux()) {
      await exec('sudo', [files[0], ...install_arg])
    } else if(this.isWindows()){
      await exec(files[0], install_arg)
    } else {
      core.setFailed("Unrecognized os " + this.platform)
    }
  }
  getCacheDirs(): string[] {
    switch (this.platform) {
      case PLATFORM_WIN: {
        return ['C:/Program Files/1C']
      }
      case PLATFORM_MAC: {
        return ['/Applications/1C']
      }
      case PLATFORM_LIN: {
        return ['/opt/1C']
      }
      default: {
        throw new Error('Not supported on this OS type')
      }
    }
  }
}

export async function run(): Promise<void> {
  const type = core.getInput('type')
  const edt_version = core.getInput('edt_version')
  const onec_version = core.getInput('onec_version')
  const onegetVersion = core.getInput('oneget_version')

  const useCache = core.getBooleanInput('cache') && isCacheFeatureAvailable()
  const useCacheDistr =
    core.getBooleanInput('cache_distr') && isCacheFeatureAvailable()
  let installer: OnecTool

  if (useCache && useCacheDistr) {
    throw new Error('only one cache type allowed')
  }

  if (type === 'edt') {
    installer = new EDT(edt_version, process.platform)
  } else if (type === 'onec') {
    installer = new OnecPlatform(onec_version, process.platform)
  } else {
    throw new Error('failed to recognize the installer type')
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
    await installer.updatePath()

    if (useCache) {
      await installer.saveCache()
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
