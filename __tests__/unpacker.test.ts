import * as unpacker from '../src/unpacker'

describe('unpacker.ts', () => {
  it('unpack', async () => {
    await unpacker.unpack('/tmp/oneget/windows.rar', '/tmp/oneget/')
  })
})
