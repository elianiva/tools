import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const count = Math.min(100, Math.max(1, Number.parseInt(text, 10) || 1))
  return Array.from({ length: count }, () => crypto.randomUUID()).join('\n')
}

export const uuidGenerator = defineTransform({
  meta: {
    id: 'uuid-generator',
    name: 'UUID generator',
    category: 'generate',
    description: 'Random version 4 UUIDs. Type how many.',
    keywords: ['uuid', 'guid', 'random id', 'v4', 'identifier'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '5',
  example: '5',
  fields: [{ label: 'How many' }],
  run,
})
