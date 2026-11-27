import { card, column, defineCalc, hero, monthGrid, num, tiles } from './ui.ts'

export const run = (text: string): string => {
  if (!/^\d{1,4}$/u.test(text.trim())) throw new Error('Enter a year such as 2024.')
  const year = Number(text.trim())
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  return `${year} is ${leap ? 'a leap year (366 days)' : 'not a leap year (365 days)'}`
}

export const leapYear = defineCalc({
  meta: {
    id: 'leap-year',
    name: 'Leap year',
    category: 'calculate',
    description: 'Check if a year is a leap year.',
    keywords: ['leap year', 'calendar', 'february 29', 'gregorian'],
  },
  run,
  fields: [{ label: 'Year', value: '2024' }],
  view: (h, { values, out }) => {
    const year = num(values[0])
    const leap = !out.includes('not a leap')
    const yes = (n: number): string => (year % n === 0 ? 'Yes' : 'No')
    return column(h, [
      hero(h, {
        label: String(year),
        value: leap ? 'Leap year' : 'Not a leap year',
        sub: leap ? '366 days' : '365 days',
        copy: out,
      }),
      tiles(h, [
        ['Divisible by 4', yes(4)],
        ['Divisible by 100', yes(100)],
        ['Divisible by 400', yes(400)],
      ]),
      card(h, 'February', [monthGrid(h, { year, month0: 1, ...(leap ? { marked: 29 } : {}) })]),
    ])
  },
})
