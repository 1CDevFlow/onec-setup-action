import { OnecTool } from './OnecTool'
import * as core from '@actions/core'
import { exec } from '@actions/exec'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'

class OneGet extends OnecTool {
    INSTALLED_CACHE_PRIMARY_KEY = 'oneget'
    version: string
    cache_: string[]
    platform: string
    constructor(version: string, platform: string) {
      super()
      this.version = version
      this.platform = platform
      this.cache_ = this.getCacheDirs()
    }
    async download(): Promise<void> {
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
      const installerPath = `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}`
      await io.rmRF(installerPath)
  
      const archivePath = `${installerPath}/oneget.${extension}`
  
      await tc.downloadTool(
        `https://github.com/v8platform/oneget/releases/download/v${this.version}/oneget_${platform}_x86_64.${extension}`,
        `${archivePath}`
      )
      core.info(`oneget was downloaded`)
    }
  
    async install(): Promise<void> {
      let extension
      if (this.isWindows()) {
        extension = 'zip'
      } else if (this.isLinux()) {
        extension = 'tar.gz'
      } else if (this.isMac()) {
        extension = 'tar.gz'
      }
      const onegetPath = `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}/oneget.${extension}`
  
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
  
    getRunFileNames(): string[] {``
      return ['oneget']
    }
  }
  