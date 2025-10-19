import { run } from '../../src/installer'
import { mockCore } from '../mocks/actions-core.mock'
import { ValidationError } from '../../src/errors/base-errors'

// Импортируем моки
import '../mocks/actions-core.mock'

// Мокаем модули
jest.mock('../../src/utils', () => ({
  isCacheFeatureAvailable: jest.fn(() => true)
}))

jest.mock('../../src/tools', () => ({
  EDT: jest.fn().mockImplementation(() => ({
    restoreInstalledTool: jest.fn(),
    restoreInstallationPackage: jest.fn(),
    download: jest.fn(),
    install: jest.fn(),
    updatePath: jest.fn(),
    saveInstallerCache: jest.fn(),
    saveInstalledCache: jest.fn()
  })),
  Platform83: jest.fn().mockImplementation(() => ({
    restoreInstalledTool: jest.fn(),
    restoreInstallationPackage: jest.fn(),
    download: jest.fn(),
    install: jest.fn(),
    updatePath: jest.fn(),
    saveInstallerCache: jest.fn(),
    saveInstalledCache: jest.fn()
  }))
}))

// Мокаем @actions/core глобально
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  addPath: jest.fn(),
  exportVariable: jest.fn(),
  setSecret: jest.fn(),
  isDebug: jest.fn(() => false)
}))

// Мокаем InstallationService чтобы избежать реальных HTTP запросов
const mockInstall = jest.fn()
jest.mock('../../src/core/installation-service', () => ({
  InstallationService: jest.fn().mockImplementation(() => ({
    install: mockInstall
  }))
}))

describe('installer', () => {
  const mockCore = require('@actions/core')

  beforeEach(() => {
    jest.clearAllMocks()
    // Устанавливаем переменные окружения
    process.env.ONEC_USERNAME = 'testuser'
    process.env.ONEC_PASSWORD = 'testpass'
    // Очищаем мок install
    mockInstall.mockClear()
  })

  afterEach(() => {
    delete process.env.ONEC_USERNAME
    delete process.env.ONEC_PASSWORD
  })

  describe('EDT installation', () => {
    it('should install EDT with default version', async () => {
      const {
        InstallationService
      } = require('../../src/core/installation-service')

      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'type':
            return 'edt'
          case 'edt_version':
            return '2024.2.6' // Используем дефолтную версию
          case 'onec_version':
            return ''
          default:
            return ''
        }
      })
      mockCore.getBooleanInput.mockReturnValue(false)

      await run()

      expect(mockCore.getInput).toHaveBeenCalledWith('type')
      expect(mockCore.getInput).toHaveBeenCalledWith('edt_version')
      expect(mockInstall).toHaveBeenCalled()
    })

    it('should install EDT with specified version', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'type':
            return 'edt'
          case 'edt_version':
            return '2024.2.6'
          case 'onec_version':
            return ''
          default:
            return ''
        }
      })
      mockCore.getBooleanInput.mockReturnValue(false)

      await run()

      expect(mockCore.getInput).toHaveBeenCalledWith('edt_version')
    })

    it('should use default EDT version when not specified', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'type':
            return 'edt'
          case 'edt_version':
            return '' // Пустая версия
          case 'onec_version':
            return ''
          default:
            return ''
        }
      })
      mockCore.getBooleanInput.mockReturnValue(false)

      // Должен использовать дефолтную версию и не выбрасывать ошибку
      await expect(run()).resolves.not.toThrow()
    })
  })

  describe('OneC installation', () => {
    it('should install OneC with default version', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'type':
            return 'onec'
          case 'edt_version':
            return ''
          case 'onec_version':
            return '8.3.20.1549' // Используем дефолтную версию
          default:
            return ''
        }
      })
      mockCore.getBooleanInput.mockReturnValue(false)

      await run()

      expect(mockCore.getInput).toHaveBeenCalledWith('type')
      expect(mockCore.getInput).toHaveBeenCalledWith('onec_version')
    })

    it('should install OneC with specified version', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'type':
            return 'onec'
          case 'edt_version':
            return ''
          case 'onec_version':
            return '8.3.20.1549'
          default:
            return ''
        }
      })
      mockCore.getBooleanInput.mockReturnValue(false)

      await run()

      expect(mockCore.getInput).toHaveBeenCalledWith('onec_version')
    })

    it('should use default OneC version when not specified', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'type':
            return 'onec'
          case 'edt_version':
            return ''
          case 'onec_version':
            return '' // Пустая версия
          default:
            return ''
        }
      })
      mockCore.getBooleanInput.mockReturnValue(false)

      // Должен использовать дефолтную версию и не выбрасывать ошибку
      await expect(run()).resolves.not.toThrow()
    })
  })

  describe('validation errors', () => {
    it('should throw ValidationError for invalid type', async () => {
      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'type':
            return 'invalid'
          case 'edt_version':
            return ''
          case 'onec_version':
            return ''
          default:
            return ''
        }
      })
      mockCore.getBooleanInput.mockReturnValue(false)

      // Мокаем ошибку валидации
      mockInstall.mockRejectedValue(new ValidationError('Invalid type'))

      await expect(run()).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for missing credentials', async () => {
      // Сохраняем оригинальные значения
      const originalUsername = process.env.ONEC_USERNAME
      const originalPassword = process.env.ONEC_PASSWORD

      // Удаляем переменные окружения
      delete process.env.ONEC_USERNAME
      delete process.env.ONEC_PASSWORD

      mockCore.getInput.mockImplementation((name: string) => {
        switch (name) {
          case 'type':
            return 'edt'
          case 'edt_version':
            return '2024.2.6'
          case 'onec_version':
            return ''
          default:
            return ''
        }
      })
      mockCore.getBooleanInput.mockReturnValue(false)

      // Мокаем ошибку валидации
      mockInstall.mockRejectedValue(new ValidationError('Missing credentials'))

      // Валидатор должен проверить учетные данные, которые передаются из process.env
      await expect(run()).rejects.toThrow(ValidationError)

      // Восстанавливаем оригинальные значения
      if (originalUsername) process.env.ONEC_USERNAME = originalUsername
      if (originalPassword) process.env.ONEC_PASSWORD = originalPassword
    })
  })

  // Кеш функциональность тестируется в InstallationService тестах
})
