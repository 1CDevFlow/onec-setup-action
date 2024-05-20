import fetch, { RequestInit, Response } from 'node-fetch'
import { Cookie, CookieJar } from 'cookiejar'
import * as core from '@actions/core'

export interface RequestInit2 extends RequestInit {
  cookie?: CookieJar
}

export default async function request(
  urlString: string,
  init?: RequestInit2
): Promise<Response> {
  core.debug(`Request [${init?.method ?? 'GET'}] ${urlString}`)
  const url = new URL(urlString)

  const cookieJar = init?.cookie
  const cookieValue = cookieJar
    ?.getCookies({
      domain: url.host,
      path: url.pathname,
      secure: true,
      script: false
    })
    .map(c => c.toValueString())
    .join('; ')

  const fetchInit = init ?? {}
  if (cookieValue && fetchInit.headers === undefined) {
    fetchInit.headers = {
      cookie: cookieValue
    }
  }

  fetchInit.redirect = 'manual'
  const response = await fetch(urlString, fetchInit)
  parseCookies(response, cookieJar)

  if (isRedirect(response)) {
    const locationURL = new URL(
      response.headers.get('location') ?? '',
      response.url
    )
    core.debug(`Redirect to: ${locationURL}`)
    return await request(locationURL.toString(), {
      cookie: cookieJar
    })
  }

  return response
}

function isRedirect(response: Response): boolean {
  return response.status === 301 || response.status === 302
}

function cookieString(cookieJar: CookieJar, url: URL): string {
  return cookieJar
    ?.getCookies({
      domain: url.host,
      path: url.pathname,
      secure: true,
      script: false
    })
    .map(c => c.toString())
    .join('; ')
}

function parseCookies(response: Response, cookieJar?: CookieJar): void {
  if (cookieJar === undefined) {
    return
  }
  response.headers.raw()['set-cookie']?.map(v => {
    let c = new Cookie(v)
    cookieJar?.setCookie(c)
  })
}
