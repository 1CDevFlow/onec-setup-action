/**
 * Базовые классы ошибок для onec-setup-action
 */

export type ErrorCategory =
  | 'AUTH'
  | 'DOWNLOAD'
  | 'INSTALL'
  | 'CACHE'
  | 'VALIDATION'
  | 'PLATFORM'

/**
 * Базовый класс для всех ошибок onec-setup-action
 */
export abstract class OnecSetupError extends Error {
  abstract readonly code: string
  abstract readonly category: ErrorCategory

  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
  }

  /**
   * Возвращает детальную информацию об ошибке
   */
  getErrorInfo(): {
    code: string
    category: ErrorCategory
    message: string
    details?: unknown
  } {
    return {
      code: this.code,
      category: this.category,
      message: this.message,
      details: this.details
    }
  }
}

/**
 * Ошибки аутентификации
 */
export class AuthenticationError extends OnecSetupError {
  readonly code = 'AUTH_FAILED'
  readonly category: ErrorCategory = 'AUTH'

  constructor(message: string = 'Authentication failed', details?: unknown) {
    super(message, details)
  }
}

/**
 * Ошибки загрузки
 */
export class DownloadError extends OnecSetupError {
  readonly code = 'DOWNLOAD_FAILED'
  readonly category: ErrorCategory = 'DOWNLOAD'

  constructor(message: string = 'Download failed', details?: unknown) {
    super(message, details)
  }
}

/**
 * Ошибки установки
 */
export class InstallationError extends OnecSetupError {
  readonly code = 'INSTALLATION_FAILED'
  readonly category: ErrorCategory = 'INSTALL'

  constructor(message: string = 'Installation failed', details?: unknown) {
    super(message, details)
  }
}

/**
 * Ошибки кеширования
 */
export class CacheError extends OnecSetupError {
  readonly code = 'CACHE_FAILED'
  readonly category: ErrorCategory = 'CACHE'

  constructor(message: string = 'Cache operation failed', details?: unknown) {
    super(message, details)
  }
}

/**
 * Ошибки валидации
 */
export class ValidationError extends OnecSetupError {
  readonly code = 'VALIDATION_FAILED'
  readonly category: ErrorCategory = 'VALIDATION'

  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, details)
  }
}

/**
 * Ошибки платформы
 */
export class PlatformError extends OnecSetupError {
  readonly code = 'PLATFORM_ERROR'
  readonly category: ErrorCategory = 'PLATFORM'

  constructor(message: string = 'Platform error', details?: unknown) {
    super(message, details)
  }
}
