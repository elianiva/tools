import { defineTransform } from '../transform.ts'
import { convertCase } from './case-converter.logic.ts'

export const caseConverter = defineTransform({
  meta: {
    id: 'case-converter',
    name: 'Case converter',
    category: 'text',
    description: 'UPPER, lower, Title, Sentence, camelCase, snake_case and more.',
    keywords: [
      'uppercase',
      'lowercase',
      'title case',
      'camel',
      'snake',
      'kebab',
      'pascal',
      'constant',
    ],
  },
  modes: [
    { id: 'upper', label: 'UPPER' },
    { id: 'lower', label: 'lower' },
    { id: 'title', label: 'Title' },
    { id: 'sentence', label: 'Sentence' },
    { id: 'camel', label: 'camelCase' },
    { id: 'pascal', label: 'PascalCase' },
    { id: 'snake', label: 'snake_case' },
    { id: 'kebab', label: 'kebab-case' },
    { id: 'constant', label: 'CONSTANT_CASE' },
  ],
  placeholder: 'Type or paste text',
  run: convertCase,
  acceptsFiles: true,
})
