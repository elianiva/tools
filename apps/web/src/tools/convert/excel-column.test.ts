import { describe, expect, it } from 'vitest'
import { run } from './excel-column.ts'

describe('excel-column', () => {
  it('case 1', () => {
    expect(run('A', 'to-number')).toBe('1')
  })
  it('case 2', () => {
    expect(run('Z', 'to-number')).toBe('26')
  })
  it('case 3', () => {
    expect(run('AA', 'to-number')).toBe('27')
  })
  it('case 4', () => {
    expect(run('az', 'to-number')).toBe('52')
  })
  it('case 5', () => {
    expect(run('ZZ', 'to-number')).toBe('702')
  })
  it('case 6', () => {
    expect(run('AAA', 'to-number')).toBe('703')
  })
  it('case 7', () => {
    expect(run('XFD', 'to-number')).toBe('16384')
  })
  it('case 8', () => {
    expect(run('1', 'to-letters')).toBe('A')
  })
  it('case 9', () => {
    expect(run('26', 'to-letters')).toBe('Z')
  })
  it('case 10', () => {
    expect(run('27', 'to-letters')).toBe('AA')
  })
  it('case 11', () => {
    expect(run('702', 'to-letters')).toBe('ZZ')
  })
  it('case 12', () => {
    expect(run('703', 'to-letters')).toBe('AAA')
  })
  it('case 13', () => {
    expect(run('16384', 'to-letters')).toBe('XFD')
  })
  it('case 14', () => {
    expect(run('B\nC', 'to-number')).toBe('2\n3')
  })
  it('case 15', () => {
    expect(() => run('XFE', 'to-number')).toThrow('Use a column')
  })
  it('case 16', () => {
    expect(() => run('16385', 'to-letters')).toThrow('Use a number')
  })
  it('case 17', () => {
    expect(() => run('0', 'to-letters')).toThrow('Use a number')
  })
})
