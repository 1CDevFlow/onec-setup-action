import { Response } from 'node-fetch'
import * as core from '@actions/core'
import { CookieJar } from 'cookiejar'
import request from './request'
import * as fs from 'fs'
import * as path from 'path'

const RELEASES_URL = 'https://releases.1c.ru'
const PROJECTS_URL = '/project/'
const LOGIN_URL = 'https://login.1c.ru'
const TICKET_URL = LOGIN_URL + '/rest/public/ticket/get'

export class Client {
  login: string
  password: string
  cookies: CookieJar
  ticket = ''

  constructor(login: string, password: string) {
    this.login = login
    this.password = password
    this.cookies = new CookieJar()
  }

  async auth(url: string = RELEASES_URL) {
    let continueURL = await this.getAuthToken()
    await request(continueURL, { cookie: this.cookies })
  }

  async getAuthToken(url: string = RELEASES_URL): Promise<string> {
    core.debug('Authorization')
    let body = {
      login: this.login,
      password: this.password,
      serviceNick: url
    }
    let response = await request(TICKET_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      cookie: this.cookies,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    this.checkResponseError(response)
    let data = await response.json()
    return `${LOGIN_URL}/ticket/auth?token=${data.ticket}`
  }

  async getText(url: string): Promise<string> {
    let fullURL = new URL(url, RELEASES_URL)
    let response = await this.get(fullURL.toString())
    return await response.text()
  }

  async get(url: string): Promise<Response> {
    let response = await request(url, { cookie: this.cookies })
    if (response.status === 401) {
      core.debug('Re-Authorization')
      let newURL = await this.getAuthToken(url)
      core.debug(`Request. [GET] ${newURL}`)
      response = await request(newURL, { cookie: this.cookies })
    }

    await this.checkResponseError(response)
    return await response
  }

  async downloadFile(url: string, output: string): Promise<string | undefined> {
    const fullURL = new URL(url, RELEASES_URL)
    const response = await this.get(fullURL.toString())
    const fileName = extractFileName(response)
    if (fileName === undefined) {
      core.error("Can't extract file name from response for " + url)
      return undefined
    }

    const fullFileName = path.resolve(output, fileName)
    try {
      if (fs.statSync(fullFileName).isFile()) {
        core.info(`${fileName} already exist`)
        return fullFileName
      }
    } catch {}

    core.info(`Downloading ${fileName}...`)

    const destination = fs.createWriteStream(fullFileName, { flags: 'wx' })
    await new Promise((resolve, reject) => {
      response.body.pipe(destination)
      response.body.on('error', reject)
      destination.on('finish', resolve)
    })
    core.info('Downloaded')
    return fullFileName
  }

  async projectPage(project: string): Promise<string> {
    return await this.getText(PROJECTS_URL + project + '?allUpdates=true')
  }

  async checkResponseError(response: Response) {
    if (response.status === 200) {
      return
    }
    let message = `Response error.
        Status: ${response.status} (${response.statusText})
        Body: ${await response.text()}`
    core.error(message)
    throw message
  }
}

function extractFileName(response: Response) {
  let header = response.headers.get('content-disposition')
  if (header === null) {
    return undefined
  }
  const prefix = 'filename='
  let filename = header.substring(header.indexOf(prefix) + prefix.length)
  if (filename[0] === '"' && filename[filename.length - 1] === '"') {
    filename = filename.substring(1, filename.length - 1)
  }
  return filename
}
