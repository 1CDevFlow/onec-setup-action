import { OnecTool } from '../../src/tools/onecTool'
import { mockCore } from '../mocks/actions-core.mock'
import { mockCache } from '../mocks/actions-cache.mock'
import { mockExec } from '../mocks/actions-exec.mock'

// Импортируем моки
import '../mocks/actions-core.mock'
import '../mocks/actions-cache.mock'
import '../mocks/actions-exec.mock'

// Создаем тестовый класс, наследующий от OnecTool
class TestOnecTool extends OnecTool {
  INSTALLED_CACHE_PRIMARY_KEY = 'test'
  cache_: string[] = ['/test/path']
  version = '1.0.0'
  platform = 'linux'

  getRunFileNames(): string[] {
    return ['test-executable']
  }

  getCacheDirs(): string[] {
    return ['/test/path']
  }

  async install(): Promise<void> {
    // Тестовая реализация
  }

  async download(): Promise<void> {
    // Тестовая реализация
  }
}

describe('OnecTool', () => {
  let tool: TestOnecTool

  beforeEach(() => {
    jest.clearAllMocks()
    tool = new TestOnecTool()
  })

  describe('computeInstalledKey', () => {
    it('should generate correct cache key for installed tool', () => {
      const key = tool.computeInstalledKey()
      expect(key).toBe('setup--test--1.0.0--linux')
    })
  })

  describe('computeInstallerKey', () => {
    it('should generate correct cache key for installer', () => {
      const key = tool.computeInstallerKey()
      expect(key).toBe('setup--installer--test--1.0.0--linux')
    })
  })

  describe('platform detection', () => {
    it('should detect Windows platform', () => {
      const windowsTool = new TestOnecTool()
      windowsTool.platform = 'win32'

      expect(windowsTool['isWindows']()).toBe(true)
      expect(windowsTool['isLinux']()).toBe(false)
      expect(windowsTool['isMac']()).toBe(false)
    })

    it('should detect Linux platform', () => {
      const linuxTool = new TestOnecTool()
      linuxTool.platform = 'linux'

      expect(linuxTool['isWindows']()).toBe(false)
      expect(linuxTool['isLinux']()).toBe(true)
      expect(linuxTool['isMac']()).toBe(false)
    })

    it('should detect macOS platform', () => {
      const macTool = new TestOnecTool()
      macTool.platform = 'darwin'

      expect(macTool['isWindows']()).toBe(false)
      expect(macTool['isLinux']()).toBe(false)
      expect(macTool['isMac']()).toBe(true)
    })
  })

  describe('getPlatformType', () => {
    it('should return correct platform type for Windows', () => {
      const windowsTool = new TestOnecTool()
      windowsTool.platform = 'win32'

      expect(windowsTool['getPlatformType']()).toBe('win')
    })

    it('should return correct platform type for Linux', () => {
      const linuxTool = new TestOnecTool()
      linuxTool.platform = 'linux'

      expect(linuxTool['getPlatformType']()).toBe('linux')
    })

    it('should return correct platform type for macOS', () => {
      const macTool = new TestOnecTool()
      macTool.platform = 'darwin'

      expect(macTool['getPlatformType']()).toBe('mac')
    })

    it('should throw error for unsupported platform', () => {
      const unsupportedTool = new TestOnecTool()
      unsupportedTool.platform = 'unsupported'

      expect(() => unsupportedTool['getPlatformType']()).toThrow(
        'Unrecognized os unsupported'
      )
    })
  })

  describe('getInstallersPath', () => {
    it('should return correct installers path', () => {
      const path = tool['getInstallersPath']()
      expect(path).toBe('/tmp/installer')
    })
  })

  describe('cache operations', () => {
    it('should generate correct cache keys', () => {
      const installedKey = tool.computeInstalledKey()
      const installerKey = tool.computeInstallerKey()

      expect(installedKey).toBe('setup--test--1.0.0--linux')
      expect(installerKey).toBe('setup--installer--test--1.0.0--linux')
    })

    it('should have correct cache directories', () => {
      const cacheDirs = tool.getCacheDirs()
      expect(cacheDirs).toEqual(['/test/path'])
    })

    it('should have correct run file names', () => {
      const runFiles = tool.getRunFileNames()
      expect(runFiles).toEqual(['test-executable'])
    })
  })

  // Приватные методы тестируются через публичные методы
})
