import { downloadRelease } from '../src/onegetjs'
import { config } from 'dotenv'

const TIMEOUT = 300000 // 5 минут для простого теста

describe('Simple Integration Tests', () => {
  config()

  // Проверяем наличие учетных данных
  const login = process.env.ONEC_USERNAME ?? ''
  const password = process.env.ONEC_PASSWORD ?? ''
  const shouldSkip = !login || !password

  if (shouldSkip) {
    console.log('Skipping simple integration tests: ONEC_USERNAME and ONEC_PASSWORD not set')
  }

  it(
    'Simple download test - EDT Linux',
    async () => {
      if (shouldSkip) {
        console.log('Skipping simple download test: credentials not available')
        return
      }

      // Простой тест - только загрузка без распаковки
      await downloadRelease(
        {
          project: 'DevelopmentTools10',
          version: '2023.1.2',
          osName: 'linux',
          offline: true
        },
        './tmp/oneget/simple-test',
        false // Не распаковываем
      )
    },
    TIMEOUT
  )

  it(
    'Simple download test - Platform Windows',
    async () => {
      if (shouldSkip) {
        console.log('Skipping simple download test: credentials not available')
        return
      }

      // Простой тест - только загрузка без распаковки
      await downloadRelease(
        {
          project: 'Platform83',
          version: '8.3.10.2580',
          osName: 'win',
          architecture: 'x64',
          type: 'full'
        },
        './tmp/oneget/simple-test',
        false // Не распаковываем
      )
    },
    TIMEOUT
  )
})
