import {
  base64ToBuffer,
  bufferToBase64,
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

