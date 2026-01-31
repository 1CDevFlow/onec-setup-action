/**
 * Unit tests for the action's entrypoint, src/index.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as installer from '../src/installer'
import * as dotenv from 'dotenv'

// Mock the GitHub Actions core library
const getInputMock = jest.spyOn(core, 'getInput')
const getBooleanInput = jest.spyOn(core, 'getBooleanInput')

// Mock the action's entrypoint
const runMock = jest.spyOn(installer, 'run')

// Other utilities
const TIMEOUT = 50000

type Input = { [key: string]: string }

function configureInput(input: Input): void {
  // Set the action's inputs as return values from core.getInput()
  getInputMock.mockImplementation((name: string): string => {
    return input[name]
  })
  getBooleanInput.mockImplementation((name: string): boolean => {
    return input[name] === 'true'
  })
}

describe('action', () => {
  dotenv.config()
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it(
    'Download EDT',
    async () => {
      const input: Input = {
        type: 'edt',
        edt_version: '2023.1.2',
        offline: 'true'
      }

      configureInput(input)

      await installer.run()
      expect(runMock).toHaveReturned()
    },
    TIMEOUT
  )

  it(
    'Install 1C:Enterprise v. 8.3.14.2095',
    async () => {
      const input: Input = {
        type: 'onec',
        onec_version: '8.3.14.2095'
      }

      configureInput(input)

      await installer.run()
      expect(runMock).toHaveReturned()
    },
    TIMEOUT * 10
  )
  it(
    'Install 1C:Enterprise v. 8.3.10.2580',
    async () => {
      const input: Input = {
        type: 'onec',
        onec_version: '8.3.10.2580'
      }

      configureInput(input)

      await installer.run()
      expect(runMock).toHaveReturned()
    },
    TIMEOUT * 10
  )
})
