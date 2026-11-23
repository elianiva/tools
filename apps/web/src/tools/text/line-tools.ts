import { defineTransform } from '../transform.ts'
import { runLines } from './line-tools.logic.ts'

export const lineTools = defineTransform({
  meta: {
    id: 'line-tools',
    name: 'Line tools',
    category: 'text',
    description: 'Sort, reverse, deduplicate, trim, and number lines.',
    keywords: ['sort', 'unique', 'dedupe', 'duplicate', 'reverse', 'trim', 'empty lines', 'number'],
  },
  modes: [
    { id: 'sort', label: 'Sort A–Z' },
    { id: 'sort-desc', label: 'Sort Z–A' },
    { id: 'reverse', label: 'Reverse' },
    { id: 'dedupe', label: 'Remove duplicates' },
    { id: 'remove-empty', label: 'Remove empty' },
    { id: 'trim', label: 'Trim' },
    { id: 'number', label: 'Number' },
  ],
  placeholder: 'One item per line',
  present: 'code',
  run: runLines,
  acceptsFiles: true,
})
