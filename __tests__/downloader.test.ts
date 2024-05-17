import * as core from '@actions/core'
import {Client} from '../src/onegetjs/downloader'

describe('downloader.ts', () => {
    const client = new Client;
    it('auth', async () => {
        await client.auth();
    })
});
