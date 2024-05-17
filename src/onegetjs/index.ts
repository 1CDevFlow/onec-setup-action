import { ReleaseFile, Version, OSName, ArchitectureName, DistributiveType } from "./model";
import { Client } from "./downloader";
import * as parser from './parse'
import * as core from '@actions/core'
import * as filter from './filter'

export class OneGet {
    client: Client
    downloadTo: string
    constructor(login: string, password: string, downloadTo: string) {
        this.client = new Client(login, password)
        this.downloadTo = downloadTo
    }

    async auth() {
        await this.client.auth()
    }
    // https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.10.2580&path=Platform%255c8_3_10_2580%255cclient.deb64.tar.gz
    // https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.10.2580&path=Platform%5c8_3_10_2580%5cclient.deb64.tar.gz
    async download(version: Version, osName: OSName, architecture: ArchitectureName, type: DistributiveType): Promise<string[]> {
        let filters = filter.getFilters(osName, architecture, type)
        let files = filter.filter(version.files, filters)

        if (files.length == 0) {
            error(`Found't files for version ${version.name} for ${osName} ${architecture} ${type}`)
        }

        core.debug('Files for downloading ' + JSON.stringify(files))

        let downloadedFiles: string[] = []
        for (let index = 0; index < files.length; index++) {
            const file = files[index];

            core.info(`Downloading ${file.name}`)
            
            const links = parser.fileDownloadLinks(await this.client.getText(file.url))

            if (links.length === 0) {
                core.error(`Don't found links for file ${file.name}`)
                continue;
            }

            for (let l = 0; l < links.length; l++) {
                const location = await this.client.downloadFile(links[l], this.downloadTo)
                if (location !== undefined) {
                    downloadedFiles.push(location)
                    break
                }
            }
        }

        return downloadedFiles
    }


    async versionInfo(project: string, version: string): Promise<Version> {
        let page = await this.client.projectPage(project)
        let versions = parser.versions(page)
        let filteredVersions = versions.filter(v => v.name === version)

        if (filteredVersions.length === 0) {
            error(`Version ${version} for ${project} not found`)
        }

        let versionInfo = filteredVersions[0];
        core.debug('Version info: ' + JSON.stringify(versionInfo))

        versionInfo.files = await this.versionFiles(versionInfo)
        core.debug('Version files: ' + JSON.stringify(versionInfo.files))
        return versionInfo
    }

    async versionFiles(version: Version): Promise<ReleaseFile[]> {
        const page = await this.client.getText(version.url)
        return parser.releaseFiles(page)
    }
}

function error(message: string) {
    core.error(message)
    throw message
}
