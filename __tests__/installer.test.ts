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
const TIMEOUT = 1000000 // 16+ минут для медленных загрузок

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

  // Проверяем наличие учетных данных
  const login = process.env.ONEC_USERNAME ?? ''
  const password = process.env.ONEC_PASSWORD ?? ''
  const shouldSkip = !login || !password

  if (shouldSkip) {
    console.log(
      'Skipping installer integration tests: ONEC_USERNAME and ONEC_PASSWORD not set'
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it(
    'Download EDT',
    async () => {
      if (shouldSkip) {
        console.log('Skipping Download EDT test: credentials not available')
        return
      }

      const input: Input = {
        type: 'edt',
        edt_version: '2024.2.6',
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
      if (shouldSkip) {
        console.log(
          'Skipping Install 1C:Enterprise v. 8.3.14.2095 test: credentials not available'
        )
        return
      }

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
      if (shouldSkip) {
        console.log(
          'Skipping Install 1C:Enterprise v. 8.3.10.2580 test: credentials not available'
        )
        return
      }

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
