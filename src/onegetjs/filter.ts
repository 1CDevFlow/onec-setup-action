import { ReleaseFile, ArtifactFilter } from './model'

const x64Pattern = /.*(\(64-bit\)|\(64 бит\)).*/
const rpmPattern = /.+RPM.+(ОС Linux|для Linux$|Linux-систем$).*/
const debPattern = /.+DEB.+(ОС Linux|для Linux$|Linux-систем$).*/
const linuxPattern = /.*(ОС Linux|для Linux$|Linux-систем$).*/
const windowsPattern = /.*(ОС Windows|для Windows$|для Windows\\s\\+).*/
const osxPattern = /.+(OS X|для macOS)$/
const clientPattern = /^Клиент.+/
const serverPattern = /^[Cервер|Сервер].+/
const thinPattern = /^Тонкий клиент.+/
const fullPattern = /^Технологическая платформа.+/
const offlinePattern = /.+(без интернета|оффлайн).*/

type Predicate = (value: string) => unknown

export function getFilters(artifactFilter: ArtifactFilter): Predicate[] {
  const filters = new Array<Predicate>()
  switch (artifactFilter.osName) {
    case 'win':
      filters.push(windowsPattern.test.bind(windowsPattern))
      break
    case 'mac':
      filters.push(osxPattern.test.bind(osxPattern))
      break
    case 'linux':
      filters.push(linuxPattern.test.bind(linuxPattern))
      break
    case 'deb':
      filters.push(debPattern.test.bind(debPattern))
      break
    case 'rpm':
      filters.push(rpmPattern.test.bind(rpmPattern))
      break
  }

  switch (artifactFilter.architecture) {
    case 'x86':
      filters.push(v => !x64Pattern.test(v))
      break
    case 'x64':
      filters.push(x64Pattern.test.bind(x64Pattern))
      break
  }
  switch (artifactFilter.type) {
    case 'full':
      filters.push(fullPattern.test.bind(fullPattern))
      break
    case 'server':
      filters.push(serverPattern.test.bind(serverPattern))
      break
    case 'client':
      filters.push(clientPattern.test.bind(clientPattern))
      break
    case 'thinClient':
      filters.push(thinPattern.test.bind(thinPattern))
      break
  }

  if (artifactFilter.offline === true) {
    filters.push(offlinePattern.test.bind(offlinePattern))
  } else {
    filters.push(v => !offlinePattern.test(v))
  }

  return filters
}

export function filter(
  files: ReleaseFile[],
  filters: Predicate[]
): ReleaseFile[] {
  return files.filter(file => {
    const failure = filters.find(f => !f(file.name))
    return failure === undefined
  })
}
