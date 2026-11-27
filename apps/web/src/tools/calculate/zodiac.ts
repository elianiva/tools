import { column, defineCalc, hero, tiles } from './ui.ts'

export const run = (text: string): string => {
  const match = /(?:\d{4}-)?(\d{2})-(\d{2})/u.exec(text)
  if (match === null) throw new Error('Enter a date like 1990-08-15.')
  const month = Number(match[1])
  const day = Number(match[2])
  if (new Date(Date.UTC(2000, month - 1, day)).getUTCMonth() !== month - 1)
    throw new Error('That date does not exist.')
  const value = month * 100 + day
  const signs: ReadonlyArray<readonly [number, string]> = [
    [120, 'Capricorn'],
    [219, 'Aquarius'],
    [321, 'Pisces'],
    [420, 'Aries'],
    [521, 'Taurus'],
    [621, 'Gemini'],
    [723, 'Cancer'],
    [823, 'Leo'],
    [923, 'Virgo'],
    [1023, 'Libra'],
    [1122, 'Scorpio'],
    [1222, 'Sagittarius'],
  ]
  return signs.find(([until]) => value < until)?.[1] ?? 'Capricorn'
}

const SIGNS: Readonly<Record<string, readonly [string, string, string]>> = {
  Capricorn: ['♑', 'Dec 22 – Jan 19', 'Earth'],
  Aquarius: ['♒', 'Jan 20 – Feb 18', 'Air'],
  Pisces: ['♓', 'Feb 19 – Mar 20', 'Water'],
  Aries: ['♈', 'Mar 21 – Apr 19', 'Fire'],
  Taurus: ['♉', 'Apr 20 – May 20', 'Earth'],
  Gemini: ['♊', 'May 21 – Jun 20', 'Air'],
  Cancer: ['♋', 'Jun 21 – Jul 22', 'Water'],
  Leo: ['♌', 'Jul 23 – Aug 22', 'Fire'],
  Virgo: ['♍', 'Aug 23 – Sep 22', 'Earth'],
  Libra: ['♎', 'Sep 23 – Oct 22', 'Air'],
  Scorpio: ['♏', 'Oct 23 – Nov 21', 'Water'],
  Sagittarius: ['♐', 'Nov 22 – Dec 21', 'Fire'],
}

export const zodiac = defineCalc({
  meta: {
    id: 'zodiac',
    name: 'Zodiac sign',
    category: 'calculate',
    description: 'Find the Western zodiac sign for a date.',
    keywords: ['zodiac', 'horoscope', 'star sign', 'astrology', 'birthday'],
  },
  run,
  fields: [{ label: 'Birth date', value: '1990-08-15', kind: 'date' }],
  view: (h, { out }) => {
    const [symbol = '', dates = '', element = ''] = SIGNS[out] ?? []
    return column(h, [
      hero(h, { label: `${symbol} ${dates}`, value: out, copy: out }),
      tiles(h, [
        ['Element', element],
        ['Symbol', symbol],
      ]),
    ])
  },
})
