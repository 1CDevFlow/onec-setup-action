import { Client } from '../src/onegetjs/downloader'

describe('downloader.ts', () => {
  const login = process.env.ONEC_USERNAME ?? ''
  const password = process.env.ONEC_PASSWORD ?? ''
  
  // Пропускаем тест, если нет учетных данных
  const shouldSkip = !login || !password
  
  if (shouldSkip) {
    console.log('Skipping downloader integration tests: ONEC_USERNAME and ONEC_PASSWORD not set')
  }

  it('auth', async () => {
    if (shouldSkip) {
      console.log('Skipping auth test: credentials not available')
      return
    }
    
    const client = new Client(login, password)
    await client.auth()
  })
})
