import * as core from '@actions/core'
import { HttpClient } from './httpClient'
import { AuthProvider, AuthProviderType, AuthProviderFactory } from './auth'
import * as fs from 'fs'
import * as path from 'path'

const RELEASES_URL = 'https://releases.1c.ru'
const PROJECTS_URL = '/project/'

export class Client {
  login: string
  password: string
  httpClient: HttpClient
  private authProvider: AuthProvider

  constructor(
    login: string,
    password: string,
    config?: { preferredProvider?: AuthProviderType }
  ) {
    if (!login || !password) {
      const err = new Error('Do not set login or/and password')
      core.setFailed(err)
      throw err
    }
    this.login = login
    this.password = password
    this.httpClient = new HttpClient()

    // Создаем провайдер через фабрику
    this.authProvider = AuthProviderFactory.create({
      username: login,
      password: password,
      preferredProvider: config?.preferredProvider
    })
  }

  async auth(): Promise<void> {
    await this.authProvider.authenticate()
  }

  async getText(url: string): Promise<string> {
    const fullURL = new URL(url, RELEASES_URL)
    const response = await this.get(fullURL.toString())
    return response.data
  }

  async get(url: string): Promise<any> {
    return this.authProvider.get(url)
  }

  checkResponseError(response: any): void {
    if (response.status >= 400) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  extractFileName(url: string, headers?: any): string | undefined {
    // Try to extract from Content-Disposition header
    if (headers?.['content-disposition']) {
      const match = headers['content-disposition'].match(
        /filename[^;=\n]*=(['"]?)([^'"\n]*)\1/
      )
      if (match && match[2]) {
        return match[2]
      }
    }

    // Fallback to URL parsing
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const fileName = pathParts[pathParts.length - 1]
    return fileName || undefined
  }

  async downloadFile(url: string, output: string): Promise<string | undefined> {
    core.info(`Download ${url} to ${output}`)

    // First request to get headers and filename
    const headResponse = await this.get(url)
    const fileName = this.extractFileName(url, headResponse.headers)

    if (!fileName) {
      return undefined
    }
    const fullFileName = path.resolve(output, fileName)

    try {
      if (fs.statSync(fullFileName).isFile()) {
        core.info(`${fileName} (${fullFileName}) already exist`)
        return fullFileName
      }
    } catch {
      /* empty */
    }

    // Second request to download the file as stream
    const streamResponse = await this.authProvider.get(url, {
      responseType: 'stream',
      isStream: true
    })
    const destination = fs.createWriteStream(fullFileName, { flags: 'wx' })

    await new Promise((resolve, reject) => {
      streamResponse.data.pipe(destination)
      streamResponse.data.on('error', reject)
      destination.on('finish', () => resolve(undefined))
    })

    core.info('Downloaded')
    return fullFileName
  }

  async projectPage(project: string): Promise<string> {
    return await this.getText(`${PROJECTS_URL}${project}?allUpdates=true`)
  }
}
