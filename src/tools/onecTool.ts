import * as core from '@actions/core'
import { OSName } from '../onegetjs/model'
import * as cache from '@actions/cache'
import * as glob from '@actions/glob'
import path from 'path'
import { restoreCasheByPrimaryKey } from '../utils'

const PLATFORM_WIN = 'win32'
const PLATFORM_LIN = 'linux'
const PLATFORM_MAC = 'darwin'

interface IOnecTools {
  CACHE_KEY_PREFIX: string
  INSTALLED_CACHE_PRIMARY_KEY: string
  INSTALLER_CACHE_PRIMARY_KEY: string
  cache_: string[]
  version: string
  platform: string
  getCacheDirs(): string[]
}

export abstract class OnecTool implements IOnecTools {
  CACHE_KEY_PREFIX = 'setup'
  INSTALLER_CACHE_PRIMARY_KEY = 'installer'

  abstract INSTALLED_CACHE_PRIMARY_KEY: string
  abstract cache_: string[]
  abstract version: string
  abstract platform: string
  abstract getRunFileNames(): string[]
  abstract getCacheDirs(): string[]
  abstract install(): Promise<void>
  abstract download(): Promise<void>
  async updatePath(): Promise<void> {
    for (const element of this.getRunFileNames()) {
      const pattern = `${this.cache_[0]}/**/${element}`
      core.info(pattern)
      const globber = await glob.create(pattern)
      for await (const file of globber.globGenerator()) {
        core.info(`add to PATH ${path.dirname(file)} (${file}) `)
        core.addPath(path.dirname(file))
        break
      }
    }
  }

  protected async handleLoadedCache(): Promise<void> {
    await this.updatePath()
  }

  async restoreInstallationPackage(): Promise<string | undefined> {
    const primaryKey = this.computeInstallerKey()

    const restorePath = `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}`
    const matchedKey = await restoreCasheByPrimaryKey([restorePath], primaryKey)

    await this.handleLoadedCache()
    await this.handleMatchResult(matchedKey, primaryKey)

    return matchedKey
  }

  async restoreInstalledTool(): Promise<string | undefined> {
    const primaryKey = this.computeInstalledKey()

    const matchedKey = await restoreCasheByPrimaryKey(this.cache_, primaryKey)

    await this.handleLoadedCache()
    await this.handleMatchResult(matchedKey, primaryKey)

    return matchedKey
  }

  computeInstalledKey(): string {
    return `${this.CACHE_KEY_PREFIX}--${this.INSTALLED_CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`
  }

  computeInstallerKey(): string {
    return `${this.CACHE_KEY_PREFIX}--${this.INSTALLER_CACHE_PRIMARY_KEY}--${this.INSTALLED_CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`
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
  async saveInstallerCache(): Promise<void> {
    try {
      await cache.saveCache(
        [`/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}`],
        this.computeInstallerKey()
      )
    } catch (error) {
      if (error instanceof Error) core.info(error.message)
    }
  }

  async saveInstalledCache(): Promise<void> {
    try {
      core.info(`Trying to save: ${this.cache_.slice().toString()}`)
      await cache.saveCache(this.cache_.slice(), this.computeInstalledKey())
    } catch (error) {
      if (error instanceof Error) core.info(error.message)
    }
  }

  protected isWindows(): boolean {
    return PLATFORM_WIN === this.platform
  }

  protected isMac(): boolean {
    return PLATFORM_MAC === this.platform
  }

  protected isLinux(): boolean {
    return PLATFORM_LIN === this.platform
  }

  protected getOnegetPlatform(): OSName {
    switch (this.platform) {
      case PLATFORM_WIN: {
        return 'win'
      }
      case PLATFORM_MAC: {
        return 'mac'
      }
      case PLATFORM_LIN: {
        return 'linux'
      }
      default: {
        core.setFailed(`Unrecognized os ${this.platform}`)
        throw new Error(`Unrecognized os ${this.platform}`)
      }
    }
  }
}
