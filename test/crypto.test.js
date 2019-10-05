import {
  base64ToBuffer,
  bufferToBase64,
  decrypt,
  deriveAESKey,
  encrypt,
  generateIv,
  generateSalt,
  randomBytes,
} from '../src/crypto-utils.js'

describe('bufferToBase64', () => {
  it('should return a string', () => {
    expect(typeof bufferToBase64(new Uint8Array([1, 2, 3]))).toBe('string')
  })

  it('should be inverse of base64ToBuffer', () => {
    const buffer = new Uint8Array([1, 2, 3])

    expect(base64ToBuffer(bufferToBase64(buffer))).toEqual(buffer)
  })
})

describe('base64ToBuffer', () => {
  it('should return a Uint8Array', () => {
    expect(base64ToBuffer('YWJjZGVm')).toEqual(jasmine.any(Uint8Array))
  })

  it('should be inverse of bufferToBase64', () => {
    const base64String = 'YWJjZGVm'

    expect(bufferToBase64(base64ToBuffer(base64String))).toBe(base64String)
  })
})

describe('randomBytes', () => {
  it('should return a Uint8Array of the given length', () => {
    const size = 6

    expect(randomBytes(size)).toEqual(jasmine.any(Uint8Array))
    expect(randomBytes(size).length).toBe(size)
  })
})

describe('generateSalt', () => {
  it('should return a 32 bytes Uint8Array', () => {
    expect(generateSalt()).toEqual(jasmine.any(Uint8Array))
    expect(generateSalt().length).toBe(32)
  })
})

describe('generateIv', () => {
  it('should return a 12 bytes Uint8Array', () => {
    expect(generateIv()).toEqual(jasmine.any(Uint8Array))
    expect(generateIv().length).toBe(12)
  })
})

describe('deriveAESKey', () => {
  it('should derive a valid 256 bit key for use in AES', async() => {
    const key = await deriveAESKey('pass', generateSalt())

    expect(key.type).toBe('secret')
    expect(key.extractable).toBe(false)
    expect(key.algorithm).toEqual({ name: 'AES-GCM', length: 256 })
    expect(key.usages).toEqual(['encrypt', 'decrypt'])
  })
})

describe('encrypt/decrypt', () => {
  const password = 'pass'
  const salt = generateSalt()

  it('same key', async() => {
    const plaintext = 'sample text'
    const key = await deriveAESKey(password, salt)
    const iv = generateIv()
    const encrypted = await encrypt(plaintext, key, iv)

    expect(await decrypt(encrypted, key, iv)).toBe(plaintext)
  })

  it('wrong password', async() => {
    const plaintext = 'sample text'
    const encKey = await deriveAESKey(password, salt)
    const decKey = await deriveAESKey('wrong pass', salt)
    const iv = generateIv()
    const encrypted = await encrypt(plaintext, encKey, iv)

    try {
      await decrypt(encrypted, decKey, iv)
      fail('should throw')
    } catch (err) {
      expect(err.name).toBe('OperationError')
    }
  })

  it('wrong salt', async() => {
    const plaintext = 'sample text'
    const encKey = await deriveAESKey(password, salt)
    const decKey = await deriveAESKey(password, generateSalt())
    const iv = generateIv()
    const encrypted = await encrypt(plaintext, encKey, iv)

    try {
      await decrypt(encrypted, decKey, iv)
      fail('should throw')
    } catch (err) {
      expect(err.name).toBe('OperationError')
    }
  })

  it('wrong iv', async() => {
    const plaintext = 'sample text'
    const key = await deriveAESKey(password, salt)
    const encIv = generateIv()
    const decIv = generateIv()
    const encrypted = await encrypt(plaintext, key, encIv)

    try {
      await decrypt(encrypted, key, decIv)
      fail('should throw')
    } catch (err) {
      expect(err.name).toBe('OperationError')
    }
  })
})
