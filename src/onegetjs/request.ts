import { RequestInfo, RequestInit, Response } from 'node-fetch'
import fetch from 'node-fetch'
import { Cookie, CookieJar } from 'cookiejar'
import * as core from '@actions/core'


export interface RequestInit2 extends RequestInit {
    cookie?: CookieJar
}

export default async function request(urlString: string, init?: RequestInit2): Promise<Response> {
    core.debug(`Request [${init?.method ?? 'GET'}] ${urlString}`)
    let url = new URL(urlString);

    let cookieJar = init?.cookie;
    let cookieValue = cookieJar?.getCookies({ domain: url.host, path: url.pathname, secure: true, script: false })
        .map(c => c.toValueString())
        .join('; ')
    let fetchInit = init ?? {}
    if (cookieValue) {
        if (fetchInit.headers === undefined) {
            fetchInit.headers = {
                'cookie': cookieValue
            }
        }
    }
    fetchInit.redirect = 'manual'
    let response = await fetch(urlString, fetchInit);
    parseCookies(response, cookieJar);

    if (isRedirect(response)) {
        const locationURL = new URL(response.headers.get('location') ?? '', response.url);
        core.debug('Redirect to: ' + locationURL)
        return await request(locationURL.toString(), {
            cookie: cookieJar
        })
    }

    return response;
}

function isRedirect(response: Response) {
    return response.status === 301 || response.status === 302
}

function cookieString(cookieJar: CookieJar, url: URL) {
    return cookieJar?.getCookies({ domain: url.host, path: url.pathname, secure: true, script: false })
        .map(c => c.toString())
        .join('; ')
}
function parseCookies(response: Response, cookieJar?: CookieJar) {
    if (cookieJar === undefined) {
        return;
    }
    response.headers.raw()['set-cookie']?.map(v => {
        let c = new Cookie(v);
        cookieJar?.setCookie(c);
    })
}