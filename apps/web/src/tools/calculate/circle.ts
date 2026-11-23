import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const value = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(value) || value <= 0)
    throw new Error('Enter a positive number.')
  const radius = mode === 'diameter' ? value / 2 : value
  const clean = (n: number): number => Number(n.toFixed(4))
  return [
    `Radius: ${clean(radius)}`,
    `Diameter: ${clean(radius * 2)}`,
    `Circumference: ${clean(2 * Math.PI * radius)}`,
    `Area: ${clean(Math.PI * radius ** 2)}`,
  ].join('\n')
}

export const circle = defineTransform({
  meta: {
    id: 'circle',
    name: 'Circle calculator',
    category: 'calculate',
    description: 'Circumference and area from a radius or a diameter.',
    keywords: ['circle', 'radius', 'diameter', 'area', 'circumference', 'pi'],
  },
  modes: [
    { id: 'radius', label: 'From radius' },
    { id: 'diameter', label: 'From diameter' },
  ],
  placeholder: '5',
  example: '5',
  run,
})
