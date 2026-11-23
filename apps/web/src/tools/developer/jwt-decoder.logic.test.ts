import { describe, expect, it } from 'vitest'
import { decodeJwt } from './jwt-decoder.logic.ts'

const b64url = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
const token = (payload: unknown) => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.sig`

describe('decodeJwt', () => {
  it('shows header and payload and the expiry', () => {
    const out = decodeJwt(token({ sub: '1', exp: 1_700_000_000 }), 1_800_000_000_000)
    expect(out).toContain('"alg": "HS256"')
    expect(out).toContain('"sub": "1"')
    expect(out).toContain('Expires: 2023-11-14T22:13:20.000Z')
    expect(out).toContain('Status: expired')
  })

  it('says a future token is not expired, and accepts a Bearer prefix', () => {
    const out = decodeJwt(`Bearer ${token({ exp: 1_900_000_000 })}`, 1_800_000_000_000)
    expect(out).toContain('Status: not expired')
  })

  it('rejects text that is not a token', () => {
    expect(() => decodeJwt('abc.def', 0)).toThrow('three parts')
    expect(() => decodeJwt('a.b.c', 0)).toThrow('not valid JSON')
  })
})
