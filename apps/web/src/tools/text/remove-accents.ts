import { cleaner, defineTextTool } from './ui.ts'

export const run = (text: string): string => {
  return text.normalize('NFD').replaceAll(/\p{M}/gu, '').normalize('NFC')
}

export const removeAccents = defineTextTool({
  meta: {
    id: 'remove-accents',
    name: 'Accent remover',
    category: 'text',
    description: 'Strip diacritics: café becomes cafe.',
    keywords: ['diacritics', 'accents', 'normalize', 'ascii'],
  },
  example: 'Crème brûlée, jalapeño, and Zürich',
  files: true,
  render: (c) =>
    cleaner(c, {
      run,
      extra: (before) => [
        ['Accented letters', String((before.normalize('NFD').match(/\p{M}/gu) ?? []).length)],
      ],
    }),
})
