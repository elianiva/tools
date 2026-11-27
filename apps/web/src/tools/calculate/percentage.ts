import { bars, column, defineCalc, fmt, hero, num } from './ui.ts'
import { percentage } from './percentage.logic.ts'

const compose = (values: ReadonlyArray<string>, mode: string): string => {
  const [a = '', b = ''] = values.map((value) => value.trim())
  if (mode === 'of') return `${a}% of ${b}`
  if (mode === 'what') return `${a} is what % of ${b}`
  if (mode === 'change') return `${a} to ${b}`
  return `${a} ${mode === 'increase' ? '+' : '-'} ${b}%`
}

const LABELS: Readonly<Record<string, string>> = {
  of: 'Result',
  what: 'Share',
  change: 'Change',
  increase: 'After increase',
  decrease: 'After decrease',
}

export const percentageCalculator = defineCalc({
  meta: {
    id: 'percentage',
    name: 'Percentage calculator',
    category: 'calculate',
    description: 'Share, ratio, change and markup. Type 20% of 150.',
    keywords: ['percent', 'discount', 'increase', 'decrease', 'change', 'tip'],
  },
  run: (text) => percentage(text),
  compose,
  modes: [
    {
      id: 'of',
      label: '% of',
      fields: [
        { label: 'Percent', value: '20', suffix: '%' },
        { label: 'Of', value: '150' },
      ],
    },
    {
      id: 'what',
      label: 'Is what %',
      fields: [
        { label: 'Value', value: '30' },
        { label: 'Total', value: '120' },
      ],
    },
    {
      id: 'change',
      label: 'Change',
      fields: [
        { label: 'From', value: '80' },
        { label: 'To', value: '100' },
      ],
    },
    {
      id: 'increase',
      label: 'Increase',
      fields: [
        { label: 'Amount', value: '150' },
        { label: 'Percent', value: '20', suffix: '%' },
      ],
    },
    {
      id: 'decrease',
      label: 'Decrease',
      fields: [
        { label: 'Amount', value: '150' },
        { label: 'Percent', value: '20', suffix: '%' },
      ],
    },
  ],
  view: (h, { values, mode, out }) => {
    const share =
      mode === 'of' ? num(values[0]) : mode === 'what' ? Number(out.replace('%', '')) : null
    return column(h, [
      hero(h, { label: LABELS[mode] ?? 'Result', value: out }),
      share === null || !Number.isFinite(share)
        ? null
        : bars(h, [
            { label: 'Share of the whole', value: share, limit: 100, display: `${fmt(share, 4)}%` },
          ]),
    ])
  },
})
