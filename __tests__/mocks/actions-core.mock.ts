/**
 * Моки для @actions/core
 */
export const mockCore = {
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  addPath: jest.fn(),
  exportVariable: jest.fn(),
  setSecret: jest.fn(),
  isDebug: jest.fn(() => false)
}

// Экспортируем отдельные функции для удобства
export const getInput = mockCore.getInput
export const getBooleanInput = mockCore.getBooleanInput
export const setOutput = mockCore.setOutput
export const setFailed = mockCore.setFailed
export const info = mockCore.info
export const debug = mockCore.debug
export const warning = mockCore.warning
export const error = mockCore.error
export const addPath = mockCore.addPath
export const exportVariable = mockCore.exportVariable
export const setSecret = mockCore.setSecret
export const isDebug = mockCore.isDebug

// Автоматически мокаем @actions/core
jest.mock('@actions/core', () => mockCore)
