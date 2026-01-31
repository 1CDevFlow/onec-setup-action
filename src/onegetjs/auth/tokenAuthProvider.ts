import * as core from '@actions/core'
import { HttpClient } from '../httpClient'
import { AuthProvider } from './authProvider'

const LOGIN_URL = 'https://login.1c.ru'
const TICKET_URL = `${LOGIN_URL}/rest/public/ticket/get`
const RELEASES_URL = 'https://releases.1c.ru'
// https://login.1c.ru/api/public/ticket?wsdl
const AUTH_URL = `${LOGIN_URL}/rest/public/user/auth`

export class TokenAuthProvider implements AuthProvider {
  private httpClient: HttpClient

  constructor(
    private username: string,
    private password: string
  ) {
    this.httpClient = new HttpClient()
  }

  async authenticate(): Promise<void> {
    try {
      const continueURL = await this.getAuthToken()
      const response = await this.httpClient.get(continueURL)

      if (response.status !== 200) {
        throw new Error(`Auth failed with status ${response.status}`)
      }

      const testResponse = await this.httpClient.get(RELEASES_URL)
      const testHtml = testResponse.data

      if (testHtml.includes('Личные данные') || testHtml.includes('Войти')) {
        throw new Error(
          'Authentication verification failed - still getting login page'
        )
      }

      core.debug('Token authentication successful')
    } catch (error) {
      core.error(`Token authentication failed: ${error}`)
      throw error
    }
  }

  async get(
    url: string,
    options?: any
  ): Promise<{ data: any; request: any; status: number; headers?: any }> {
    return this.httpClient.get(url, options)
  }

  getCookies(): string {
    return this.httpClient.getCookies('')
  }

  private async getAuthToken(url: string = RELEASES_URL): Promise<string> {
    core.debug('Authorization')
    const body = {
      login: this.username,
      password: this.password,
      serviceNick: url
    }

    const response = await this.httpClient.post(TICKET_URL, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.checkResponseError(response)
    const data =
      typeof response.data === 'string'
        ? JSON.parse(response.data)
        : response.data
    return `${LOGIN_URL}/ticket/auth?token=${data.ticket}`
  }

  private checkResponseError(response: any): void {
    if (response.status >= 400) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }
}
