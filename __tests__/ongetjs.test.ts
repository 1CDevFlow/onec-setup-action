import OneGet from '../src/onegetjs'
import { Version } from '../src/onegetjs/model';

describe('onegetjs', () => {
    const client = new OneGet('Delovye_linii', 'srpo2017', '/tmp/oneget')

    // it('versionInfo', async () => {
    //     await client.auth()
    //     await client.versionInfo('Platform83', '8.3.10.2580');
    // })

    it('download', async () => {
        await client.auth()
        const version = await client.versionInfo('Platform83', '8.3.10.2580');
        await client.download(version, 'deb', 'x64', 'client')
    })
});
