import { describe, expect, it } from 'vitest'
import { run } from './morse-code.ts'

describe('morse-code', () => {
  it('case 1', () => {
    expect(run('SOS', 'encode')).toBe('... --- ...')
  })
  it('case 2', () => {
    expect(run('hi there', 'encode')).toBe('.... .. / - .... . .-. .')
  })
  it('case 3', () => {
    expect(run('... --- ...', 'decode')).toBe('SOS')
  })
  it('case 4', () => {
    expect(run('.... .. / - .... .', 'decode')).toBe('HI THE')
  })
  it('case 5', () => {
    expect(() => run('é', 'encode')).toThrow('No Morse code')
  })
  it('case 6', () => {
    expect(() => run('.-.-.-.-', 'decode')).toThrow('not a Morse letter')
  })
})
