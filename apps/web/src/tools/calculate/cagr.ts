import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [start, end, years] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (start === undefined || end === undefined || years === undefined || start <= 0 || years <= 0)
    throw new Error('Enter a start value, an end value, and years above zero, such as 1000 2000 5.')
  return `CAGR: ${(((end / start) ** (1 / years) - 1) * 100).toFixed(2)}%`
}

export const cagr = defineTransform({
  meta: {
    id: 'cagr',
    name: 'CAGR calculator',
    category: 'calculate',
    description: 'Compound annual growth rate between a start and an end value.',
    keywords: ['cagr', 'growth rate', 'compound', 'annual', 'investment'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'start value, end value, years: 1000 2000 5',
  example: '1000 2000 5',
  fields: [{ label: 'Start value' }, { label: 'End value' }, { label: 'Years', suffix: 'yrs' }],
  run,
})
