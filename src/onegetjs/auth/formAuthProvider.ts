import * as core from '@actions/core'
import { parse } from 'node-html-parser'
import { HttpClient } from '../httpClient'
import { AuthProvider } from './authProvider'
import { URLSearchParams } from 'url'

const RELEASES_URL = 'https://releases.1c.ru'

export class FormAuthProvider implements AuthProvider {
  private httpClient: HttpClient

  constructor(
    private username: string,
    private password: string
  ) {
    this.httpClient = new HttpClient()
  }

  async authenticate(): Promise<void> {
    try {
      // 1. Загружаем начальную страницу
      const response = await this.httpClient.get(RELEASES_URL)
      const html = response.data

      // 2. Парсим форму аутентификации
      const root = parse(html)
      const form = root.querySelector('form')
      if (!form) {
        throw new Error('Authentication form not found')
      }

      // 3. Извлекаем все input поля
      const inputs = form.querySelectorAll('input')
      const formData: Record<string, string> = {}

      inputs.forEach(input => {
        const name = input.getAttribute('name')
        const value = input.getAttribute('value')
        const type = input.getAttribute('type')
        if (name) {
          // Для чекбоксов: не добавляем поле, если значение пустое
          if (type === 'checkbox' && !value) {
            return
          }
          formData[name] = value || ''
        }
      })

      // 4. Устанавливаем username и password
      formData['username'] = this.username
      formData['password'] = this.password

      // 5. Получаем URL формы
      const formAction = form.getAttribute('action') || ''
      const formUrl = new URL(
        formAction,
        response.request.res?.responseUrl || RELEASES_URL
      ).toString()

      const formBody = new URLSearchParams(formData).toString()

      // 6. Отправляем форму
      const postResponse = await this.httpClient.post(formUrl, formBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: response.request.res?.responseUrl || RELEASES_URL,
          Accept: '*/*'
        }
      })

      // 7. Проверяем успешность аутентификации
      const testResponse = await this.httpClient.get(RELEASES_URL)
      const finalUrl = testResponse.request.res?.responseUrl || ''

      // Проверяем, что мы не на странице логина
      if (finalUrl.includes('/login')) {
        throw new Error(
          `Form authentication failed - still on login page. Final URL: ${finalUrl}`
        )
      }

      core.debug('Form authentication completed')
    } catch (error) {
      core.error(`Form authentication failed: ${error}`)
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
}
