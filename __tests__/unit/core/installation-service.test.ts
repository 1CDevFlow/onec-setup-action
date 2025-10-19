/**
 * Unit-тесты для InstallationService
 */

import { InstallationService } from '../../../src/core/installation-service'
import { InstallationConfig } from '../../../src/core/interfaces'
import { Logger } from '../../../src/utils/logger'
import { ValidationError } from '../../../src/errors/base-errors'

// Мокаем InstallerFactory
jest.mock('../../../src/core/installer-factory', () => ({
  InstallerFactory: {
    createInstaller: jest.fn()
  }
}))

// Мокаем InputValidator
jest.mock('../../../src/validators/input-validator', () => ({
  InputValidator: jest.fn().mockImplementation(() => ({
    validateAll: jest.fn()
  }))
}))

describe('InstallationService', () => {
  let installationService: InstallationService
  let logger: Logger
  let mockInstaller: {
    restoreInstalledTool: jest.Mock
    restoreInstaller: jest.Mock
    download: jest.Mock
    install: jest.Mock
    saveInstaller: jest.Mock
    saveInstalledTool: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()
    logger = new Logger()
    installationService = new InstallationService(logger)

    // Создаем мок инсталлятора
    mockInstaller = {
      restoreInstalledTool: jest.fn(),
      restoreInstaller: jest.fn(),
      download: jest.fn(),
      install: jest.fn(),
      saveInstaller: jest.fn(),
      saveInstalledTool: jest.fn()
    }

    // Мокаем InstallerFactory
    const { InstallerFactory } = require('../../../src/core/installer-factory')
    InstallerFactory.createInstaller.mockResolvedValue(mockInstaller)
  })

  describe('install', () => {
    const validConfig: InstallationConfig = {
      type: 'edt',
      version: '2024.2.6',
      platform: 'linux',
      useCache: false,
      useCacheDistr: false,
      username: 'testuser',
      password: 'testpass'
    }

    it('should install successfully without cache', async () => {
      await installationService.install(validConfig)

      expect(mockInstaller.download).toHaveBeenCalled()
      expect(mockInstaller.install).toHaveBeenCalled()
      expect(mockInstaller.restoreInstalledTool).not.toHaveBeenCalled()
      expect(mockInstaller.restoreInstaller).not.toHaveBeenCalled()
    })

    it('should restore from installed cache when available', async () => {
      const configWithCache = { ...validConfig, useCache: true }
      mockInstaller.restoreInstalledTool.mockResolvedValue('cache-key')

      await installationService.install(configWithCache)

      expect(mockInstaller.restoreInstalledTool).toHaveBeenCalled()
      expect(mockInstaller.download).not.toHaveBeenCalled()
      expect(mockInstaller.install).not.toHaveBeenCalled()
    })

    it('should restore from installer cache when available', async () => {
      const configWithCacheDistr = {
        ...validConfig,
        useCache: true,
        useCacheDistr: true
      }
      mockInstaller.restoreInstalledTool.mockResolvedValue(undefined) // No installed cache
      mockInstaller.restoreInstaller.mockResolvedValue('installer-cache-key')

      await installationService.install(configWithCacheDistr)

      expect(mockInstaller.restoreInstalledTool).toHaveBeenCalled()
      expect(mockInstaller.restoreInstaller).toHaveBeenCalled()
      expect(mockInstaller.download).not.toHaveBeenCalled()
      expect(mockInstaller.install).toHaveBeenCalled()
    })

    it('should save cache when enabled', async () => {
      const configWithCache = {
        ...validConfig,
        useCache: true,
        useCacheDistr: true
      }
      mockInstaller.restoreInstalledTool.mockResolvedValue(undefined)
      mockInstaller.restoreInstaller.mockResolvedValue(undefined)

      await installationService.install(configWithCache)

      expect(mockInstaller.saveInstaller).toHaveBeenCalled()
      expect(mockInstaller.saveInstalledTool).toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      const {
        InputValidator
      } = require('../../../src/validators/input-validator')
      const mockValidator = new InputValidator()
      mockValidator.validateAll.mockImplementation(() => {
        throw new ValidationError('Invalid input')
      })

      const serviceWithMockValidator = new InstallationService(
        logger,
        mockValidator
      )

      await expect(
        serviceWithMockValidator.install(validConfig)
      ).rejects.toThrow(ValidationError)
    })

    it('should handle unexpected errors', async () => {
      mockInstaller.download.mockRejectedValue(new Error('Network error'))

      await expect(installationService.install(validConfig)).rejects.toThrow(
        'Network error'
      )
    })
  })
})
