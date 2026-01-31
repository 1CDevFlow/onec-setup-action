import { parse } from 'node-html-parser'
import { HttpClient } from '../httpClient'
import { AuthProvider } from './authProvider'
import { URLSearchParams } from 'url'
import { logger } from '../logger'

const RELEASES_URL = 'https://releases.1c.ru'

export class FormAuthProvider implements AuthProvider {
  constructor(
    private username: string,
    private password: string
  ) {}

  async authenticate(httpClient: HttpClient): Promise<void> {
    try {
      const response = await httpClient.get(RELEASES_URL)
      const html = response.data

      const root = parse(html)
      const form = root.querySelector('form')
      if (!form) {
        throw new Error('Authentication form not found')
      }

      const inputs = form.querySelectorAll('input')
      const formData: Record<string, string> = {}

      inputs.forEach(input => {
        const name = input.getAttribute('name')
        const value = input.getAttribute('value')
        const type = input.getAttribute('type')
        if (name) {
          if (type === 'checkbox' && !value) {
            return
          }
          formData[name] = value || ''
        }
      })

      formData['username'] = this.username
      formData['password'] = this.password

      const formAction = form.getAttribute('action') || ''
      const formUrl = new URL(
        formAction,
        response.request.res?.responseUrl || RELEASES_URL
      ).toString()

      const formBody = new URLSearchParams(formData).toString()

      await httpClient.post(formUrl, formBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: response.request.res?.responseUrl || RELEASES_URL,
          Accept: '*/*'
        }
      })

      const testResponse = await httpClient.get(RELEASES_URL)
      const finalUrl = testResponse.request.res?.responseUrl || ''

      if (finalUrl.includes('/login')) {
        throw new Error(
          `Form authentication failed - still on login page. Final URL: ${finalUrl}`
        )
      }

      logger.debug('Form authentication completed')
    } catch (error) {
      logger.error(`Form authentication failed: ${error}`)
      throw error
    }
  }
}
