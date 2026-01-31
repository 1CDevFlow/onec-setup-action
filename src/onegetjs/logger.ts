import * as core from '@actions/core'

export type Logger = {
  warning: (msg: string) => void
  info: (msg: string) => void
  error: (msg: string) => void
  debug: (msg: string) => void
}

class StaticLogger implements Logger {
  warning(msg: string): void {
    core.warning(msg)
  }

  info(msg: string): void {
    core.info(msg)
  }

  error(msg: string): void {
    core.error(msg)
  }

  debug(msg: string): void {
    core.debug(msg)
  }
}

export const logger = new StaticLogger()
