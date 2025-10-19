/**
 * Утилиты для тестирования
 */

/**
 * Создает мок для fs.statSync
 */
export const createMockStatSync = (isFile: boolean = true) => {
  return jest.fn().mockReturnValue({
    isFile: () => isFile,
    isDirectory: () => !isFile
  })
}

/**
 * Создает мок для fs.createWriteStream
 */
export const createMockWriteStream = () => {
  const mockStream = {
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    pipe: jest.fn()
  }
  return jest.fn().mockReturnValue(mockStream)
}

/**
 * Создает мок для glob.create
 */
export const createMockGlob = (files: string[] = []) => {
  return {
    glob: jest.fn().mockResolvedValue(files),
    globGenerator: jest.fn().mockImplementation(async function* () {
      for (const file of files) {
        yield file
      }
    })
  }
}

/**
 * Создает мок для tc.extractZip
 */
export const createMockExtractZip = () => {
  return jest.fn().mockResolvedValue(undefined)
}

/**
 * Создает мок для tc.extractTar
 */
export const createMockExtractTar = () => {
  return jest.fn().mockResolvedValue(undefined)
}

/**
 * Создает мок для exec
 */
export const createMockExec = (exitCode: number = 0) => {
  return jest.fn().mockResolvedValue(exitCode)
}

/**
 * Создает мок для cache.restoreCache
 */
export const createMockRestoreCache = (key?: string) => {
  return jest.fn().mockResolvedValue(key)
}

/**
 * Создает мок для cache.saveCache
 */
export const createMockSaveCache = () => {
  return jest.fn().mockResolvedValue(undefined)
}

/**
 * Создает мок для cache.isFeatureAvailable
 */
export const createMockIsFeatureAvailable = (available: boolean = true) => {
  return jest.fn().mockReturnValue(available)
}

/**
 * Создает мок для Response
 */
export const createMockResponse = (
  status: number,
  body: any,
  headers: Record<string, string> = {}
) => ({
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {
    get: jest.fn((name: string) => headers[name] || null)
  },
  text: jest
    .fn()
    .mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  json: jest
    .fn()
    .mockResolvedValue(typeof body === 'object' ? body : JSON.parse(body)),
  body: {
    pipe: jest.fn(),
    on: jest.fn()
  }
})

/**
 * Создает мок для CookieJar
 */
export const createMockCookieJar = () => ({
  setCookie: jest.fn(),
  getCookieString: jest.fn().mockReturnValue(''),
  getCookies: jest.fn().mockReturnValue([])
})

/**
 * Создает мок для URL
 */
export const createMockURL = (href: string) => ({
  href,
  hostname: 'example.com',
  pathname: '/path',
  search: '?param=value'
})

/**
 * Создает мок для process.env
 */
export const createMockEnv = (env: Record<string, string>) => {
  const originalEnv = process.env
  process.env = { ...originalEnv, ...env }

  return () => {
    process.env = originalEnv
  }
}

/**
 * Создает мок для process.platform
 */
export const createMockPlatform = (platform: string) => {
  const originalPlatform = process.platform
  Object.defineProperty(process, 'platform', {
    value: platform,
    writable: true
  })

  return () => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      writable: true
    })
  }
}
