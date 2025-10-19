import { Logger } from '../../src/utils/logger'
import * as core from '@actions/core'

// Мокаем @actions/core
jest.mock('@actions/core', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  setFailed: jest.fn()
}))

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('maskSensitiveData', () => {
    it('should mask passwords in messages', () => {
      const message = 'Login with password=secret123'
      Logger.info(message)

      expect(core.info).toHaveBeenCalledWith('Login with password=***')
    })

    it('should mask tokens in messages', () => {
      const message = 'Using token=*'
      Logger.info(message)

      expect(core.info).toHaveBeenCalledWith('Using token=***')
    })

    it('should mask login credentials in messages', () => {
      const message = 'User login=admin123'
      Logger.info(message)

      expect(core.info).toHaveBeenCalledWith('User login=***')
    })

    it('should mask authentication URLs', () => {
      const message = 'Auth URL: /ticket/auth?token=secret123&param=value'
      Logger.info(message)

      expect(core.info).toHaveBeenCalledWith(
        'Auth URL: /ticket/auth?token=***&param=value'
      )
    })

    it('should mask credentials in URLs', () => {
      const message = 'Connecting to https://user:pass@example.com'
      Logger.info(message)

      expect(core.info).toHaveBeenCalledWith(
        'Connecting to https://***:***@example.com'
      )
    })

    it('should not mask non-sensitive data', () => {
      const message = 'Regular message without sensitive data'
      Logger.info(message)

      expect(core.info).toHaveBeenCalledWith(
        'Regular message without sensitive data'
      )
    })

    it('should handle multiple sensitive patterns in one message', () => {
      const message = 'Login: user=admin, password=secret, token=abc123'
      Logger.info(message)

      expect(core.info).toHaveBeenCalledWith('login=*** password=*** token=***')
    })
  })

  describe('logging methods', () => {
    it('should call core.info with masked message', () => {
      Logger.info('Test message')
      expect(core.info).toHaveBeenCalledWith('Test message')
    })

    it('should call core.debug with masked message', () => {
      Logger.debug('Debug message')
      expect(core.debug).toHaveBeenCalledWith('Debug message')
    })

    it('should call core.warning with masked message', () => {
      Logger.warning('Warning message')
      expect(core.warning).toHaveBeenCalledWith('Warning message')
    })

    it('should call core.error with masked message', () => {
      Logger.error('Error message')
      expect(core.error).toHaveBeenCalledWith('Error message')
    })

    it('should call core.setFailed with masked message', () => {
      Logger.setFailed('Failed message')
      expect(core.setFailed).toHaveBeenCalledWith('Failed message')
    })
  })
})
