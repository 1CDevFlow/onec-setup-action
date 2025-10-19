import { InputValidator } from '../../src/validators/input-validator'
import { ValidationError } from '../../src/errors/base-errors'

describe('InputValidator', () => {
  let validator: InputValidator

  beforeEach(() => {
    validator = new InputValidator()
  })

  describe('validateType', () => {
    it('should accept valid types', () => {
      expect(() => validator.validateType('edt')).not.toThrow()
      expect(() => validator.validateType('onec')).not.toThrow()
    })

    it('should throw ValidationError for empty type', () => {
      expect(() => validator.validateType('')).toThrow(ValidationError)
      expect(() => validator.validateType('')).toThrow('Type is required')
    })

    it('should throw ValidationError for invalid type', () => {
      expect(() => validator.validateType('invalid')).toThrow(
        ValidationError
      )
      expect(() => validator.validateType('invalid')).toThrow(
        "Invalid type: invalid. Must be 'edt' or 'onec'"
      )
    })
  })

  describe('validateEdtVersion', () => {
    it('should accept valid EDT versions', () => {
      expect(() => validator.validateEdtVersion('2024.2.6')).not.toThrow()
      expect(() => validator.validateEdtVersion('2023.1.2')).not.toThrow()
      expect(() => validator.validateEdtVersion('2022.12.1')).not.toThrow()
    })

    it('should throw ValidationError for empty version', () => {
      expect(() => validator.validateEdtVersion('')).toThrow(
        ValidationError
      )
      expect(() => validator.validateEdtVersion('')).toThrow(
        'EDT version is required when type is "edt"'
      )
    })

    it('should throw ValidationError for invalid format', () => {
      expect(() => validator.validateEdtVersion('2024.2')).toThrow(
        ValidationError
      )
      expect(() => validator.validateEdtVersion('2024.2.6.1')).toThrow(
        ValidationError
      )
      expect(() => validator.validateEdtVersion('v2024.2.6')).toThrow(
        ValidationError
      )
      expect(() => validator.validateEdtVersion('2024-2-6')).toThrow(
        ValidationError
      )
    })
  })

  describe('validateOnecVersion', () => {
    it('should accept valid OneC versions', () => {
      expect(() =>
        validator.validateOnecVersion('8.3.20.1549')
      ).not.toThrow()
      expect(() =>
        validator.validateOnecVersion('8.3.14.2095')
      ).not.toThrow()
      expect(() =>
        validator.validateOnecVersion('8.3.10.2580')
      ).not.toThrow()
    })

    it('should throw ValidationError for empty version', () => {
      expect(() => validator.validateOnecVersion('')).toThrow(
        ValidationError
      )
      expect(() => validator.validateOnecVersion('')).toThrow(
        'OneC version is required when type is "onec"'
      )
    })

    it('should throw ValidationError for invalid format', () => {
      expect(() => validator.validateOnecVersion('8.3.20')).toThrow(
        ValidationError
      )
      expect(() => validator.validateOnecVersion('8.3.20.1549.1')).toThrow(
        ValidationError
      )
      expect(() => validator.validateOnecVersion('v8.3.20.1549')).toThrow(
        ValidationError
      )
      expect(() => validator.validateOnecVersion('8-3-20-1549')).toThrow(
        ValidationError
      )
    })
  })

  describe('validateBoolean', () => {
    it('should accept valid boolean values', () => {
      expect(() => validator.validateBoolean('true', 'test')).not.toThrow()
      expect(() =>
        validator.validateBoolean('false', 'test')
      ).not.toThrow()
      expect(() => validator.validateBoolean('TRUE', 'test')).not.toThrow()
      expect(() =>
        validator.validateBoolean('FALSE', 'test')
      ).not.toThrow()
    })

    it('should accept empty string', () => {
      expect(() => validator.validateBoolean('', 'test')).not.toThrow()
    })

    it('should throw ValidationError for invalid boolean values', () => {
      expect(() => validator.validateBoolean('yes', 'test')).toThrow(
        ValidationError
      )
      expect(() => validator.validateBoolean('no', 'test')).toThrow(
        ValidationError
      )
      expect(() => validator.validateBoolean('1', 'test')).toThrow(
        ValidationError
      )
      expect(() => validator.validateBoolean('0', 'test')).toThrow(
        ValidationError
      )
    })
  })

  describe('validateCredentials', () => {
    it('should accept valid credentials', () => {
      expect(() =>
        validator.validateCredentials('user', 'pass')
      ).not.toThrow()
      expect(() =>
        validator.validateCredentials('admin', 'secret123')
      ).not.toThrow()
    })

    it('should throw ValidationError for missing username', () => {
      expect(() => validator.validateCredentials('', 'pass')).toThrow(
        ValidationError
      )
      expect(() => validator.validateCredentials('', 'pass')).toThrow(
        'ONEC_USERNAME and ONEC_PASSWORD environment variables are required'
      )
    })

    it('should throw ValidationError for missing password', () => {
      expect(() => validator.validateCredentials('user', '')).toThrow(
        ValidationError
      )
      expect(() => validator.validateCredentials('user', '')).toThrow(
        'ONEC_USERNAME and ONEC_PASSWORD environment variables are required'
      )
    })

    it('should throw ValidationError for whitespace-only credentials', () => {
      expect(() => validator.validateCredentials('   ', 'pass')).toThrow(
        ValidationError
      )
      expect(() => validator.validateCredentials('user', '   ')).toThrow(
        ValidationError
      )
    })
  })

  describe('validateAll', () => {
    it('should validate all inputs for EDT type', () => {
      const inputs = {
        type: 'edt',
        edt_version: '2024.2.6',
        username: 'user',
        password: 'pass'
      }
      expect(() => validator.validateAll(inputs)).not.toThrow()
    })

    it('should validate all inputs for OneC type', () => {
      const inputs = {
        type: 'onec',
        onec_version: '8.3.20.1549',
        username: 'user',
        password: 'pass'
      }
      expect(() => validator.validateAll(inputs)).not.toThrow()
    })

    it('should use default versions when not provided', () => {
      const inputs = {
        type: 'edt',
        username: 'user',
        password: 'pass'
      }
      expect(() => validator.validateAll(inputs)).not.toThrow()
    })

    it('should validate boolean inputs', () => {
      const inputs = {
        type: 'onec',
        onec_version: '8.3.20.1549',
        cache: 'true',
        cache_distr: 'false',
        username: 'user',
        password: 'pass'
      }
      expect(() => validator.validateAll(inputs)).not.toThrow()
    })

    it('should throw ValidationError for invalid boolean inputs', () => {
      const inputs = {
        type: 'onec',
        onec_version: '8.3.20.1549',
        cache: 'yes',
        username: 'user',
        password: 'pass'
      }
      expect(() => validator.validateAll(inputs)).toThrow(ValidationError)
    })
  })
})
