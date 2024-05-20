import {
  ReleaseFile,
  Version,
  ReleaseDescription,
  ArtifactFilter
} from './model'
import { Client } from './downloader'
import * as parser from './parse'
import * as core from '@actions/core'
import * as filter from './filter'
import process from 'process'
import path from 'path'
import * as io from '@actions/io'
import { unpackFiles } from '../unpacker'

export default class OneGet {
  client: Client
  downloadTo: string
  constructor(downloadTo: string) {
    const login = process.env.ONEC_USERNAME ?? ''
    const password = process.env.ONEC_PASSWORD ?? ''
    this.client = new Client(login, password)
    this.downloadTo = downloadTo
  }

  async auth(): Promise<void> {
    await this.client.auth()
  }
  // https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.10.2580&path=Platform%255c8_3_10_2580%255cclient.deb64.tar.gz
  // https://releases.1c.ru/version_file?nick=Platform83&ver=8.3.10.2580&path=Platform%5c8_3_10_2580%5cclient.deb64.tar.gz
  async download(
    version: Version,
    artifactFilter: ArtifactFilter
  ): Promise<string[]> {
    const filters = filter.getFilters(artifactFilter)
    const files = filter.filter(version.files, filters)

    if (files.length === 0) {
      error(`Found't files for version ${JSON.stringify(artifactFilter)}`)
    }

    core.debug(`Files for downloading ${JSON.stringify(files)}`)

    const downloadedFiles: string[] = []

    for (const file of files) {
      core.info(`Downloading ${file.name}`)

      core.debug(`Get artifact download page: ${file.name}`)
      const links = parser.fileDownloadLinks(
        await this.client.getText(file.url)
      )

      if (links.length === 0) {
        core.error(`Don't found links for file ${file.name}`)
        continue
      }

      for (const link of links) {
        const location = await this.client.downloadFile(link, this.downloadTo)
        if (location !== undefined) {
          downloadedFiles.push(location)
          break
        }
      }
    }

    return downloadedFiles
  }

  async versionInfo(project: string, version: string): Promise<Version> {
    core.debug(`Get project page for: ${project}`)
    const page = await this.client.projectPage(project)
    const versions = parser.versions(page)
    const filteredVersions = versions.filter(v => v.name === version)

    if (filteredVersions.length === 0) {
      error(`Version ${version} for ${project} not found`)
    }

    const versionInfo = filteredVersions[0]
    core.debug(`Version info: ${JSON.stringify(versionInfo)}`)

    versionInfo.files = await this.versionFiles(versionInfo)
    core.debug(`Version files: ${JSON.stringify(versionInfo.files)}`)
    return versionInfo
  }

  async versionFiles(version: Version): Promise<ReleaseFile[]> {
    core.debug(`Get project version page for: ${version.name}`)

    const page = await this.client.getText(version.url)
    return parser.releaseFiles(page)
  }
}

export async function downloadRelease(
  release: ReleaseDescription,
  destination: string,
  unpack = false
): Promise<void> {
  const downloadDestination = unpack
    ? path.resolve('tmp', '__downloads__')
    : destination

  io.mkdirP(downloadDestination)
  io.mkdirP(destination)

  const oneGet = new OneGet(downloadDestination)
  await oneGet.auth()
  const version = await oneGet.versionInfo(release.project, release.version)
  const artifacts = await oneGet.download(version, release)

  if (unpack) {
    await unpackFiles(artifacts, destination)
  }
}

function error(message: string): void {
  core.error(message)
  throw message
}
