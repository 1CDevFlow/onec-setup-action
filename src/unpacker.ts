import * as tc from '@actions/tool-cache'
import { exec } from '@actions/exec'
import * as core from '@actions/core'
import * as io from '@actions/io'

export async function unpack(file: string, destination: string): Promise<void> {
  core.info(`Unpack ${file} to ${destination}`)

  // Убеждаемся, что директория назначения существует
  await io.mkdirP(destination)

  if (file.endsWith('.zip')) {
    await tc.extractZip(file, destination)
  } else if (file.endsWith('.tar') || file.endsWith('.tar.gz')) {
    // Используем системный tar для лучшего контроля
    await exec('tar', [
      'xz',
      '--warning=no-unknown-keyword',
      '--overwrite',
      '-C',
      destination,
      '-f',
      file
    ])
  } else if (file.endsWith('.rar')) {
    // 7z может завершиться с ошибкой, но частично распаковать файлы
    await exec('7z', ['x', file, `-o${destination}`, '-y'])
  } else {
    throw new Error(`Unsupported archive format: ${file}`)
  }
}

export async function unpackFiles(
  files: string[],
  destination: string
): Promise<void> {
  for (const file of files) {
    await unpack(file, destination)
  }
}
