import {
  OnecSetupError,
  AuthenticationError,
  DownloadError,
  InstallationError,
  CacheError,
  ValidationError,
  PlatformError
} from '../../src/errors/base-errors'

describe('Error Classes', () => {
  describe('OnecSetupError', () => {
    it('should create error with message', () => {
      class TestError extends OnecSetupError {
        readonly code = 'TEST_ERROR'
        readonly category = 'AUTH' as const
      }

      const error = new TestError('Test message')
      expect(error.message).toBe('Test message')
      expect(error.name).toBe('TestError')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.category).toBe('AUTH')
    })

    it('should create error with details', () => {
      class TestError extends OnecSetupError {
        readonly code = 'TEST_ERROR'
        readonly category = 'AUTH' as const
      }

      const details = { status: 404, url: 'test.com' }
      const error = new TestError('Test message', details)
      expect(error.details).toEqual(details)
    })

    it('should return error info', () => {
      class TestError extends OnecSetupError {
        readonly code = 'TEST_ERROR'
        readonly category = 'AUTH' as const
      }

      const details = { status: 404 }
      const error = new TestError('Test message', details)
      const info = error.getErrorInfo()

      expect(info).toEqual({
        code: 'TEST_ERROR',
        category: 'AUTH',
        message: 'Test message',
        details: { status: 404 }
      })
    })
  })

  describe('AuthenticationError', () => {
    it('should create authentication error with default message', () => {
      const error = new AuthenticationError()
      expect(error.message).toBe('Authentication failed')
      expect(error.code).toBe('AUTH_FAILED')
      expect(error.category).toBe('AUTH')
    })

    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Custom auth error')
      expect(error.message).toBe('Custom auth error')
      expect(error.code).toBe('AUTH_FAILED')
      expect(error.category).toBe('AUTH')
    })

    it('should create authentication error with details', () => {
      const details = { status: 401, endpoint: '/login' }
      const error = new AuthenticationError('Auth failed', details)
      expect(error.details).toEqual(details)
    })
  })

  describe('DownloadError', () => {
    it('should create download error with default message', () => {
      const error = new DownloadError()
      expect(error.message).toBe('Download failed')
      expect(error.code).toBe('DOWNLOAD_FAILED')
      expect(error.category).toBe('DOWNLOAD')
    })

    it('should create download error with custom message', () => {
      const error = new DownloadError('Custom download error')
      expect(error.message).toBe('Custom download error')
      expect(error.code).toBe('DOWNLOAD_FAILED')
      expect(error.category).toBe('DOWNLOAD')
    })
  })

  describe('InstallationError', () => {
    it('should create installation error with default message', () => {
      const error = new InstallationError()
      expect(error.message).toBe('Installation failed')
      expect(error.code).toBe('INSTALLATION_FAILED')
      expect(error.category).toBe('INSTALL')
    })

    it('should create installation error with custom message', () => {
      const error = new InstallationError('Custom install error')
      expect(error.message).toBe('Custom install error')
      expect(error.code).toBe('INSTALLATION_FAILED')
      expect(error.category).toBe('INSTALL')
    })
  })

  describe('CacheError', () => {
    it('should create cache error with default message', () => {
      const error = new CacheError()
      expect(error.message).toBe('Cache operation failed')
      expect(error.code).toBe('CACHE_FAILED')
      expect(error.category).toBe('CACHE')
    })

    it('should create cache error with custom message', () => {
      const error = new CacheError('Custom cache error')
      expect(error.message).toBe('Custom cache error')
      expect(error.code).toBe('CACHE_FAILED')
      expect(error.category).toBe('CACHE')
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with default message', () => {
      const error = new ValidationError()
      expect(error.message).toBe('Validation failed')
      expect(error.code).toBe('VALIDATION_FAILED')
      expect(error.category).toBe('VALIDATION')
    })

    it('should create validation error with custom message', () => {
      const error = new ValidationError('Custom validation error')
      expect(error.message).toBe('Custom validation error')
      expect(error.code).toBe('VALIDATION_FAILED')
      expect(error.category).toBe('VALIDATION')
    })
  })

  describe('PlatformError', () => {
    it('should create platform error with default message', () => {
      const error = new PlatformError()
      expect(error.message).toBe('Platform error')
      expect(error.code).toBe('PLATFORM_ERROR')
      expect(error.category).toBe('PLATFORM')
    })

    it('should create platform error with custom message', () => {
      const error = new PlatformError('Custom platform error')
      expect(error.message).toBe('Custom platform error')
      expect(error.code).toBe('PLATFORM_ERROR')
      expect(error.category).toBe('PLATFORM')
    })
  })
})
