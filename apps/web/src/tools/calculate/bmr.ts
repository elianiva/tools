import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const [weight, height, age] = (text.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (weight === undefined || height === undefined || age === undefined)
    throw new Error('Enter weight in kg, height in cm, and age, such as 70 175 30.')
  const bmr = 10 * weight + 6.25 * height - 5 * age + (mode === 'female' ? -161 : 5)
  return `BMR: ${Math.round(bmr)} kcal/day`
}

export const bmr = defineTransform({
  meta: {
    id: 'bmr',
    name: 'BMR calculator',
    category: 'calculate',
    description: 'Calories your body burns at rest, by the Mifflin-St Jeor formula.',
    keywords: ['bmr', 'calories', 'metabolism', 'kcal', 'diet', 'basal'],
  },
  modes: [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
  ],
  placeholder: 'weight kg, height cm, age: 70 175 30',
  example: '70 175 30',
  fields: [
    { label: 'Weight', suffix: 'kg' },
    { label: 'Height', suffix: 'cm' },
    { label: 'Age', suffix: 'yrs' },
  ],
  run,
})
