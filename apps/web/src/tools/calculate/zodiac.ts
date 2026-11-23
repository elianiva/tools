import { defineTransform } from '../transform.ts'

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

export const zodiac = defineTransform({
  meta: {
    id: 'zodiac',
    name: 'Zodiac sign',
    category: 'calculate',
    description: 'Find the Western zodiac sign for a date.',
    keywords: ['zodiac', 'horoscope', 'star sign', 'astrology', 'birthday'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '1990-08-15',
  example: '1990-08-15',
  run,
})
