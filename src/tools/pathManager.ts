import * as core from '@actions/core'
import { logger } from '../onegetjs/logger'
import path from 'path'
import { findFirstFile } from '../fileLocator'

export class PathManager {
  async addExecutablesToPath(
    searchDir: string,
    executables: string[]
  ): Promise<void> {
    for (const executable of executables) {
      const pattern = `${searchDir}/**/${executable}`
      logger.info(pattern)
      const file = await findFirstFile(pattern)
      if (file) {
        logger.info(`add to PATH ${path.dirname(file)} (${file})`)
        core.addPath(path.dirname(file))
        break
      }
    }
  }
}
