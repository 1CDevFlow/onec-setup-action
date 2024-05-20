/**
 * Unit tests for the action's entrypoint, src/index.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as installer from '../src/installer'

// Mock the GitHub Actions core library
const debugMock = jest.spyOn(core, 'debug')
const getInputMock = jest.spyOn(core, 'getInput')
const getBooleanInput = jest.spyOn(core, 'getBooleanInput')
const setFailedMock = jest.spyOn(core, 'setFailed')
const setOutputMock = jest.spyOn(core, 'setOutput')

// Mock the action's entrypoint
const runMock = jest.spyOn(installer, 'run')

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/
const TIMEOUT = 50000

// interface Input {
//     type?: 'edt'|'onec',
//     edt_version?: string,
//     onec_version?: string,
//     cache?: boolean,
//     cache_distr?: boolean
// }

type Input = { [key: string]: string }

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

  it(
    'Download EDT',
    async () => {
      const input: Input = {
        type: 'edt',
        edt_version: '2023.1.2',
        offline: 'true'
      }
      new Map()
      // Set the action's inputs as return values from core.getInput()
      getInputMock.mockImplementation((name: string): string => {
        return input[name]
      })
      getBooleanInput.mockImplementation((name: string): boolean => {
        return input[name] === 'true'
      })

      await installer.run()
      expect(runMock).toHaveReturned()
    },
    TIMEOUT
  )
})
