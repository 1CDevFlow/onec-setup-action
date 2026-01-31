import { HttpClient } from '../httpClient'
import { AuthProvider } from './authProvider'
import { logger } from '../logger'

const LOGIN_URL = 'https://login.1c.ru'
const TICKET_URL = `${LOGIN_URL}/rest/public/ticket/get`
const RELEASES_URL = 'https://releases.1c.ru'

export class TokenAuthProvider implements AuthProvider {
  constructor(
    private username: string,
    private password: string
  ) {}

  async authenticate(httpClient: HttpClient): Promise<void> {
    try {
      const continueURL = await this.getAuthToken(httpClient)
      const response = await httpClient.get(continueURL)

      if (response.status !== 200) {
        throw new Error(`Auth failed with status ${response.status}`)
      }

      const testResponse = await httpClient.get(RELEASES_URL)
      const finalUrl = testResponse.request.res?.responseUrl || ''

      if (finalUrl.includes('/login')) {
        throw new Error('Token authentication failed - still on login page')
      }

      logger.debug('Token authentication successful')
    } catch (error) {
      logger.error(`Token authentication failed: ${error}`)
      throw error
    }
  }

  private async getAuthToken(
    httpClient: HttpClient,
    url: string = RELEASES_URL
  ): Promise<string> {
    logger.debug('Authorization')
    const body = {
      login: this.username,
      password: this.password,
      serviceNick: url
    }

    const response = await httpClient.post(TICKET_URL, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.status >= 400) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data =
      typeof response.data === 'string'
        ? JSON.parse(response.data)
        : response.data

    if (!data.ticket) {
      throw new Error('No ticket received in authentication response')
    }

    return `${LOGIN_URL}/ticket/auth?token=${data.ticket}`
  }
}
