import { downloadRelease } from '../src/onegetjs'

const TIMEOUT = 500000

describe('onegetjs', () => {
  // const client = new OneGet('/tmp/oneget')
  //
  // it('versionInfo', async () => {
  //     await client.auth()
  //     await client.versionInfo('Platform83', '8.3.10.2580');
  // })

  // it('download old', async () => {
  //     await client.auth()
  //     const version = await client.versionInfo('Platform83', '8.3.10.2580');
  //     await client.download(version, 'deb', 'x64', 'client')
  // })
  // it('download new', async () => {
  //     await client.auth()
  //     const version = await client.versionInfo('Platform83', '8.3.25.1286');
  //     await client.download(version, 'linux', 'x64', 'full')
  // })

  // it('windows', async () => {
  //     await client.auth()
  //     const version = await client.versionInfo('Platform83', '8.3.10.2580');
  //     await client.download(version, 'win', 'x86', 'full')
  // })

  it(
    'downloadRelease',
    async () => {
      await downloadRelease(
        {
          project: 'Platform83',
          version: '8.3.10.2580',
          osName: 'deb',
          architecture: 'x64',
          type: 'clientOrServer'
        },
        '/tmp/oneget/test',
        true
      )
    },
    TIMEOUT
  )

  it(
    'downloadRelease EDT',
    async () => {
      await downloadRelease(
        {
          project: 'DevelopmentTools10',
          version: '2023.1.2',
          osName: 'linux',
          offline: true
        },
        '/tmp/oneget/test',
        true
      )
    },
    TIMEOUT
  )
})
