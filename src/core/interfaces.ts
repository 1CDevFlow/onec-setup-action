/**
 * Базовые интерфейсы для архитектуры onec-setup-action
 */

/**
 * Интерфейс для работы с кешем
 */
export interface ICacheManager {
  /**
   * Восстанавливает кеш по ключу
   * @param paths - пути для восстановления
   * @param primaryKey - основной ключ кеша
   * @param restoreKeys - дополнительные ключи для поиска
   * @returns ключ восстановленного кеша или undefined
   */
  restoreCache(
    paths: string[],
    primaryKey: string,
    restoreKeys?: string[]
  ): Promise<string | undefined>

  /**
   * Сохраняет кеш
   * @param paths - пути для сохранения
   * @param key - ключ кеша
   */
  saveCache(paths: string[], key: string): Promise<void>

  /**
   * Проверяет доступность функции кеширования
   */
  isFeatureAvailable(): boolean
}

/**
 * Интерфейс для определения платформы
 */
export interface IPlatformDetector {
  /**
   * Определяет тип платформы
   * @param platform - строка платформы (win32, linux, darwin)
   * @returns тип платформы
   */
  getPlatformType(platform: string): 'win' | 'linux' | 'mac'

  /**
   * Проверяет, является ли платформа Windows
   */
  isWindows(): boolean

  /**
   * Проверяет, является ли платформа Linux
   */
  isLinux(): boolean

  /**
   * Проверяет, является ли платформа macOS
   */
  isMac(): boolean
}

/**
 * Интерфейс для работы с путями
 */
export interface IPathManager {
  /**
   * Получает пути кеша для установленного инструмента
   */
  getCacheDirectories(): string[]

  /**
   * Получает пути кеша для установщика
   */
  getInstallerCachePath(): string

  /**
   * Получает имена исполняемых файлов
   */
  getExecutableNames(): string[]

  /**
   * Обновляет переменную PATH
   */
  updatePath(): Promise<void>
}

/**
 * Интерфейс для инсталлятора
 */
export interface IInstaller {
  /**
   * Версия для установки
   */
  readonly version: string

  /**
   * Платформа для установки
   */
  readonly platform: string

  /**
   * Скачивает установщик
   */
  download(): Promise<void>

  /**
   * Устанавливает приложение
   */
  install(): Promise<void>

  /**
   * Восстанавливает установленный инструмент из кеша
   */
  restoreInstalledTool(): Promise<string | undefined>

  /**
   * Восстанавливает установщик из кеша
   */
  restoreInstaller(): Promise<string | undefined>

  /**
   * Сохраняет установленный инструмент в кеш
   */
  saveInstalledTool(): Promise<void>

  /**
   * Сохраняет установщик в кеш
   */
  saveInstaller(): Promise<void>
}

/**
 * Интерфейс для валидации входных данных
 */
export interface IInputValidator {
  /**
   * Валидирует все входные данные
   * @param inputs - объект с входными данными
   */
  validateAll(inputs: ActionInputs): void

  /**
   * Валидирует тип установщика
   * @param type - тип установщика
   */
  validateType(type: string): void

  /**
   * Валидирует версию EDT
   * @param version - версия EDT
   */
  validateEdtVersion(version: string): void

  /**
   * Валидирует версию OneC
   * @param version - версия OneC
   */
  validateOnecVersion(version: string): void

  /**
   * Валидирует учетные данные
   * @param username - имя пользователя
   * @param password - пароль
   */
  validateCredentials(username: string, password: string): void
}

/**
 * Интерфейс для логирования
 */
export interface ILogger {
  /**
   * Логирует информационное сообщение
   * @param message - сообщение
   */
  info(message: string): void

  /**
   * Логирует предупреждение
   * @param message - сообщение
   */
  warning(message: string): void

  /**
   * Логирует ошибку
   * @param message - сообщение
   */
  error(message: string): void

  /**
   * Логирует отладочную информацию
   * @param message - сообщение
   */
  debug(message: string): void

  /**
   * Устанавливает действие как неудачное
   * @param message - сообщение об ошибке
   */
  setFailed(message: string): void
}

/**
 * Входные данные для действия
 */
export interface ActionInputs {
  type: string
  edt_version?: string
  onec_version?: string
  cache?: string
  cache_distr?: string
  username?: string
  password?: string
}

/**
 * Конфигурация установки 1C:Enterprise или 1C:EDT
 */
export interface InstallationConfig {
  /** Тип устанавливаемого продукта */
  type: 'edt' | 'onec'
  /** Версия продукта для установки */
  version: string
  /** Платформа операционной системы */
  platform: string
  /** Использовать кеш для установленных компонентов */
  useCache: boolean
  /** Использовать кеш для дистрибутивов */
  useCacheDistr: boolean
  /** Имя пользователя для аутентификации на releases.1c.ru */
  username: string
  /** Пароль для аутентификации на releases.1c.ru */
  password: string
}
