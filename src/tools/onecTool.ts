import { isWindows, isLinux, isMac, getPlatformType } from '../platform'

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

  getInstallersPath(): string {
    return `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}`
  }

  computeInstalledKey(): string {
    return `${this.CACHE_KEY_PREFIX}--${this.INSTALLED_CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`
  }

  computeInstallerKey(): string {
    return `${this.CACHE_KEY_PREFIX}--${this.INSTALLER_CACHE_PRIMARY_KEY}--${this.INSTALLED_CACHE_PRIMARY_KEY}--${this.version}--${this.platform}`
  }

  protected isWindows(): boolean {
    return isWindows()
  }

  protected isMac(): boolean {
    return isMac()
  }

  protected isLinux(): boolean {
    return isLinux()
  }

  protected getPlatformType() {
    return getPlatformType()
  }
}
