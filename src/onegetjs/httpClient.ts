import * as core from '@actions/core'
import got, { Got, Response } from 'got'
import { CookieJar } from 'tough-cookie'

export class HttpClient {
  private client: Got
  private jar: CookieJar

  constructor() {
    this.jar = new CookieJar()

    this.client = got.extend({
      timeout: { request: 30000 },
      followRedirect: true,
      maxRedirects: 10,
      cookieJar: this.jar,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      hooks: {
        beforeRequest: [
          options => {
            core.debug(`Request [${options.method}] ${options.url}`)
          }
        ],
        afterResponse: [
          response => {
            core.debug(
              `Response [${response.statusCode}] ${response.requestUrl}`
            )
            if (response.redirectUrls.length > 0) {
              core.debug(`Redirects: ${response.redirectUrls.join(' -> ')}`)
            }
            return response
          }
        ],
        beforeError: [
          error => {
            core.error(`Request failed: ${error.message}`)
            return error
          }
        ]
      }
    })
  }

  async get(
    url: string,
    options?: any
  ): Promise<{ data: any; request: any; status: number; headers?: any }> {
    if (options?.isStream) {
      // For streams, return the stream directly with extended timeout
      const stream = this.client.stream.get(url, {
        timeout: { request: 300000 } // 5 minutes for large files
      })
      return new Promise((resolve, reject) => {
        stream.on('response', (response: Response) => {
          resolve({
            data: stream,
            request: { res: { responseUrl: response.url } },
            status: response.statusCode,
            headers: response.headers
          })
        })
        stream.on('error', reject)
      })
    }

    const response = await this.client.get(url, options)
    return {
      data: response.body,
      request: { res: { responseUrl: response.url } },
      status: response.statusCode,
      headers: response.headers
    }
  }

  async post(
    url: string,
    data: any,
    config: any = {}
  ): Promise<{ data: any; request: any; status: number; headers?: any }> {
    const isJson =
      typeof data === 'object' &&
      config.headers?.['Content-Type'] === 'application/json'

    try {
      const response = await this.client.post(url, {
        body: isJson ? undefined : data,
        json: isJson ? data : undefined,
        headers: config.headers,
        followRedirect: config.followRedirect !== false,
        methodRewriting: true,
        http2: false,
        throwHttpErrors: false
      })
      return {
        data: response.body,
        request: { res: { responseUrl: response.url } },
        status: response.statusCode,
        headers: response.headers
      }
    } catch (error: any) {
      // Если это редирект и followRedirect=false, возвращаем информацию о редиректе
      if (error.response) {
        return {
          data: error.response.body,
          request: { res: { responseUrl: error.response.url } },
          status: error.response.statusCode,
          headers: error.response.headers
        }
      }
      throw error
    }
  }

  async getText(url: string): Promise<string> {
    const response = await this.get(url)
    return response.data
  }

  getCookies(url: string): string {
    return this.jar.getCookieStringSync(url || 'https://releases.1c.ru')
  }
}
