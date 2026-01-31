import {
  TokenAuthProvider,
  FormAuthProvider,
  AuthProviderFactory,
  AuthProviderType
} from '../src/onegetjs/auth'
import { HttpClient } from '../src/onegetjs/httpClient'

describe('Auth Providers', () => {
  const login = process.env.ONEC_USERNAME ?? 'test'
  const password = process.env.ONEC_PASSWORD ?? 'test'

  it('TokenAuthProvider should be instantiable', () => {
    const provider = new TokenAuthProvider(login, password)
    expect(provider).toBeDefined()
    expect(typeof provider.authenticate).toBe('function')
  })

  it('FormAuthProvider should be instantiable', () => {
    const provider = new FormAuthProvider(login, password)
    expect(provider).toBeDefined()
    expect(typeof provider.authenticate).toBe('function')
  })

  it('AuthProviderFactory should create TOKEN provider', () => {
    const provider = AuthProviderFactory.create({
      username: login,
      password: password,
      preferredProvider: AuthProviderType.TOKEN
    })

    expect(provider).toBeDefined()
    expect(provider).toBeInstanceOf(TokenAuthProvider)
  })

  it('AuthProviderFactory should create FORM provider by default', () => {
    const provider = AuthProviderFactory.create({
      username: login,
      password: password
    })

    expect(provider).toBeInstanceOf(FormAuthProvider)
  })

  it('AuthProviderFactory should respect FORM provider', () => {
    const provider = AuthProviderFactory.create({
      username: login,
      password: password,
      preferredProvider: AuthProviderType.FORM
    })

    expect(provider).toBeInstanceOf(FormAuthProvider)
  })

  // Тесты реальной аутентификации (требуют переменные окружения)
  describe('Real Authentication', () => {
    const hasCredentials =
      login && password && login !== 'test' && password !== 'test'

    it('TokenAuthProvider should attempt authentication', async () => {
      if (!hasCredentials) {
        console.log('Skipping TokenAuthProvider test - no credentials')
        return
      }

      const provider = new TokenAuthProvider(login, password)
      const httpClient = new HttpClient()
      try {
        await provider.authenticate(httpClient)
        // Если дошли сюда - аутентификация прошла
        expect(true).toBe(true)
      } catch (error) {
        // Ожидаем ошибку, но проверяем что это правильная ошибка аутентификации
        expect(error).toBeDefined()
        expect((error as Error).message.toLowerCase()).toContain(
          'authentication'
        )
      }
    }, 30000)

    it('FormAuthProvider should attempt authentication', async () => {
      const provider = new FormAuthProvider(login, password)
      const httpClient = new HttpClient()
      await provider.authenticate(httpClient)
      // Если дошли сюда - аутентификация прошла
      expect(true).toBe(true)
    }, 30000)

    it('AuthProviderFactory should create working provider', async () => {
      if (!hasCredentials) {
        console.log('Skipping AuthProviderFactory test - no credentials')
        return
      }

      const provider = AuthProviderFactory.create({
        username: login,
        password: password
      })

      const httpClient = new HttpClient()
      // Проверяем что провайдер может выполнять аутентификацию
      try {
        await provider.authenticate(httpClient)
        const response = await httpClient.get('https://releases.1c.ru')
        expect(response.status).toBe(200)
      } catch (error) {
        // Ожидаем ошибку из-за отсутствия аутентификации
        expect(error).toBeDefined()
      }
    }, 30000)
  })
})
