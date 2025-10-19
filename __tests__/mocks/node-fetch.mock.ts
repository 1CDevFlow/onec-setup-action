/**
 * Моки для node-fetch
 */
export const mockFetch = jest.fn()

// Создаем мок Response
export const createMockResponse = (
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
) => ({
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {
    get: jest.fn((name: string) => headers[name] || null)
  },
  text: jest
    .fn()
    .mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  json: jest
    .fn()
    .mockResolvedValue(typeof body === 'object' ? body : JSON.parse(body)),
  body: {
    pipe: jest.fn(),
    on: jest.fn()
  }
})

// Автоматически мокаем node-fetch
jest.mock('node-fetch', () => mockFetch)
