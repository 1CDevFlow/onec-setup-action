import {
  ReleaseFile,
  Version,
  ReleaseDescription,
  ArtifactFilter
} from './model'
import { Client } from './downloader'
import * as parser from './parse'
import * as filter from './filter'
import process from 'process'
import path from 'path'
import * as io from '@actions/io'
import { unpackFiles } from '../unpacker'
import { logger } from './logger'

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

  async download(
    version: Version,
    artifactFilter: ArtifactFilter
  ): Promise<string[]> {
    const filters = filter.getFilters(artifactFilter)
    const files = filter.filter(version.files, filters)

    if (files.length === 0) {
      this.error(`No files found for version ${JSON.stringify(artifactFilter)}`)
    }

    logger.debug(`Files for downloading ${JSON.stringify(files)}`)

    const downloadedFiles: string[] = []

    for (const file of files) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        logger.info(`Downloading ${file.name}`)

        logger.debug(`Get artifact download page: ${file.name}`)
        const links = parser.fileDownloadLinks(
          await this.client.getText(file.url)
        )

        if (links.length === 0) {
          logger.error(`Don't found links for file ${file.name}`)
          continue
        }

        for (const link of links) {
          const location = await this.client.downloadFile(link, this.downloadTo)
          if (location !== undefined) {
            downloadedFiles.push(location)
            break
          }
        }
        break
      }
    }

    return downloadedFiles
  }

  async versionInfo(project: string, version: string): Promise<Version> {
    logger.debug(`Get project page for: ${project}`)
    try {
      const page = await this.client.projectPage(project)

      const versions = parser.versions(page)
      logger.debug(
        `Found ${versions.length} versions: ${versions
          .map(v => v.name)
          .slice(0, 5)
          .join(', ')}`
      )

      const filteredVersions = versions.filter(v => v.name === version)

      if (filteredVersions.length === 0) {
        // Если версия не найдена, попробуем найти похожие
        const similarVersions = versions.filter(v =>
          v.name.includes(version.split('.').slice(0, 2).join('.'))
        )
        if (similarVersions.length > 0) {
          logger.error(
            `Version ${version} not found, but found similar: ${similarVersions.map(v => v.name).join(', ')}`
          )
        }
        this.error(`Version ${version} for ${project} not found`)
      }

      const versionInfo = filteredVersions[0]
      logger.debug(`Version info: ${JSON.stringify(versionInfo)}`)

      versionInfo.files = await this.versionFiles(versionInfo)
      logger.debug(`Version files: ${JSON.stringify(versionInfo.files)}`)
      return versionInfo
    } catch (err) {
      logger.error(
        `Failed to get version info for ${project} ${version}: ${err}`
      )
      throw err
    }
  }

  async versionFiles(version: Version): Promise<ReleaseFile[]> {
    logger.debug(`Get project version page for: ${version.name}`)

    const page = await this.client.getText(version.url)
    return parser.releaseFiles(page)
  }

  private error(message: string): void {
    logger.error(message)
    throw new Error(message)
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
