import { css } from '../../../styled-system/css'
import { columns, panel, stack } from '../kit.ts'
import { attempt, defineWorkbench, errorNote, sectionLabel, textField } from './ui.ts'

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

const partsCls = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '0.5rem',
  '& div': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    padding: '0.6rem 0.7rem',
    borderRadius: 'var(--radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
  },
  '& b': { fontFamily: 'var(--mono)', fontSize: '1.3rem', fontWeight: 500, wordBreak: 'break-all' },
  '& span': { fontSize: '0.72rem', color: 'var(--muted-foreground)' },
  '& [data-diff]': { boxShadow: 'inset 0 0 0 2px var(--warn)', background: 'var(--warn-soft)' },
})
const verdictCls = css({
  margin: 0,
  fontFamily: 'var(--mono)',
  fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
  fontWeight: 500,
})

const split = (value: string): ReadonlyArray<string> => {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/u.exec(
    value.trim(),
  )
  return match === null ? [] : [match[1] ?? '', match[2] ?? '', match[3] ?? '', match[4] ?? '']
}

export const semverCompare = defineWorkbench({
  meta: {
    id: 'semver-compare',
    name: 'Semver comparer',
    category: 'developer',
    description: 'Say which of two semantic versions is newer.',
    keywords: ['semver', 'version', 'compare', 'npm', 'release', 'prerelease'],
  },
  example: '1.2.3',
  opts: { b: '1.10.0' },
  view: (h, ctx) => {
    const a = ctx.input.trim()
    const b = ctx.opt('b').trim()
    const result = a === '' || b === '' ? { value: '', error: '' } : attempt(() => run(`${a} ${b}`))
    const left = split(a)
    const right = split(b)
    const column = (label: string, parts: ReadonlyArray<string>, other: ReadonlyArray<string>) =>
      panel(h, null, [
        sectionLabel(h, label),
        parts.length === 0
          ? null
          : h.div(
              [h.Class(partsCls)],
              ['Major', 'Minor', 'Patch', 'Pre-release'].map((name, index) =>
                h.div(parts[index] === other[index] ? [] : [h.Attribute('data-diff', '')], [
                  h.b([], [parts[index] === '' ? '—' : (parts[index] ?? '')]),
                  h.span([], [name]),
                ]),
              ),
            ),
      ])
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          panel(h, null, [
            textField(h, {
              id: 'semver-a',
              label: 'Version A',
              value: ctx.input,
              placeholder: '1.2.3',
              onInput: ctx.on.input,
            }),
          ]),
          panel(h, null, [
            textField(h, {
              id: 'semver-b',
              label: 'Version B',
              value: ctx.opt('b'),
              placeholder: '1.10.0',
              onInput: ctx.on.option('b'),
            }),
          ]),
        ]),
        errorNote(h, result.error),
        result.value === '' ? null : panel(h, null, [h.p([h.Class(verdictCls)], [result.value])]),
        left.length === 0 || right.length === 0
          ? null
          : columns(h, [column('A', left, right), column('B', right, left)]),
      ],
    )
  },
})
