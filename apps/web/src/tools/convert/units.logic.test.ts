import { describe, expect, it } from 'vitest'
import { convertUnits } from './units.logic.ts'

describe('convertUnits', () => {
  it('converts length', () => {
    const out = convertUnits('1 mi')
    expect(out).toContain('1609.344 m')
    expect(out).toContain('1.609344 km')
  })
  it('converts temperature both ways', () => {
    expect(convertUnits('212 F')).toContain('100 °C')
    expect(convertUnits('0 c')).toContain('32 °F')
    expect(convertUnits('0 K')).toContain('-273.15 °C')
  })
  it('keeps binary and decimal data apart', () => {
    expect(convertUnits('1 GiB')).toContain('1073.742 MB')
    expect(convertUnits('1 GB')).toContain('953.6743 MiB')
  })
  it('accepts a decimal comma', () => {
    expect(convertUnits('1,5 kg')).toContain('1500 g')
  })
  it('rejects unknown units and bad text', () => {
    expect(() => convertUnits('5 parsecs')).toThrow('do not know')
    expect(() => convertUnits('hello')).toThrow('number and a unit')
  })
})
