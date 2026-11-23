import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const radius = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(radius) || radius <= 0)
    throw new Error('Enter a radius above zero.')
  const clean = (n: number): number => Number(n.toFixed(4))
  return [
    `Volume: ${clean((4 / 3) * Math.PI * radius ** 3)}`,
    `Surface area: ${clean(4 * Math.PI * radius ** 2)}`,
  ].join('\n')
}

export const sphere = defineTransform({
  meta: {
    id: 'sphere',
    name: 'Sphere calculator',
    category: 'calculate',
    description: 'Volume and surface area of a sphere from its radius.',
    keywords: ['sphere', 'volume', 'surface area', 'radius', 'ball', 'geometry'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'radius: 3',
  example: '3',
  run,
})
