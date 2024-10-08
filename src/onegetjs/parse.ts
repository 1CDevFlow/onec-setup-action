import { parse } from 'node-html-parser'
import { ReleaseFile, Version } from './model'

const PROJECT_VERSIONS_SELECTOR = 'td.versionColumn>a'
const RELEASE_FILES_SELECTOR = '.files-container .formLine a'
const DOWNLOAD_LINK_SELECTOR = '.downloadDist a'

export function versions(content: string): Version[] {
  const root = parse(content)
  const cells = root.querySelectorAll(PROJECT_VERSIONS_SELECTOR)
  return cells.map(
    cell =>
      ({
        name: cell.text.trim(),
        url: cell.getAttribute('href')
      }) as Version
  )
}

export function releaseFiles(content: string): ReleaseFile[] {
  const root = parse(content)
  const cells = root.querySelectorAll(RELEASE_FILES_SELECTOR)
  return cells.map(
    cell =>
      ({
        name: cell.text.trim(),
        url: cell.getAttribute('href')
      }) as ReleaseFile
  )
}

export function fileDownloadLinks(content: string): string[] {
  const root = parse(content)
  const cells = root.querySelectorAll(DOWNLOAD_LINK_SELECTOR)
  return cells
    .map(a => a.getAttribute('href'))
    .filter((v): v is string => v !== null && v !== undefined)
}
