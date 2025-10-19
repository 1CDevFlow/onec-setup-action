/**
 * Основные компоненты архитектуры onec-setup-action
 */

// Интерфейсы
export * from './interfaces'

// Основные компоненты
export { CacheManager } from './cache-manager'
export { PlatformDetector } from './platform-detector'
export { PathManager } from './path-manager'
export { BaseInstaller } from './base-installer'
export { InstallerFactory } from './installer-factory'
export { InstallationService } from './installation-service'

// Утилиты
export { restoreCacheByPrimaryKey } from './cache-manager'
