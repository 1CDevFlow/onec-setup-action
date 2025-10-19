/**
 * Менеджер путей для onec-setup-action
 */

import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as path from 'path'
import { IPathManager, IPlatformDetector } from './interfaces'
import { Logger } from '../utils/logger'
import {
  EDT_WINDOWS_CACHE_DIRS,
  EDT_LINUX_CACHE_DIRS,
  EDT_MAC_CACHE_DIRS,
  ONEC_WINDOWS_CACHE_DIRS,
  ONEC_LINUX_NEW_CACHE_DIRS,
  ONEC_LINUX_OLD_CACHE_DIRS,
  ONEC_MAC_CACHE_DIRS,
  EDT_RUN_FILES_WINDOWS,
  EDT_RUN_FILES_LINUX,
  ONEC_RUN_FILES_WINDOWS,
  ONEC_RUN_FILES_LINUX
} from '../utils/constants'

/**
 * Тип инструмента
 */
export type ToolType = 'edt' | 'onec'

/**
 * Реализация менеджера путей
 */
export class PathManager implements IPathManager {
  private platformDetector: IPlatformDetector
  private toolType: ToolType
  private logger: Logger

  constructor(
    platformDetector: IPlatformDetector,
    toolType: ToolType,
    logger: Logger
  ) {
    this.platformDetector = platformDetector
    this.toolType = toolType
    this.logger = logger
  }

  /**
   * Получает пути кеша для установленного инструмента
   */
  getCacheDirectories(): string[] {
    if (this.toolType === 'edt') {
      return this.getEdtCacheDirectories()
    } else {
      return this.getOnecCacheDirectories()
    }
  }

  /**
   * Получает пути кеша для установщика
   */
  getInstallerCachePath(): string {
    return `/tmp/installer`
  }

  /**
   * Получает имена исполняемых файлов
   */
  getExecutableNames(): string[] {
    if (this.toolType === 'edt') {
      return this.getEdtExecutableNames()
    } else {
      return this.getOnecExecutableNames()
    }
  }

  /**
   * Обновляет переменную PATH
   */
  async updatePath(): Promise<void> {
    const cacheDirs = this.getCacheDirectories()
    const executableNames = this.getExecutableNames()

    for (const executableName of executableNames) {
      const pattern = `${cacheDirs[0]}/**/${executableName}`
      this.logger.debug(`Searching for executable: ${pattern}`)

      const globber = await glob.create(pattern)
      for await (const file of globber.globGenerator()) {
        const dirPath = path.dirname(file)
        this.logger.info(`Adding to PATH: ${dirPath} (${file})`)
        core.addPath(dirPath)
        break // Добавляем только первый найденный путь
      }
    }
  }

  /**
   * Получает пути кеша для EDT
   */
  private getEdtCacheDirectories(): string[] {
    if (this.platformDetector.isWindows()) {
      return EDT_WINDOWS_CACHE_DIRS
    } else if (this.platformDetector.isLinux()) {
      return EDT_LINUX_CACHE_DIRS
    } else if (this.platformDetector.isMac()) {
      return EDT_MAC_CACHE_DIRS
    }
    return []
  }

  /**
   * Получает пути кеша для OneC
   */
  private getOnecCacheDirectories(): string[] {
    if (this.platformDetector.isWindows()) {
      return ONEC_WINDOWS_CACHE_DIRS
    } else if (this.platformDetector.isLinux()) {
      // Для Linux нужно определить, новая или старая версия
      // Пока используем новую версию
      return ONEC_LINUX_NEW_CACHE_DIRS
    } else if (this.platformDetector.isMac()) {
      return ONEC_MAC_CACHE_DIRS
    }
    return []
  }

  /**
   * Получает имена исполняемых файлов для EDT
   */
  private getEdtExecutableNames(): string[] {
    if (this.platformDetector.isWindows()) {
      return EDT_RUN_FILES_WINDOWS
    } else {
      return EDT_RUN_FILES_LINUX
    }
  }

  /**
   * Получает имена исполняемых файлов для OneC
   */
  private getOnecExecutableNames(): string[] {
    if (this.platformDetector.isWindows()) {
      return ONEC_RUN_FILES_WINDOWS
    } else {
      return ONEC_RUN_FILES_LINUX
    }
  }
}
