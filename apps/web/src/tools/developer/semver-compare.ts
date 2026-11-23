import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  type Parsed = Readonly<{ nums: ReadonlyArray<number>; pre: ReadonlyArray<string> }>
  const parse = (value: string): Parsed => {
    const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/u.exec(value)
    if (match === null) throw new Error(`"${value}" is not a semantic version.`)
    return {
      nums: [Number(match[1]), Number(match[2]), Number(match[3])],
      pre: match[4] === undefined ? [] : match[4].split('.'),
    }
  }
  const compare = (a: Parsed, b: Parsed): number => {
    for (let i = 0; i < 3; i += 1) {
      const difference = (a.nums[i] ?? 0) - (b.nums[i] ?? 0)
      if (difference !== 0) return difference
    }
    if (a.pre.length === 0 || b.pre.length === 0) return b.pre.length - a.pre.length
    for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i += 1) {
      const x = a.pre[i]
      const y = b.pre[i]
      if (x === undefined) return -1
      if (y === undefined) return 1
      const xNumeric = /^\d+$/u.test(x)
      const yNumeric = /^\d+$/u.test(y)
      if (xNumeric && yNumeric) {
        if (Number(x) !== Number(y)) return Number(x) - Number(y)
      } else if (xNumeric) {
        return -1
      } else if (yNumeric) {
        return 1
      } else if (x !== y) {
        return x < y ? -1 : 1
      }
    }
    return 0
  }
  const tokens = text.trim().split(/\s+/u)
  const [first, second] = tokens
  if (tokens.length !== 2 || first === undefined || second === undefined)
    throw new Error('Enter two versions, such as 1.2.3 1.10.0.')
  const result = compare(parse(first), parse(second))
  if (result === 0) return 'Both versions are equal.'
  return result > 0 ? `${first} is greater than ${second}` : `${second} is greater than ${first}`
}

export const semverCompare = defineTransform({
  meta: {
    id: 'semver-compare',
    name: 'Semver comparer',
    category: 'developer',
    description: 'Say which of two semantic versions is newer.',
    keywords: ['semver', 'version', 'compare', 'npm', 'release', 'prerelease'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '1.2.3 1.10.0',
  example: '1.2.3 1.10.0',
  fields: [
    { label: 'Version A', kind: 'text' },
    { label: 'Version B', kind: 'text' },
  ],
  run,
})
