import { describe, expect, it } from 'vitest'
import { run } from './terbilang.ts'

describe('terbilang', () => {
  it('case 1', () => {
    expect(run('0', 'plain')).toBe('nol')
  })
  it('case 2', () => {
    expect(run('11', 'plain')).toBe('sebelas')
  })
  it('case 3', () => {
    expect(run('12', 'plain')).toBe('dua belas')
  })
  it('case 4', () => {
    expect(run('21', 'plain')).toBe('dua puluh satu')
  })
  it('case 5', () => {
    expect(run('100', 'plain')).toBe('seratus')
  })
  it('case 6', () => {
    expect(run('101', 'plain')).toBe('seratus satu')
  })
  it('case 7', () => {
    expect(run('111', 'plain')).toBe('seratus sebelas')
  })
  it('case 8', () => {
    expect(run('1000', 'plain')).toBe('seribu')
  })
  it('case 9', () => {
    expect(run('1100', 'plain')).toBe('seribu seratus')
  })
  it('case 10', () => {
    expect(run('1500', 'plain')).toBe('seribu lima ratus')
  })
  it('case 11', () => {
    expect(run('2000', 'plain')).toBe('dua ribu')
  })
  it('case 12', () => {
    expect(run('15000', 'plain')).toBe('lima belas ribu')
  })
  it('case 13', () => {
    expect(run('112000', 'plain')).toBe('seratus dua belas ribu')
  })
  it('case 14', () => {
    expect(run('1.234.567', 'plain')).toBe(
      'satu juta dua ratus tiga puluh empat ribu lima ratus enam puluh tujuh',
    )
  })
  it('case 15', () => {
    expect(run('1000000000', 'plain')).toBe('satu miliar')
  })
  it('case 16', () => {
    expect(run('2500', 'rupiah')).toBe('dua ribu lima ratus rupiah')
  })
  it('case 17', () => {
    expect(() => run('abc', 'plain')).toThrow('whole number')
  })
  it('case 18', () => {
    expect(() => run('1000000000000000', 'plain')).toThrow('999 triliun')
  })
})
