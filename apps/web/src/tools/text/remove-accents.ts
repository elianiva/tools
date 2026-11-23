import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  return text.normalize('NFD').replaceAll(/\p{M}/gu, '').normalize('NFC')
}

export const removeAccents = defineTransform({
  meta: {
    id: 'remove-accents',
    name: 'Accent remover',
    category: 'text',
    description: 'Strip diacritics: café becomes cafe.',
    keywords: ['diacritics', 'accents', 'normalize', 'ascii'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: 'Crème brûlée ñ',
  run,
})
