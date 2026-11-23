import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const value = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(value)) throw new Error('Enter a number.')
  const degrees = mode === 'rad' ? (value * 180) / Math.PI : mode === 'grad' ? value * 0.9 : value
  const clean = (n: number): number => Number(n.toPrecision(7))
  return [
    `Degrees: ${clean(degrees)}`,
    `Radians: ${clean((degrees * Math.PI) / 180)}`,
    `Gradians: ${clean(degrees / 0.9)}`,
  ].join('\n')
}

export const angle = defineTransform({
  meta: {
    id: 'angle',
    name: 'Angle converter',
    category: 'convert',
    description: 'Degrees, radians, and gradians.',
    keywords: ['angle', 'degrees', 'radians', 'gradians', 'trigonometry', 'pi'],
  },
  modes: [
    { id: 'deg', label: 'Degrees' },
    { id: 'rad', label: 'Radians' },
    { id: 'grad', label: 'Gradians' },
  ],
  placeholder: '180',
  example: '180',
  fields: [{ label: 'Value' }],
  run,
})
