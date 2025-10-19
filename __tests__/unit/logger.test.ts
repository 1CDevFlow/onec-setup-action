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
  let logger: Logger

  beforeEach(() => {
    jest.clearAllMocks()
    logger = new Logger()
  })

  describe('logging methods', () => {
    it('should call core.info with message', () => {
      logger.info('Test message')
      expect(core.info).toHaveBeenCalledWith('Test message')
    })

    it('should call core.debug with message', () => {
      logger.debug('Debug message')
      expect(core.debug).toHaveBeenCalledWith('Debug message')
    })

    it('should call core.warning with message', () => {
      logger.warning('Warning message')
      expect(core.warning).toHaveBeenCalledWith('Warning message')
    })

    it('should call core.error with message', () => {
      logger.error('Error message')
      expect(core.error).toHaveBeenCalledWith('Error message')
    })

    it('should call core.setFailed with message', () => {
      logger.setFailed('Failed message')
      expect(core.setFailed).toHaveBeenCalledWith('Failed message')
    })
  })
})
