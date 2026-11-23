import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const nums = (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number)
  const [weight, height] = nums
  if (weight === undefined || height === undefined || weight <= 0 || height <= 0) {
    throw new Error('Enter weight then height, such as 70 175.')
  }
  const bmi = mode === 'imperial' ? (703 * weight) / height ** 2 : weight / (height / 100) ** 2
  const label =
    bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obesity'
  return `BMI: ${bmi.toFixed(1)} (${label})`
}

export const bmiCalculator = defineTransform({
  meta: {
    id: 'bmi-calculator',
    name: 'BMI calculator',
    category: 'calculate',
    description: 'Body mass index from weight and height.',
    keywords: ['bmi', 'weight', 'health', 'body mass'],
  },
  modes: [
    { id: 'metric', label: 'Metric kg and cm' },
    { id: 'imperial', label: 'Imperial lb and in' },
  ],
  placeholder: '70 175',
  run,
})
