import { hero } from '../generate/ui.ts'
import { dataTable, defineCalc, lineChart, money, splitBar } from './money-ui.ts'

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

export type YearRow = Readonly<{
  year: number
  principal: number
  interest: number
  balance: number
}>

/** The month-by-month balance of a fixed-payment loan, and its totals per year. */
export const amortize = (
  amount: number,
  rate: number,
  years: number,
): Readonly<{ payment: number; balances: ReadonlyArray<number>; rows: ReadonlyArray<YearRow> }> => {
  const months = Math.max(1, Math.round(years * 12))
  const monthlyRate = rate / 1200
  const payment =
    monthlyRate === 0
      ? amount / months
      : (amount * monthlyRate) / (1 - (1 + monthlyRate) ** -months)
  const balances = [amount]
  const rows: Array<YearRow> = []
  let balance = amount
  let interest = 0
  let principal = 0
  for (let month = 1; month <= months; month += 1) {
    const charge = balance * monthlyRate
    interest += charge
    principal += payment - charge
    balance = month === months ? 0 : balance - (payment - charge)
    balances.push(balance)
    if (month % 12 === 0 || month === months) {
      rows.push({ year: Math.ceil(month / 12), principal, interest, balance })
      interest = 0
      principal = 0
    }
  }
  return { payment, balances, rows }
}

export const loanCalculator = defineCalc({
  meta: {
    id: 'loan-calculator',
    name: 'Loan calculator',
    category: 'calculate',
    description: 'Monthly payment, total paid, and interest on a loan.',
    keywords: ['loan', 'mortgage', 'emi', 'payment', 'interest', 'amortization'],
  },
  fields: [
    { label: 'Amount', initial: '10000' },
    { label: 'Yearly rate', initial: '5', suffix: '%' },
    { label: 'Term', initial: '3', suffix: 'yrs', min: 0.1, max: 100 },
  ],
  run,
  render: (h, { nums, num }) => {
    const [amount = 0, rate = 0, years = 1] = nums
    const { balances, rows } = amortize(amount, rate, years)
    const months = balances.length - 1
    const interest = num('Total interest')
    const stride = Math.max(1, Math.ceil(months / 120))
    const sampled = balances.flatMap((balance, month) =>
      month % stride === 0 || month === months ? [[month, balance] as const] : [],
    )
    let paid = 0
    const interestLine = rows.flatMap((row, index) => {
      paid += row.interest
      return [[Math.min((index + 1) * 12, months), paid] as const]
    })
    return [
      hero(h, 'Monthly payment', money(num('Monthly payment')), [
        h.span([], [`${months} payments of ${money(num('Monthly payment'))}`]),
      ]),
      splitBar(h, `Total paid ${money(num('Total paid'))}`, [
        { label: 'Principal', value: amount, text: money(amount), tone: 'info' },
        { label: 'Interest', value: interest, text: money(interest), tone: 'warn' },
      ]),
      lineChart(h, {
        title: 'Balance and interest paid',
        series: [
          { label: 'Balance', tone: 'info', points: sampled },
          { label: 'Interest paid', tone: 'warn', points: [[0, 0], ...interestLine] },
        ],
        xMax: months,
        ticks: [
          [0, '0'],
          [months / 2, `${Number((years / 2).toFixed(1))} yrs`],
          [months, `${years} yrs`],
        ],
      }),
      dataTable(
        h,
        ['Year', 'Principal', 'Interest', 'Balance'],
        rows.map((row) => [
          String(row.year),
          money(row.principal),
          money(row.interest),
          money(row.balance),
        ]),
      ),
    ]
  },
})
