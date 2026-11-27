import { hero } from '../generate/ui.ts'
import { compareBars, dataTable, defineCalc } from './money-ui.ts'

export const run = (text: string): string => {
  const rate = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(rate) || rate <= 0)
    throw new Error('Enter a yearly rate above zero, such as 8.')
  return [
    `Rule of 72: ${(72 / rate).toFixed(2)} years`,
    `Exact: ${(Math.log(2) / Math.log(1 + rate / 100)).toFixed(2)} years`,
  ].join('\n')
}

const RATES = [2, 4, 6, 8, 10, 12, 15]

export const ruleOf72 = defineCalc({
  meta: {
    id: 'rule-of-72',
    name: 'Rule of 72',
    category: 'calculate',
    description: 'Years to double your money at a yearly rate.',
    keywords: ['rule of 72', 'doubling time', 'compound', 'interest', 'investment'],
  },
  fields: [
    {
      label: 'Yearly rate',
      initial: '8',
      suffix: '%',
      min: 0.01,
      presets: ['4', '6', '8', '10', '12'],
    },
  ],
  run,
  render: (h, { nums, num }) => {
    const [rate = 0] = nums
    const rule = num('Rule of 72')
    const exact = num('Exact')
    const exactAt = (r: number): number => Math.log(2) / Math.log(1 + r / 100)
    const rates = RATES.includes(rate) ? RATES : [...RATES, rate].toSorted((a, b) => a - b)
    return [
      hero(h, 'Years to double', `${rule.toFixed(2)} years`, [
        h.span([], [`${exact.toFixed(2)} years exactly`]),
      ]),
      compareBars(h, 'Estimate and exact', [
        { label: 'Rule of 72', value: rule, text: `${rule.toFixed(2)} yrs`, tone: 'info' },
        { label: 'Exact', value: exact, text: `${exact.toFixed(2)} yrs`, tone: 'ok' },
      ]),
      dataTable(
        h,
        ['Rate', 'Rule of 72', 'Exact'],
        rates.map((r) => [`${r}%`, `${(72 / r).toFixed(2)} yrs`, `${exactAt(r).toFixed(2)} yrs`]),
        rates.indexOf(rate),
      ),
    ]
  },
})
