import { OnecTool } from './onecTool'
import * as core from '@actions/core'
import { exec } from '@actions/exec'
import { downloadRelease } from '../onegetjs'
import * as glob from '@actions/glob'
import { compareVersions } from 'compare-versions'
import { DistributiveType } from 'src/onegetjs/model'

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

  useNewInstaller(): boolean {
    return compareVersions(this.version, '8.3.20') >= 0
  }

  async download(): Promise<void> {
    let platformType = this.getPlatformType()

    let installerType: DistributiveType = 'full'

    if (platformType == 'linux' && !this.useNewInstaller()) {
      installerType = 'clientOrServer'
      platformType = 'deb'
    }

    await downloadRelease(
      {
        project: 'Platform83',
        version: this.version,
        osName: platformType,
        architecture: 'x64',
        type: installerType
      },
      this.getInstallersPath(),
      true
    )

    core.info(`onec was downloaded`)
  }

  async install(): Promise<void> {
    const installerPattern = this.isWindows()
      ? 'setup.exe'
      : this.useNewInstaller()
        ? 'setup-full'
        : '*.deb'

    const path = this.getInstallersPath()

    const globber = await glob.create(`${path}/**/${installerPattern}*`)
    const files = await globber.glob()
    core.info(`found ${files}`)

    if (this.isLinux() && this.useNewInstaller()) {
      await exec('sudo', [
        files[0],
        '--mode',
        'unattended',
        '--enable-components',
        'server,client_full',
        '--disable-components',
        'client_thin,client_thin_fib,ws'
      ])
    } else if (this.isLinux()) {
      for await (const mask of ['common', 'server', 'thin-client', 'client']) {
        const files = await (
          await glob.create(`${path}/1c-enterprise83-${mask}_*.deb`)
        ).glob()

        if (files.length !== 0) {
          await exec('sudo', ['dpkg', '-i', '--force-all', `${files[0]}`])
        } else {
          core.warning(
            `File not found for ${mask} (mask: 1c-enterprise83-${mask}_*.deb)`
          )
        }
      }
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
