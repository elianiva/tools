import { css } from '../../../styled-system/css'
import { stack } from '../kit.ts'
import { tiles } from '../calculate/money-ui.ts'
import { copyButton, defineGenerator } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const vocabulary = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'in',
    'reprehenderit',
    'voluptate',
  ]
  const count = Math.min(200, Math.max(1, Number.parseInt(text, 10) || 1))
  let cursor = 0
  const word = (): string => {
    const index = (cursor + Math.floor(cursor / vocabulary.length) * 3) % vocabulary.length
    cursor += 1
    return vocabulary[index] ?? 'lorem'
  }
  const sentence = (n: number): string => {
    const words = Array.from({ length: 8 + (n % 7) }, word)
    return `${words.join(' ').replace(/^./u, (first) => first.toUpperCase())}.`
  }
  if (mode === 'words') return Array.from({ length: count }, word).join(' ')
  if (mode === 'sentences') return Array.from({ length: count }, (_, n) => sentence(n)).join(' ')
  return Array.from({ length: count }, (_, p) =>
    Array.from({ length: 4 }, (__, s) => sentence(p * 4 + s)).join(' '),
  ).join('\n\n')
}

const textCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
  padding: '1.2rem 3.4rem 1.2rem 1.3rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  maxHeight: '32rem',
  overflow: 'auto',
  '& p': { margin: 0, lineHeight: 1.6 },
  '& > [data-slot="copy-button"]': { position: 'absolute', top: '0.6rem', right: '0.6rem' },
})

export const loremIpsum = defineGenerator({
  meta: {
    id: 'lorem-ipsum',
    name: 'Lorem ipsum',
    category: 'generate',
    description: 'Placeholder paragraphs, sentences, or words. Type how many.',
    keywords: ['lorem', 'ipsum', 'placeholder', 'dummy text', 'filler'],
  },
  fields: [
    {
      label: 'Count',
      initial: '3',
      integer: true,
      min: 1,
      max: 200,
      presets: ['1', '3', '5', '10'],
    },
  ],
  modes: [
    { id: 'paragraphs', label: 'Paragraphs' },
    { id: 'sentences', label: 'Sentences' },
    { id: 'words', label: 'Words' },
  ],
  modeLabel: 'Unit',
  run,
  view: (h, { out }) => {
    const words = out.split(/\s+/u).filter((word) => word !== '').length
    return h.div(
      [h.Class(stack)],
      [
        h.div(
          [h.Class(textCls), h.Tabindex(0), h.AriaLabel('Lorem ipsum text')],
          [...out.split('\n\n').map((paragraph) => h.p([], [paragraph])), copyButton(h, out)],
        ),
        tiles(h, [
          ['Words', String(words)],
          ['Characters', String(out.length)],
        ]),
      ],
    )
  },
})
