import { OnecTool } from './onecTool'
import * as core from '@actions/core'
import { exec } from '@actions/exec'
import { downloadRelease } from '../onegetjs'
import * as glob from '@actions/glob'

export class Platform83 extends OnecTool {
  INSTALLED_CACHE_PRIMARY_KEY = 'onec'
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
        project: 'Platform83',
        version: this.version,
        osName: onegetPlatform,
        architecture: 'x64',
        type: 'full'
      },
      `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}`,
      true
    )

    core.info(`onec was downloaded`)
  }

  async install(): Promise<void> {
    const installerPattern = this.isWindows() ? 'setup.exe' : 'setup-full'

    const patterns = [
      `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}/**/${installerPattern}*`
    ]
    const globber = await glob.create(patterns.join('\n'))
    const files = await globber.glob()

    core.info(`found ${files}`)

    if (this.isLinux()) {
      await exec('sudo', [
        files[0],
        '--mode',
        'unattended',
        '--enable-components',
        'server,client_full',
        '--disable-components',
        'client_thin,client_thin_fib,ws'
      ])
    } else if (this.isWindows()) {
      await exec(files[0], [
        '/l',
        'ru',
        '/S',
        'server=1',
        'thinclient=1',
        'RU=1',
        'EN=1',
        'LANGUAGES=RU,EN',
        '/quiet',
        '/qn',
        'INSTALLSRVRASSRVC=0',
        '/norestart'
      ])
    } else {
      core.setFailed(`Unrecognized os ${this.platform}`)
    }
  }

  getCacheDirs(): string[] {
    if (this.isWindows()) {
      return ['C:/Program Files/1cv8']
    } else if (this.isLinux()) {
      return ['/opt/1cv8']
    } else if (this.isMac()) {
      return ['/opt/1cv8'] // /Applications/1cv8.localized/8.3.21.1644/ but only .app
    } else {
      throw new Error('Not supported on this OS type')
    }
  }

  getRunFileNames(): string[] {
    if (this.isWindows()) {
      return ['1cv8.exe']
    } else {
      return ['1cv8']
    }
  }
}
