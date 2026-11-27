import { bars, card, column, defineCalc, hero, tiles } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const [weight, height, age] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (weight === undefined || height === undefined || age === undefined)
    throw new Error('Enter weight in kg, height in cm, and age, such as 70 175 30.')
  const bmr = 10 * weight + 6.25 * height - 5 * age + (mode === 'female' ? -161 : 5)
  return `BMR: ${Math.round(bmr)} kcal/day`
}

const LEVELS = [
  ['Sedentary', 1.2],
  ['Light', 1.375],
  ['Moderate', 1.55],
  ['Active', 1.725],
  ['Very active', 1.9],
] as const

export const bmr = defineCalc({
  meta: {
    id: 'bmr',
    name: 'BMR calculator',
    category: 'calculate',
    description: 'Calories your body burns at rest, by the Mifflin-St Jeor formula.',
    keywords: ['bmr', 'calories', 'metabolism', 'kcal', 'diet', 'basal'],
  },
  run,
  modes: [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
  ],
  fields: [
    { label: 'Weight', value: '70', suffix: 'kg' },
    { label: 'Height', value: '175', suffix: 'cm' },
    { label: 'Age', value: '30', suffix: 'yrs' },
  ],
  view: (h, { out }) => {
    const rest = Number(/BMR: (-?\d+)/u.exec(out)?.[1] ?? 0)
    return column(h, [
      hero(h, { label: 'BMR', value: `${rest} kcal/day`, copy: out }),
      tiles(h, [['Per hour', `${Math.round(rest / 24)} kcal`]]),
      card(h, 'Daily calories by activity', [
        bars(
          h,
          LEVELS.map(([name, factor]) => ({
            label: `${name} ×${factor}`,
            value: rest * factor,
            limit: rest * 1.9 || 1,
            display: `${Math.round(rest * factor)} kcal`,
          })),
        ),
      ]),
    ])
  },
})
