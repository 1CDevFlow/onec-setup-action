/**
 * Unit-тесты для PathManager
 */

import { PathManager } from '../../../src/core/path-manager'
import { IPlatformDetector } from '../../../src/core/interfaces'
import { Logger } from '../../../src/utils/logger'
import * as core from '@actions/core'
import * as glob from '@actions/glob'

// Мокаем зависимости
jest.mock('@actions/core')
jest.mock('@actions/glob')
jest.mock('../../../src/utils/logger')

describe('PathManager', () => {
  let pathManager: PathManager
  let mockPlatformDetector: jest.Mocked<IPlatformDetector>
  let mockLogger: jest.Mocked<Logger>

  beforeEach(() => {
    jest.clearAllMocks()

    mockPlatformDetector = {
      getPlatformType: jest.fn(),
      isWindows: jest.fn(),
      isLinux: jest.fn(),
      isMac: jest.fn()
    }

    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      setFailed: jest.fn()
    } as jest.Mocked<Logger>

    // Мокаем addPath
    ;(core.addPath as jest.Mock).mockImplementation(() => {})

    // Мокаем glob
    const mockGlobber = {
      globGenerator: jest.fn().mockReturnValue([])
    }
    ;(glob.create as jest.Mock).mockResolvedValue(mockGlobber)
  })

  describe('Windows platform', () => {
    beforeEach(() => {
      mockPlatformDetector.isWindows.mockReturnValue(true)
      mockPlatformDetector.isLinux.mockReturnValue(false)
      mockPlatformDetector.isMac.mockReturnValue(false)
    })

    describe('EDT type', () => {
      beforeEach(() => {
        pathManager = new PathManager(mockPlatformDetector, 'edt', mockLogger)
      })

      it('should return correct cache directories for EDT on Windows', () => {
        const result = pathManager.getCacheDirectories()

        expect(result).toEqual([
          'C:/Program Files/1C',
          'C:/ProgramData/1C/1CE/ring-commands.cfg'
        ])
      })

      it('should return correct installer cache path for EDT on Windows', () => {
        const result = pathManager.getInstallerCachePath()

        expect(result).toBe('/tmp/installer')
      })

      it('should return correct executable names for EDT on Windows', () => {
        const result = pathManager.getExecutableNames()

        expect(result).toEqual(['ring.bat', '1cedtcli.bat'])
      })

      it('should update PATH correctly for EDT on Windows', async () => {
        // Мокаем glob для возврата найденного файла
        const mockGlobber = {
          globGenerator: jest
            .fn()
            .mockReturnValue(['C:/Program Files/1C/1CE/ring/bin/ring.bat'])
        }
        ;(glob.create as jest.Mock).mockResolvedValue(mockGlobber)

        await pathManager.updatePath()

        expect(glob.create).toHaveBeenCalledWith(
          'C:/Program Files/1C/**/ring.bat'
        )
        expect(core.addPath).toHaveBeenCalledWith(
          'C:/Program Files/1C/1CE/ring/bin'
        )
      })
    })

    describe('OneC type', () => {
      beforeEach(() => {
        pathManager = new PathManager(mockPlatformDetector, 'onec', mockLogger)
      })

      it('should return correct cache directories for OneC on Windows', () => {
        const result = pathManager.getCacheDirectories()

        expect(result).toEqual(['C:/Program Files/1cv8'])
      })

      it('should return correct executable names for OneC on Windows', () => {
        const result = pathManager.getExecutableNames()

        expect(result).toEqual(['1cv8.exe'])
      })

      it('should update PATH correctly for OneC on Windows', async () => {
        // Мокаем glob для возврата найденного файла
        const mockGlobber = {
          globGenerator: jest
            .fn()
            .mockReturnValue(['C:/Program Files/1cv8/bin/1cv8.exe'])
        }
        ;(glob.create as jest.Mock).mockResolvedValue(mockGlobber)

        await pathManager.updatePath()

        expect(glob.create).toHaveBeenCalledWith(
          'C:/Program Files/1cv8/**/1cv8.exe'
        )
        expect(core.addPath).toHaveBeenCalledWith('C:/Program Files/1cv8/bin')
      })
    })
  })

  describe('Linux platform', () => {
    beforeEach(() => {
      mockPlatformDetector.isWindows.mockReturnValue(false)
      mockPlatformDetector.isLinux.mockReturnValue(true)
      mockPlatformDetector.isMac.mockReturnValue(false)
    })

    describe('EDT type', () => {
      beforeEach(() => {
        pathManager = new PathManager(mockPlatformDetector, 'edt', mockLogger)
      })

      it('should return correct cache directories for EDT on Linux', () => {
        const result = pathManager.getCacheDirectories()

        expect(result).toEqual(['/opt/1C', '/etc/1C/1CE/ring-commands.cfg'])
      })

      it('should return correct executable names for EDT on Linux', () => {
        const result = pathManager.getExecutableNames()

        expect(result).toEqual(['ring', '1cedtcli.sh'])
      })

      it('should update PATH correctly for EDT on Linux', async () => {
        // Мокаем glob для возврата найденного файла
        const mockGlobber = {
          globGenerator: jest
            .fn()
            .mockReturnValue(['/opt/1C/1CE/ring/bin/ring'])
        }
        ;(glob.create as jest.Mock).mockResolvedValue(mockGlobber)

        await pathManager.updatePath()

        expect(glob.create).toHaveBeenCalledWith('/opt/1C/**/ring')
        expect(core.addPath).toHaveBeenCalledWith('/opt/1C/1CE/ring/bin')
      })
    })

    describe('OneC type', () => {
      beforeEach(() => {
        pathManager = new PathManager(mockPlatformDetector, 'onec', mockLogger)
      })

      it('should return correct cache directories for OneC on Linux', () => {
        const result = pathManager.getCacheDirectories()

        expect(result).toEqual(['/opt/1cv8'])
      })

      it('should return correct executable names for OneC on Linux', () => {
        const result = pathManager.getExecutableNames()

        expect(result).toEqual(['1cv8'])
      })

      it('should update PATH correctly for OneC on Linux', async () => {
        // Мокаем glob для возврата найденного файла
        const mockGlobber = {
          globGenerator: jest.fn().mockReturnValue(['/opt/1cv8/bin/1cv8'])
        }
        ;(glob.create as jest.Mock).mockResolvedValue(mockGlobber)

        await pathManager.updatePath()

        expect(glob.create).toHaveBeenCalledWith('/opt/1cv8/**/1cv8')
        expect(core.addPath).toHaveBeenCalledWith('/opt/1cv8/bin')
      })
    })
  })

  describe('macOS platform', () => {
    beforeEach(() => {
      mockPlatformDetector.isWindows.mockReturnValue(false)
      mockPlatformDetector.isLinux.mockReturnValue(false)
      mockPlatformDetector.isMac.mockReturnValue(true)
    })

    describe('EDT type', () => {
      beforeEach(() => {
        pathManager = new PathManager(mockPlatformDetector, 'edt', mockLogger)
      })

      it('should return correct cache directories for EDT on macOS', () => {
        const result = pathManager.getCacheDirectories()

        expect(result).toEqual(['/Applications/1C'])
      })

      it('should update PATH correctly for EDT on macOS', async () => {
        // Мокаем glob для возврата найденного файла
        const mockGlobber = {
          globGenerator: jest
            .fn()
            .mockReturnValue(['/Applications/1C/1CE/ring/bin/ring'])
        }
        ;(glob.create as jest.Mock).mockResolvedValue(mockGlobber)

        await pathManager.updatePath()

        expect(glob.create).toHaveBeenCalledWith('/Applications/1C/**/ring')
        expect(core.addPath).toHaveBeenCalledWith(
          '/Applications/1C/1CE/ring/bin'
        )
      })
    })

    describe('OneC type', () => {
      beforeEach(() => {
        pathManager = new PathManager(mockPlatformDetector, 'onec', mockLogger)
      })

      it('should return correct cache directories for OneC on macOS', () => {
        const result = pathManager.getCacheDirectories()

        expect(result).toEqual(['/Applications/1cv8'])
      })

      it('should update PATH correctly for OneC on macOS', async () => {
        // Мокаем glob для возврата найденного файла
        const mockGlobber = {
          globGenerator: jest
            .fn()
            .mockReturnValue(['/Applications/1cv8/bin/1cv8'])
        }
        ;(glob.create as jest.Mock).mockResolvedValue(mockGlobber)

        await pathManager.updatePath()

        expect(glob.create).toHaveBeenCalledWith('/Applications/1cv8/**/1cv8')
        expect(core.addPath).toHaveBeenCalledWith('/Applications/1cv8/bin')
      })
    })
  })
})
