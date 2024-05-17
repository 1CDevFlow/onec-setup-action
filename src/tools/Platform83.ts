import { OnecTool } from './OnecTool'
import * as core from '@actions/core'
import { exec } from '@actions/exec'
import OneGet from '../onegetjs'

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

        let filter

        core.debug(`isWindows: ${this.isWindows()}`)
        core.debug(`isLinux: ${this.isLinux()}`)
        core.debug(`isMac: ${this.isMac()}`)

        if (this.isWindows()) {
            filter = 'windows64full_8'
        } else if (this.isLinux()) {
            filter = 'server64_8'
        }

        try {
            await exec('oneget', [
                'get',
                '--path',
                `/tmp/${this.INSTALLER_CACHE_PRIMARY_KEY}`,
                '--extract',
                '--filter',
                `platform=${filter}`,
                `platform:${onegetPlatform}.full.x64@${this.version}`
            ])
        } catch (error) {
            if (error instanceof Error) core.info(error.message)
        }

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
            return ['ibcmd.exe']
        } else {
            return ['ibcmd']
        }
    }
}
