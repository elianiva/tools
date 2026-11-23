import { describe, expect, it } from 'vitest'
import { fitSize, formatBytes, outputName, savedPercent, sniff } from './convert.logic.ts'

const bytes = (...values: ReadonlyArray<number | string>) =>
  Uint8Array.from(
    values.flatMap((v) => (typeof v === 'string' ? [...v].map((c) => c.charCodeAt(0)) : [v])),
  )

describe('sniff', () => {
  it('reads the real format, not the extension', () => {
    expect(sniff(bytes(0x89, 'PNG'))).toBe('png')
    expect(sniff(bytes('RIFF', 0, 0, 0, 0, 'WEBP'))).toBe('webp')
    expect(sniff(bytes(0xff, 0xd8, 0xff))).toBe('jpeg')
  })

  it('tells AVIF from HEIC when both list mif1', () => {
    const avif = bytes(0, 0, 0, 0x1c, 'ftyp', 'mif1', 0, 0, 0, 0, 'mif1', 'avif')
    const heic = bytes(0, 0, 0, 0x1c, 'ftyp', 'mif1', 0, 0, 0, 0, 'mif1', 'heic')
    expect(sniff(avif)).toBe('avif')
    expect(sniff(heic)).toBe('heic')
  })

  it('does not guess for empty or unknown data', () => {
    expect(sniff(new Uint8Array())).toBe('unknown')
    expect(sniff(bytes('hello world'))).toBe('unknown')
  })
})

describe('fitSize', () => {
  it('leaves a small image alone', () => {
    expect(fitSize(800, 600, 0, 16_000_000)).toEqual({ width: 800, height: 600, scaled: false })
  })

  it('scales to the width limit and keeps the ratio', () => {
    expect(fitSize(4000, 3000, 1000, 16_000_000)).toEqual({
      width: 1000,
      height: 750,
      scaled: true,
    })
  })

  it('caps the pixel count even with no width limit', () => {
    const fit = fitSize(8000, 6000, 0, 16_000_000)
    expect(fit.scaled).toBe(true)
    expect(fit.width * fit.height).toBeLessThanOrEqual(16_000_000)
  })

  it('never returns a zero side', () => {
    expect(fitSize(10000, 1, 100, 16_000_000).height).toBe(1)
  })
})

describe('names and sizes', () => {
  it('swaps the extension and keeps dots in the name', () => {
    expect(outputName('holiday.HEIC', 'jpg')).toBe('holiday.jpg')
    expect(outputName('a.b.png', 'webp')).toBe('a.b.webp')
    expect(outputName('noext', 'png')).toBe('noext.png')
    expect(outputName('.hidden', 'png')).toBe('.hidden.png')
  })

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })

  it('reports growth as negative', () => {
    expect(savedPercent(1000, 400)).toBe(60)
    expect(savedPercent(1000, 1500)).toBe(-50)
    expect(savedPercent(0, 10)).toBe(0)
  })
})
