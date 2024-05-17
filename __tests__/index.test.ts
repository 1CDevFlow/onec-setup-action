/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as core from '@actions/core'
import * as index from '../src/index'

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug')
const getInputMock = jest.spyOn(core, 'getInput')
const getBooleanInput = jest.spyOn(core, 'getBooleanInput')
const setFailedMock = jest.spyOn(core, 'setFailed')
const setOutputMock = jest.spyOn(core, 'setOutput')
// Mock the action's entrypoint
const runMock = jest.spyOn(index, 'run')

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

describe('action', () => {
  // We need to copy/restore the whole property definition, not just the raw value
  const realPlatform = Object.getOwnPropertyDescriptor(process, 'platform')

  beforeEach(() => {
    jest.clearAllMocks()
  })
  afterEach(() => {
    if (!realPlatform) {
      return
    }
    // Restore the real property value after each test
    Object.defineProperty(process, 'platform', realPlatform)
  })

  it("prints default (on my laptop, 'darwin' - this test will fail if running on linux", () => {
    expect(process.platform).toBe('darwin')
  })

  getBooleanInput.mockImplementation((name: string)=> {
    return true;
  })
  it('sets the time output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'milliseconds':
          return '500'
        default:
          return ''
      }
    })

    await index.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(1, 'Waiting 500 milliseconds ...')
    expect(debugMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(timeRegex)
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(timeRegex)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'time',
      expect.stringMatching(timeRegex)
    )
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'milliseconds':
          return 'this is not a number'
        case 'cache':
          return 'true';
          default:
          return ''
      }
    })

describe('index', () => {
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/index')

    expect(runMock).toHaveBeenCalled()
  })
})
