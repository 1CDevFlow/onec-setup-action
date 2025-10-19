/**
 * Моки для @actions/cache
 */
export const mockCache = {
  saveCache: jest.fn(),
  restoreCache: jest.fn(),
  isFeatureAvailable: jest.fn(() => true)
}

// Автоматически мокаем @actions/cache
jest.mock('@actions/cache', () => mockCache)
