import { hero } from '../generate/ui.ts'
import { compareBars, defineCalc, money, percent } from './money-ui.ts'

export const run = (text: string): string => {
  const [invested, final] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (invested === undefined || final === undefined || invested <= 0)
    throw new Error('Enter the amount invested and the final value, such as 1000 1250.')
  const gain = final - invested
  return [`Gain: ${gain.toFixed(2)}`, `ROI: ${((gain / invested) * 100).toFixed(2)}%`].join('\n')
}

export const roi = defineCalc({
  meta: {
    id: 'roi',
    name: 'ROI calculator',
    category: 'calculate',
    description: 'Return on investment from what you put in and what you got out.',
    keywords: ['roi', 'return on investment', 'gain', 'profit', 'investment'],
  },
  fields: [
    { label: 'Invested', initial: '1000' },
    { label: 'Final value', initial: '1250' },
  ],
  run,
  render: (h, { nums, num }) => {
    const [invested = 0, final = 0] = nums
    const gain = num('Gain')
    const tone = gain >= 0 ? 'ok' : 'danger'
    return [
      hero(h, 'ROI', percent(num('ROI')), [
        h.span([], [`${gain >= 0 ? 'Gain' : 'Loss'} of ${money(Math.abs(gain))}`]),
      ]),
      compareBars(h, 'Invested and final value', [
        { label: 'Invested', value: invested, text: money(invested), tone: 'info' },
        { label: 'Final value', value: final, text: money(final), tone },
      ]),
    ]
  },
})
