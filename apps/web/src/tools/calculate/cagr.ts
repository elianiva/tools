import { hero } from '../generate/ui.ts'
import { dataTable, defineCalc, lineChart, money, percent, yearSteps } from './money-ui.ts'

export const run = (text: string): string => {
  const [start, end, years] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (start === undefined || end === undefined || years === undefined || start <= 0 || years <= 0)
    throw new Error('Enter a start value, an end value, and years above zero, such as 1000 2000 5.')
  return `CAGR: ${(((end / start) ** (1 / years) - 1) * 100).toFixed(2)}%`
}

export const cagr = defineCalc({
  meta: {
    id: 'cagr',
    name: 'CAGR calculator',
    category: 'calculate',
    description: 'Compound annual growth rate between a start and an end value.',
    keywords: ['cagr', 'growth rate', 'compound', 'annual', 'investment'],
  },
  fields: [
    { label: 'Start value', initial: '1000' },
    { label: 'End value', initial: '2000' },
    { label: 'Years', initial: '5', suffix: 'yrs', min: 0.01, max: 200 },
  ],
  run,
  render: (h, { nums, num }) => {
    const [start = 0, end = 0, years = 1] = nums
    const rate = num('CAGR')
    const growth = (t: number): number => start * (end / start) ** (t / years)
    const points = [0, ...yearSteps(years)].map((t) => [t, growth(t)] as const)
    return [
      hero(h, 'CAGR per year', percent(rate), [
        h.span([], [`${money(start)} to ${money(end)} in ${years} years`]),
      ]),
      lineChart(h, {
        title: 'Value by year',
        series: [{ label: 'Value', tone: end >= start ? 'ok' : 'danger', points }],
        xMax: years,
        ticks: [
          [0, '0'],
          [years / 2, String(Number((years / 2).toFixed(1)))],
          [years, String(years)],
        ],
        mark: { x: years, y: end, label: money(end) },
      }),
      dataTable(
        h,
        ['Year', 'Value'],
        yearSteps(years).map((t) => [String(Number(t.toFixed(2))), money(growth(t))]),
      ),
    ]
  },
})
