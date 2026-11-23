import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-octal') {
    const symbols = text.trim()
    if (!/^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/u.test(symbols))
      throw new Error('Use nine characters such as rwxr-xr-x.')
    return (symbols.match(/.../gu) ?? [])
      .map(
        (group) =>
          (group.charAt(0) === 'r' ? 4 : 0) +
          (group.charAt(1) === 'w' ? 2 : 0) +
          (group.charAt(2) === 'x' ? 1 : 0),
      )
      .join('')
  }
  const octal = text.trim()
  if (!/^[0-7]{3}$/u.test(octal)) throw new Error('Use three octal digits such as 755.')
  return Array.from(octal, (digit) => {
    const bits = Number(digit)
    return `${bits & 4 ? 'r' : '-'}${bits & 2 ? 'w' : '-'}${bits & 1 ? 'x' : '-'}`
  }).join('')
}

export const chmod = defineTransform({
  meta: {
    id: 'chmod',
    name: 'Chmod calculator',
    category: 'developer',
    description: 'Convert Unix permissions between octal and rwx.',
    keywords: ['chmod', 'permissions', 'unix', 'rwx', '755', 'linux'],
  },
  modes: [
    { id: 'to-symbolic', label: 'Octal to rwx' },
    { id: 'to-octal', label: 'rwx to octal' },
  ],
  placeholder: '755',
  example: '755',
  run,
})
