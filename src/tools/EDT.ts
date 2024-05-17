import { OnecTool } from './OnecTool'
import * as core from '@actions/core'
import { exec } from '@actions/exec'
import * as glob from '@actions/glob'
import * as tc from '@actions/tool-cache'
import { downloadRelease } from '../onegetjs'

export class EDT extends OnecTool {
  INSTALLED_CACHE_PRIMARY_KEY = 'edt'
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
    const onegetPlatform = this.getOnegetPlatform()

    await downloadRelease(
      {
        project: 'DevelopmentTools10',
        version: this.version,
        osName: onegetPlatform,
        offline: true
      },
      `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}`,
      true
    )
  }

  async install(): Promise<void> {
    let installerPattern

    if (this.isWindows()) {
      installerPattern = '1ce-installer-cli.exe'
    } else {
      installerPattern = '1ce-installer-cli'
    }

    if (this.isWindows()) {
      const pattern = `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}/**/1c_edt_distr_offline*.zip`
      core.info(pattern)
      const globber = await glob.create(pattern)
      for await (const file of globber.globGenerator()) {
        await tc.extractZip(file)
      }
    }
    const patterns = [
      `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}/**/${installerPattern}`
    ]
    const globber = await glob.create(patterns.join('\n'))
    const files = await globber.glob()

    core.info(`finded ${files}`)

    const install_arg = [
      'install',
      '--ignore-hardware-checks',
      '--ignore-signature-warnings'
    ]

    if (this.isLinux()) {
      await exec('sudo', [files[0], ...install_arg])
    } else if (this.isWindows()) {
      await exec(files[0], install_arg)
    } else {
      core.setFailed(`Unrecognized os${this.platform}`)
    }
  }

  getCacheDirs(): string[] {
    if (this.isWindows()) {
      return ['C:/Program Files/1C']
    } else if (this.isLinux()) {
      return ['/opt/1C']
    } else if (this.isMac()) {
      return ['/Applications/1C']
    } else {
      throw new Error('Not supported on this OS type')
    }
  }

  getRunFileNames(): string[] {
    if (this.isWindows()) {
      return ['ring.bat', '1cedtcli.bat']
    } else {
      return ['ring', '1cedtcli.sh']
    }
  }
}
