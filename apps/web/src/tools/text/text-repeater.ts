import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  return Array.from({ length: Number(mode) }, () => text).join('\n')
}

export const textRepeater = defineTransform({
  meta: {
    id: 'text-repeater',
    name: 'Text repeater',
    category: 'text',
    description: 'Repeat a line of text 2, 5, 10, or 50 times.',
    keywords: ['repeat', 'duplicate', 'multiply'],
  },
  modes: [
    { id: '2', label: '2×' },
    { id: '5', label: '5×' },
    { id: '10', label: '10×' },
    { id: '50', label: '50×' },
  ],
  placeholder: 'Type or paste text',
  example: 'hi',
  run,
})
