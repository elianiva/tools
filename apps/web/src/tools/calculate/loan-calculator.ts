import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const [amount, rate, years] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (amount === undefined || rate === undefined || years === undefined || years <= 0) {
    throw new Error('Enter amount, yearly rate in percent, and years, such as 10000 5 3.')
  }
  const months = Math.round(years * 12)
  const monthlyRate = rate / 1200
  const payment =
    monthlyRate === 0
      ? amount / months
      : (amount * monthlyRate) / (1 - (1 + monthlyRate) ** -months)
  const total = payment * months
  return [
    `Monthly payment: ${payment.toFixed(2)}`,
    `Total paid: ${total.toFixed(2)}`,
    `Total interest: ${(total - amount).toFixed(2)}`,
  ].join('\n')
}

export const loanCalculator = defineTransform({
  meta: {
    id: 'loan-calculator',
    name: 'Loan calculator',
    category: 'calculate',
    description: 'Monthly payment, total paid, and interest on a loan.',
    keywords: ['loan', 'mortgage', 'emi', 'payment', 'interest', 'amortization'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'amount, yearly rate %, years: 10000 5 3',
  example: '10000 5 3',
  run,
})
