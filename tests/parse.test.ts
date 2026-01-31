import { versions } from '../src/onegetjs/parse'

describe('parse.ts', () => {
  it('should parse versions from HTML', () => {
    const html = `
      <table>
        <tr>
          <td class="versionColumn">
            <a href="/version/8.3.25.1286">8.3.25.1286</a>
          </td>
        </tr>
        <tr>
          <td class="versionColumn">
            <a href="/version/8.3.24.1500">8.3.24.1500</a>
          </td>
        </tr>
      </table>
    `

    const result = versions(html)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('8.3.25.1286')
    expect(result[1].name).toBe('8.3.24.1500')
  })
})
