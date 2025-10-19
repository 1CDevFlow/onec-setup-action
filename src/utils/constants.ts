/**
 * Константы для проекта onec-setup-action
 */

// URL-адреса
export const RELEASES_URL = 'https://releases.1c.ru'
export const LOGIN_URL = 'https://login.1c.ru'
export const TICKET_URL = `${LOGIN_URL}/rest/public/ticket/get`
export const PROJECTS_URL = '/project/'

// Платформы
export const PLATFORM_WIN = 'win32'
export const PLATFORM_LIN = 'linux'
export const PLATFORM_MAC = 'darwin'

// Архитектуры
export const WINDOWS_ARCHS = ['x86', 'x64']
export const WINDOWS_PLATFORMS = ['win32', 'win64']

// Кеш
export const CACHE_KEY_PREFIX = 'setup'
export const INSTALLER_CACHE_PRIMARY_KEY = 'installer'

// Проекты
export const PROJECT_PLATFORM83 = 'Platform83'
export const PROJECT_DEVELOPMENT_TOOLS = 'DevelopmentTools10'

// Таймауты (в миллисекундах)
export const DEFAULT_TIMEOUT = 30000
export const DOWNLOAD_TIMEOUT = 60000
export const INSTALL_TIMEOUT = 300000

// Пути установки
export const WINDOWS_INSTALL_PATH = 'C:/Program Files/1cv8'
export const LINUX_INSTALL_PATH = '/opt/1cv8'
export const MAC_INSTALL_PATH = '/opt/1cv8'

// Имена исполняемых файлов
export const WINDOWS_EXECUTABLE = '1cv8.exe'
export const LINUX_EXECUTABLE = '1cv8'
export const EDT_WINDOWS_EXECUTABLES = ['ring.bat', '1cedtcli.bat']
export const EDT_LINUX_EXECUTABLES = ['ring', '1cedtcli.sh']

// Кеш директории для EDT
export const EDT_WINDOWS_CACHE_DIRS = [
  'C:/Program Files/1C',
  'C:/ProgramData/1C/1CE/ring-commands.cfg'
]
export const EDT_LINUX_CACHE_DIRS = ['/opt/1C', '/etc/1C/1CE/ring-commands.cfg']
export const EDT_MAC_CACHE_DIRS = ['/Applications/1C']

// Кеш директории для OneC
export const ONEC_WINDOWS_CACHE_DIRS = ['C:/Program Files/1cv8']
export const ONEC_LINUX_NEW_CACHE_DIRS = ['/opt/1cv8']
export const ONEC_LINUX_OLD_CACHE_DIRS = ['/opt/1C/v8.3']
export const ONEC_MAC_CACHE_DIRS = ['/Applications/1cv8']

// Исполняемые файлы для EDT (алиасы для совместимости)
export const EDT_RUN_FILES_WINDOWS = EDT_WINDOWS_EXECUTABLES
export const EDT_RUN_FILES_LINUX = EDT_LINUX_EXECUTABLES

// Исполняемые файлы для OneC
export const ONEC_RUN_FILES_WINDOWS = ['1cv8.exe']
export const ONEC_RUN_FILES_LINUX = ['1cv8']

// Версии по умолчанию
export const DEFAULT_EDT_VERSION = '2024.2.6'
export const DEFAULT_ONEC_VERSION = '8.3.20.1549'

// Типы дистрибутивов
export const DISTRIBUTIVE_TYPES = {
  FULL: 'full',
  THIN_CLIENT: 'thinClient',
  SERVER: 'server',
  CLIENT: 'client',
  CLIENT_OR_SERVER: 'clientOrServer'
} as const

// Операционные системы
export const OS_NAMES = {
  WIN: 'win',
  MAC: 'mac',
  LINUX: 'linux',
  DEB: 'deb',
  RPM: 'rpm'
} as const

// Архитектуры
export const ARCHITECTURES = {
  X86: 'x86',
  X64: 'x64'
} as const
