import * as core from '@actions/core'

/**
 * Безопасный логгер, который маскирует чувствительные данные
 */
export class Logger {
  /**
   * Создает экземпляр Logger
   */
  constructor() {
    // Пустой конструктор для совместимости с интерфейсом
  }

  /**
   * Методы экземпляра для совместимости с интерфейсом ILogger
   */
  info(message: string): void {
    Logger.info(message)
  }

  warning(message: string): void {
    Logger.warning(message)
  }

  error(message: string): void {
    Logger.error(message)
  }

  debug(message: string): void {
    Logger.debug(message)
  }

  setFailed(message: string): void {
    Logger.setFailed(message)
  }
  /**
   * Маскирует чувствительные данные в сообщениях
   * @param message - исходное сообщение
   * @returns сообщение с замаскированными данными
   */
  private static maskSensitiveData(message: string): string {
    return (
      message
        // Маскируем URL с параметрами аутентификации (сначала, чтобы не конфликтовать с другими)
        .replace(/\/ticket\/auth\?token=[^&\s]+/gi, '/ticket/auth?token=***')
        // Маскируем учетные данные в URL
        .replace(/\/\/[^:]+:[^@]+@/gi, '//***:***@')
        // Маскируем токены аутентификации
        .replace(/token=[^&\s]+/gi, 'token=***')
        // Маскируем пароли
        .replace(/password[=:]\s*\S+/gi, 'password=***')
        // Маскируем логины
        .replace(/login[=:]\s*\S+/gi, 'login=***')
    )
  }

  /**
   * Логирует информационное сообщение
   * @param message - сообщение для логирования
   */
  static info(message: string): void {
    core.info(this.maskSensitiveData(message))
  }

  /**
   * Логирует отладочное сообщение
   * @param message - сообщение для логирования
   */
  static debug(message: string): void {
    core.debug(this.maskSensitiveData(message))
  }

  /**
   * Логирует предупреждение
   * @param message - сообщение для логирования
   */
  static warning(message: string): void {
    core.warning(this.maskSensitiveData(message))
  }

  /**
   * Логирует ошибку
   * @param message - сообщение для логирования
   */
  static error(message: string): void {
    core.error(this.maskSensitiveData(message))
  }

  /**
   * Логирует ошибку и устанавливает статус failed
   * @param message - сообщение для логирования
   */
  static setFailed(message: string): void {
    core.setFailed(this.maskSensitiveData(message))
  }
}
