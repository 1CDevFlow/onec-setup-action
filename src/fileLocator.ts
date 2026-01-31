import * as glob from '@actions/glob'

export async function findFiles(pattern: string): Promise<string[]> {
  const globber = await glob.create(pattern)
  return await globber.glob()
}

export async function findFirstFile(
  pattern: string
): Promise<string | undefined> {
  const globber = await glob.create(pattern)
  for await (const file of globber.globGenerator()) {
    return file
  }
  return undefined
}
