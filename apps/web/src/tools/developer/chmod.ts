import { css } from '../../../styled-system/css'
import { panel, stack } from '../kit.ts'
import { attempt, chips, defineWorkbench, errorNote, facts, textField } from './ui.ts'

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

const PERMS = ['Read', 'Write', 'Execute'] as const
const WHO = ['Owner', 'Group', 'Others'] as const

const gridCls = css({
  display: 'grid',
  gridTemplateColumns: 'max-content repeat(3, minmax(4.5rem, 1fr))',
  alignItems: 'center',
  gap: '0.5rem 0.8rem',
  '& span[data-head]': {
    fontSize: '0.72rem',
    color: 'var(--muted-foreground)',
    textAlign: 'center',
  },
  '& button': {
    height: '2.4rem',
    border: 0,
    borderRadius: 'var(--radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--mono)',
    cursor: 'pointer',
  },
  '& button[aria-pressed="true"]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
    color: 'var(--primary-foreground)',
  },
})

const PRESETS = [
  ['644', 'File'],
  ['755', 'Script'],
  ['600', 'Private'],
  ['700', 'Private dir'],
  ['777', 'Open'],
].map(([value = '', name = '']) => ({ value, label: `${value} ${name}` }))

/** The octal form of what was typed, which may be octal or rwx. */
const normalize = (text: string): string | null => {
  const trimmed = text.trim()
  try {
    if (/^[0-7]{3}$/u.test(trimmed)) return trimmed
    return run(trimmed, 'to-octal')
  } catch {
    return null
  }
}

export const chmod = defineWorkbench({
  meta: {
    id: 'chmod',
    name: 'Chmod calculator',
    category: 'developer',
    description: 'Convert Unix permissions between octal and rwx.',
    keywords: ['chmod', 'permissions', 'unix', 'rwx', '755', 'linux'],
  },
  example: '755',
  view: (h, ctx) => {
    const octal = normalize(ctx.input)
    const check =
      ctx.input.trim() === ''
        ? { value: '', error: '' }
        : attempt(() => {
            if (octal === null)
              throw new Error('Use three octal digits such as 755, or rwx such as rwxr-xr-x.')
            return run(octal, 'to-symbolic')
          })
    const digits = (octal ?? '000').split('').map(Number)
    const toggle = (who: number, perm: number) => {
      const bit = [4, 2, 1][perm] ?? 0
      return ctx.on.input(digits.map((d, at) => (at === who ? d ^ bit : d)).join(''))
    }
    return h.div(
      [h.Class(stack)],
      [
        panel(h, null, [
          textField(h, {
            id: 'chmod-input',
            label: 'Octal or rwx',
            value: ctx.input,
            placeholder: '755 or rwxr-xr-x',
            onInput: ctx.on.input,
          }),
          errorNote(h, check.error),
          chips(h, {
            label: 'Presets',
            value: octal ?? '',
            options: PRESETS.map((p) => ({ value: p.value, label: p.label })),
            onPick: ctx.on.input,
          }),
        ]),
        octal === null
          ? null
          : panel(h, null, [
              h.div(
                [h.Class(gridCls)],
                [
                  h.span([], []),
                  ...PERMS.map((name) => h.span([h.Attribute('data-head', '')], [name])),
                  ...WHO.flatMap((who, wi) => [
                    h.span([], [who]),
                    ...PERMS.map((name, pi) => {
                      const on = ((digits[wi] ?? 0) & ([4, 2, 1][pi] ?? 0)) !== 0
                      return h.button(
                        [
                          h.Type('button'),
                          h.AriaPressed(String(on)),
                          h.AriaLabel(`${who} ${name.toLowerCase()}`),
                          h.OnClick(toggle(wi, pi)),
                        ],
                        [['r', 'w', 'x'][pi] ?? ''],
                      )
                    }),
                  ]),
                ],
              ),
              facts(h, [
                ['Octal', octal],
                ['Symbolic', check.value],
                ['Command', `chmod ${octal} file`],
              ]),
            ]),
      ],
    )
  },
})
