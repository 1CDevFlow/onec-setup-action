/**
 * Моки для @actions/exec
 */
export const mockExec = {
  exec: jest.fn()
}

// Автоматически мокаем @actions/exec
jest.mock('@actions/exec', () => mockExec)
