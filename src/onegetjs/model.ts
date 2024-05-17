export interface Version {
    name: string,
    url: string,
    files: ReleaseFile[]
}

export interface ReleaseFile {
    name: string,
    url: string
}

export type OSName = 'win' | 'mac' | 'linux' | 'deb' | 'rpm';
export type ArchitectureName = 'x86' | 'x64'
export type DistributiveType = 'full' | 'thinClient' | 'server' | 'client'

