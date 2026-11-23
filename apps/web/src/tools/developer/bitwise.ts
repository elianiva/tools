import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const unary = /^\s*~\s*(-?\d+)\s*$/u.exec(text)
  const binary = /^\s*(-?\d+)\s*(<<|>>|&|\||\^)\s*(-?\d+)\s*$/u.exec(text)
  if (unary === null && binary === null)
    throw new Error('Write an expression such as 12 & 10, 1 << 4, or ~5.')
  let result: bigint
  if (unary !== null) {
    result = ~BigInt(unary[1] ?? '0')
  } else {
    const a = BigInt(binary?.[1] ?? '0')
    const b = BigInt(binary?.[3] ?? '0')
    const operator = binary?.[2]
    if ((operator === '<<' || operator === '>>') && (b < 0n || b > 4096n))
      throw new Error('Shift by 0 to 4096 places.')
    result =
      operator === '&'
        ? a & b
        : operator === '|'
          ? a | b
          : operator === '^'
            ? a ^ b
            : operator === '<<'
              ? a << b
              : a >> b
  }
  return [
    `Decimal: ${result.toString(10)}`,
    `Hex: ${result.toString(16)}`,
    `Binary: ${result.toString(2)}`,
  ].join('\n')
}

export const bitwise = defineTransform({
  meta: {
    id: 'bitwise',
    name: 'Bitwise calculator',
    category: 'developer',
    description: 'AND, OR, XOR, shifts, and NOT on whole numbers of any size.',
    keywords: ['bitwise', 'and', 'or', 'xor', 'shift', 'not', 'binary'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '12 & 10',
  example: '12 & 10',
  present: 'facts',
  run,
})
