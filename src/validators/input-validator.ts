import { ValidationError } from '../errors/base-errors'
import { DEFAULT_EDT_VERSION, DEFAULT_ONEC_VERSION } from '../utils/constants'
import { ActionInputs } from '../core/interfaces'

/**
 * Валидатор входных данных для onec-setup-action
 */
export class InputValidator {
  /**
   * Создает экземпляр InputValidator
   */
  constructor() {
    // Пустой конструктор для совместимости с интерфейсом
  }

  /**
   * Методы экземпляра для совместимости с интерфейсом IInputValidator
   */
  validateAll(inputs: ActionInputs): void {
    InputValidator.validateAll(inputs)
  }

  validateType(type: string): void {
    InputValidator.validateType(type)
  }

  validateEdtVersion(version: string): void {
    InputValidator.validateEdtVersion(version)
  }

  validateOnecVersion(version: string): void {
    InputValidator.validateOnecVersion(version)
  }

  validateCredentials(username: string, password: string): void {
    InputValidator.validateCredentials(username, password)
  }
  /**
   * Валидирует тип установщика
   * @param type - тип установщика
   * @throws ValidationError если тип неверный
   */
  static validateType(type: string): void {
    if (!type) {
      throw new ValidationError('Type is required')
    }

    if (!['edt', 'onec'].includes(type)) {
      throw new ValidationError(
        `Invalid type: ${type}. Must be 'edt' or 'onec'`
      )
    }
  }

  /**
   * Валидирует версию EDT
   * @param version - версия EDT
   * @throws ValidationError если версия неверная
   */
  static validateEdtVersion(version: string): void {
    if (!version) {
      throw new ValidationError('EDT version is required when type is "edt"')
    }

    // Проверяем формат версии EDT (например, 2024.2.6)
    const versionPattern = /^\d{4}\.\d+\.\d+$/
    if (!versionPattern.test(version)) {
      throw new ValidationError(
        `Invalid EDT version format: ${version}. Expected format: YYYY.M.N`
      )
    }
  }

  /**
   * Валидирует версию 1С:Предприятие
   * @param version - версия 1С:Предприятие
   * @throws ValidationError если версия неверная
   */
  static validateOnecVersion(version: string): void {
    if (!version) {
      throw new ValidationError('OneC version is required when type is "onec"')
    }

    // Проверяем формат версии 1С (например, 8.3.20.1549)
    const versionPattern = /^8\.3\.\d+\.\d+$/
    if (!versionPattern.test(version)) {
      throw new ValidationError(
        `Invalid OneC version format: ${version}. Expected format: 8.3.X.Y`
      )
    }
  }

  /**
   * Валидирует булево значение
   * @param value - значение для валидации
   * @param name - имя параметра для сообщения об ошибке
   * @throws ValidationError если значение неверное
   */
  static validateBoolean(value: string, name: string): void {
    if (value && !['true', 'false'].includes(value.toLowerCase())) {
      throw new ValidationError(
        `Invalid ${name} value: ${value}. Must be 'true' or 'false'`
      )
    }
  }

  /**
   * Валидирует учетные данные
   * @param username - имя пользователя
   * @param password - пароль
   * @throws ValidationError если учетные данные неверные
   */
  static validateCredentials(username: string, password: string): void {
    if (!username || !password) {
      throw new ValidationError(
        'ONEC_USERNAME and ONEC_PASSWORD environment variables are required'
      )
    }

    if (username.trim().length === 0 || password.trim().length === 0) {
      throw new ValidationError(
        'ONEC_USERNAME and ONEC_PASSWORD cannot be empty'
      )
    }
  }

  /**
   * Валидирует все входные данные
   * @param inputs - объект с входными данными
   * @throws ValidationError если данные неверные
   */
  static validateAll(inputs: ActionInputs): void {
    this.validateType(inputs.type)

    if (inputs.type === 'edt') {
      this.validateEdtVersion(inputs.edt_version || DEFAULT_EDT_VERSION)
    } else if (inputs.type === 'onec') {
      this.validateOnecVersion(inputs.onec_version || DEFAULT_ONEC_VERSION)
    }

    if (inputs.cache) {
      this.validateBoolean(inputs.cache, 'cache')
    }

    if (inputs.cache_distr) {
      this.validateBoolean(inputs.cache_distr, 'cache_distr')
    }

    // Всегда проверяем учетные данные
    this.validateCredentials(inputs.username || '', inputs.password || '')
  }
}
