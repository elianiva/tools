import { css } from '../../../styled-system/css'
import { copyButton } from '../generate/ui.ts'
import { defineCalc, money } from './money-ui.ts'

const noteCls = css({ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' })

export const run = (text: string, mode: string): string => {
  const amount = Number(text.trim().replaceAll(/[,_\s]/gu, ''))
  if (!Number.isFinite(amount) || text.trim() === '') throw new Error('Enter an amount.')
  const perYear: Readonly<Record<string, number>> = {
    yearly: 1,
    monthly: 12,
    weekly: 52,
    daily: 260,
    hourly: 2080,
  }
  const yearly = amount * (perYear[mode] ?? 1)
  return [
    `Hourly: ${(yearly / 2080).toFixed(2)}`,
    `Daily: ${(yearly / 260).toFixed(2)}`,
    `Weekly: ${(yearly / 52).toFixed(2)}`,
    `Monthly: ${(yearly / 12).toFixed(2)}`,
    `Yearly: ${yearly.toFixed(2)}`,
  ].join('\n')
}

const PERIODS = [
  ['hourly', 'Hourly'],
  ['daily', 'Daily'],
  ['weekly', 'Weekly'],
  ['monthly', 'Monthly'],
  ['yearly', 'Yearly'],
] as const

const ladderCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  '& li': {
    position: 'relative',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.75rem 3.2rem 0.75rem 1rem',
    borderRadius: 'var(--radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-raised)',
  },
  '& li[data-input]': {
    background: 'linear-gradient(135deg, var(--tone-soft), transparent 70%), var(--card)',
  },
  '& li b': {
    fontFamily: 'var(--mono)',
    fontSize: '1.2rem',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  '& li > [data-slot="copy-button"]': {
    position: 'absolute',
    top: '50%',
    right: '0.6rem',
    translate: '0 -50%',
  },
})

export const salary = defineCalc({
  meta: {
    id: 'salary',
    name: 'Salary converter',
    category: 'calculate',
    description: 'Hourly, daily, weekly, monthly, and yearly pay from any one of them.',
    keywords: ['salary', 'wage', 'hourly', 'annual', 'pay', 'income'],
  },
  fields: [{ label: 'Amount', initial: '50000' }],
  modes: [
    { id: 'yearly', label: 'Yearly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'daily', label: 'Daily' },
    { id: 'hourly', label: 'Hourly' },
  ],
  modeLabel: 'Amount is',
  run,
  render: (h, { mode, fact }) => [
    h.ul(
      [h.Class(ladderCls)],
      PERIODS.map(([id, label]) => {
        const value = money(Number(fact(label).replaceAll(',', '')))
        return h.li(id === mode ? [h.Attribute('data-input', '')] : [], [
          h.span([], [label]),
          h.b([], [value]),
          copyButton(h, value),
        ])
      }),
    ),
    h.p([h.Class(noteCls)], ['Based on 2,080 hours, 260 days, and 52 weeks a year.']),
  ],
})
