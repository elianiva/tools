import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const ranges: Readonly<Record<string, ReadonlyArray<readonly [string, string, number]>>> = {
    bold: [
      ['A', 'Z', 0x1d400],
      ['a', 'z', 0x1d41a],
      ['0', '9', 0x1d7ce],
    ],
    monospace: [
      ['A', 'Z', 0x1d670],
      ['a', 'z', 0x1d68a],
      ['0', '9', 0x1d7f6],
    ],
    circled: [
      ['A', 'Z', 0x24b6],
      ['a', 'z', 0x24d0],
    ],
    fullwidth: [['!', '~', 0xff01]],
  }
  const table = ranges[mode] ?? []
  return Array.from(text, (char) => {
    const code = char.codePointAt(0) ?? 0
    const hit = table.find(([from, to]) => code >= from.charCodeAt(0) && code <= to.charCodeAt(0))
    return hit === undefined ? char : String.fromCodePoint(hit[2] + code - hit[0].charCodeAt(0))
  }).join('')
}

export const fancyText = defineTransform({
  meta: {
    id: 'fancy-text',
    name: 'Fancy text',
    category: 'text',
    description: 'Bold, monospace, circled, and full-width Unicode letters.',
    keywords: ['unicode', 'bold', 'font', 'stylish', 'social'],
  },
  modes: [
    { id: 'bold', label: 'Bold' },
    { id: 'monospace', label: 'Monospace' },
    { id: 'circled', label: 'Circled' },
    { id: 'fullwidth', label: 'Full-width' },
  ],
  placeholder: 'Type or paste text',
  example: 'Ab1',
  run,
})
