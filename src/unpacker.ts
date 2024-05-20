import * as tc from '@actions/tool-cache'
import { exec } from '@actions/exec'

export async function unpack(file: string, destination: string): Promise<void> {
  if (file.endsWith('.zip')) {
    await tc.extractZip(file, destination)
  } else if (file.endsWith('.tar') || file.endsWith('.tar.gz')) {
    await tc.extractTar(file, destination)
  } else if (file.endsWith('.rar')) {
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
