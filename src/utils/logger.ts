import * as core from '@actions/core'

/**
 * Логгер для GitHub Actions
 * 
 * GitHub Actions автоматически маскирует секреты, поэтому дополнительное маскирование не требуется
 */
export class Logger {
  /**
   * Создает экземпляр Logger
   */
  constructor() {
    // Пустой конструктор для совместимости с интерфейсом
  }

  /**
   * Логирует информационное сообщение
   * @param message - сообщение для логирования
   */
  info(message: string): void {
    core.info(message)
  }

  /**
   * Логирует отладочное сообщение
   * @param message - сообщение для логирования
   */
  debug(message: string): void {
    core.debug(message)
  }

  /**
   * Логирует предупреждение
   * @param message - сообщение для логирования
   */
  warning(message: string): void {
    core.warning(message)
  }

  /**
   * Логирует ошибку
   * @param message - сообщение для логирования
   */
  error(message: string): void {
    core.error(message)
  }

  /**
   * Логирует ошибку и устанавливает статус failed
   * @param message - сообщение для логирования
   */
  setFailed(message: string): void {
    core.setFailed(message)
  }
}
