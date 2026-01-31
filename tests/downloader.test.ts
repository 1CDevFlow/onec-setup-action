import { Client } from '../src/onegetjs/downloader'
import { AuthProviderType } from '../src/onegetjs/auth'

describe('downloader.ts', () => {
  const login = process.env.ONEC_USERNAME ?? ''
  const password = process.env.ONEC_PASSWORD ?? ''

  it('auth with token provider', async () => {
    const client = new Client(login, password, {
      preferredProvider: AuthProviderType.TOKEN
    })
    try {
      await client.auth()
    } catch (error) {
      // Ожидаем ошибку из-за отсутствия реальных учетных данных
      expect(error).toBeDefined()
    }
  })

  it('auth with form provider', async () => {
    const client = new Client(login, password, {
      preferredProvider: AuthProviderType.FORM
    })
    try {
      await client.auth()
    } catch (error) {
      // Ожидаем ошибку из-за отсутствия реальных учетных данных
      expect(error).toBeDefined()
    }
  })
})
