import { Client } from '../src/onegetjs/downloader'

describe('downloader.ts', () => {
  const login = process.env.ONEC_USERNAME ?? ''
  const password = process.env.ONEC_PASSWORD ?? ''
  const client = new Client(login, password)

  it('auth', async () => {
    await client.auth()
  })
})
