import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [invested, final] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (invested === undefined || final === undefined || invested <= 0)
    throw new Error('Enter the amount invested and the final value, such as 1000 1250.')
  const gain = final - invested
  return [`Gain: ${gain.toFixed(2)}`, `ROI: ${((gain / invested) * 100).toFixed(2)}%`].join('\n')
}

export const roi = defineTransform({
  meta: {
    id: 'roi',
    name: 'ROI calculator',
    category: 'calculate',
    description: 'Return on investment from what you put in and what you got out.',
    keywords: ['roi', 'return on investment', 'gain', 'profit', 'investment'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'invested and final value: 1000 1250',
  example: '1000 1250',
  fields: [{ label: 'Invested' }, { label: 'Final value' }],
  run,
})
