import { defineTransform } from '../transform.ts'

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

export const salary = defineTransform({
  meta: {
    id: 'salary',
    name: 'Salary converter',
    category: 'calculate',
    description: 'Hourly, daily, weekly, monthly, and yearly pay from any one of them.',
    keywords: ['salary', 'wage', 'hourly', 'annual', 'pay', 'income'],
  },
  modes: [
    { id: 'yearly', label: 'Yearly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'daily', label: 'Daily' },
    { id: 'hourly', label: 'Hourly' },
  ],
  placeholder: '50000',
  example: '50000',
  run,
})
