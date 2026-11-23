import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const length = Array.from(text).length
  const pool =
    (/[a-z]/u.test(text) ? 26 : 0) +
    (/[A-Z]/u.test(text) ? 26 : 0) +
    (/\d/u.test(text) ? 10 : 0) +
    (/[^A-Za-z\d]/u.test(text) ? 33 : 0)
  const bits = Math.floor(length * Math.log2(pool))
  const label =
    bits < 28
      ? 'Very weak'
      : bits < 50
        ? 'Weak'
        : bits < 70
          ? 'Fair'
          : bits < 90
            ? 'Strong'
            : 'Very strong'
  return [`Length: ${length}`, `Entropy: ${bits} bits`, `Strength: ${label}`].join('\n')
}

export const passwordStrength = defineTransform({
  meta: {
    id: 'password-strength',
    name: 'Password strength',
    category: 'developer',
    description: 'Estimate how hard a password is to guess.',
    keywords: ['password', 'strength', 'entropy', 'security', 'checker'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type a password to test',
  run,
})
