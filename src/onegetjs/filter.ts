import { ReleaseFile, OSName, ArchitectureName, DistributiveType } from "./model";

const x64Pattern = /.*(\(64\-bit\)|\(64 бит\)).*/
const rpmPattern = /.+RPM.+(ОС Linux|для Linux$|Linux-систем$).*/
const debPattern = /.+DEB.+(ОС Linux|для Linux$|Linux-систем$).*/
const linuxPattern = /.*(ОС Linux|для Linux$|Linux-систем$).*/
const windowsPattern = /.*(ОС Windows|для Windows$|для Windows\\s\\+).*/
const osxPattern = /.+(OS X|для macOS)$/
const clientPattern = /^Клиент.+/
const serverPattern = /^[Cервер|Сервер].+/
const thinPattern = /^Тонкий клиент.+/
const fullPattern = /^Технологическая платформа.+/

type Predicate = (value: string) => unknown

export function getFilters(osName: OSName, architecture: ArchitectureName, type: DistributiveType): Predicate[] {
    let filters = new Array<Predicate>
    switch (osName) {
        case "win":
            filters.push(windowsPattern.test.bind(windowsPattern))
            break;
        case "mac":
            filters.push(osxPattern.test.bind(osxPattern))
            break;
        case "linux":
            filters.push(linuxPattern.test.bind(linuxPattern))
            break;
        case "deb":
            filters.push(debPattern.test.bind(debPattern))
            break;
        case "rpm":
            filters.push(rpmPattern.test.bind(rpmPattern))
            break;
    }

    switch (architecture) {
        case "x86":
            filters.push(v => !x64Pattern.test(v))
            break;
        case "x64":
            filters.push(x64Pattern.test.bind(x64Pattern))
            break;
    }
    switch (type) {
        case "full":
            filters.push(fullPattern.test.bind(fullPattern))
            break;
        case "server":
            filters.push(serverPattern.test.bind(serverPattern))
            break;
        case "client":
            filters.push(clientPattern.test.bind(clientPattern))
            break;
        case "thinClient":
            filters.push(thinPattern.test.bind(thinPattern))
            break;
    }

    return filters
}

export function filter(files: ReleaseFile[], filters: Predicate[]): ReleaseFile[] {
    return files.filter(file => {
        const f = filters.find(
            filter => !filter(file.name))
        return f === undefined
    })
}