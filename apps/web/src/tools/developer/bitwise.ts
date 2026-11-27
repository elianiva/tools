import { css } from '../../../styled-system/css'
import { columns, panel, segmented, stack } from '../kit.ts'
import {
  attempt,
  bitRow,
  chips,
  defineWorkbench,
  errorNote,
  facts,
  sectionLabel,
  textField,
} from './ui.ts'

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

const OPERATORS = ['&', '|', '^', '<<', '>>'].map((op) => ({ value: op, label: op }))
const EXPRESSION = /^\s*(-?\d+)\s*(<<|>>|&|\||\^)\s*(-?\d+)\s*$/u

type Parsed = Readonly<{ a: bigint; op: string; b: bigint }>

const parseExpression = (text: string): Parsed | null => {
  const match = EXPRESSION.exec(text)
  return match === null
    ? null
    : { a: BigInt(match[1] ?? '0'), op: match[2] ?? '&', b: BigInt(match[3] ?? '0') }
}

const widthOf = (...values: ReadonlyArray<bigint>): number =>
  values.some((value) => value >= 2n ** 32n || value < -(2n ** 31n)) ? 64 : 32

const flip = (value: bigint, bit: number, width: number): bigint => {
  const flipped = BigInt.asUintN(width, value) ^ (1n << BigInt(bit))
  return value < 0n ? BigInt.asIntN(width, flipped) : flipped
}

const rowsCls = css({ display: 'flex', flexDirection: 'column', gap: '0.9rem', overflowX: 'auto' })

export const bitwise = defineWorkbench({
  meta: {
    id: 'bitwise',
    name: 'Bitwise calculator',
    category: 'developer',
    description: 'AND, OR, XOR, shifts, and NOT on whole numbers of any size.',
    keywords: ['bitwise', 'and', 'or', 'xor', 'shift', 'not', 'binary'],
  },
  example: '12 & 10',
  view: (h, ctx) => {
    const parsed = parseExpression(ctx.input)
    const result =
      ctx.input.trim() === '' ? { value: '', error: '' } : attempt(() => run(ctx.input))
    const out =
      result.error === '' && result.value !== ''
        ? BigInt(/Decimal: (-?\d+)/u.exec(result.value)?.[1] ?? '0')
        : null
    const width = parsed === null ? 32 : widthOf(parsed.a, parsed.b, ...(out === null ? [] : [out]))
    const write = (a: bigint, op: string, b: bigint) => ctx.on.input(`${a} ${op} ${b}`)
    return h.div(
      [h.Class(stack)],
      [
        panel(h, null, [
          textField(h, {
            id: 'bitwise-input',
            label: 'Expression',
            value: ctx.input,
            placeholder: '12 & 10',
            onInput: ctx.on.input,
          }),
          parsed === null
            ? null
            : segmented(h, {
                label: 'Operator',
                value: parsed.op,
                options: OPERATORS,
                onSelect: (op) => write(parsed.a, op, parsed.b),
              }),
          errorNote(h, result.error),
        ]),
        parsed === null || out === null
          ? null
          : columns(h, [
              panel(h, null, [
                sectionLabel(h, `${width}-bit`),
                h.div(
                  [h.Class(rowsCls)],
                  [
                    h.div(
                      [],
                      [
                        h.span([], [`A = ${parsed.a}`]),
                        bitRow(h, {
                          label: 'A',
                          value: parsed.a,
                          width,
                          onToggle: (bit) => write(flip(parsed.a, bit, width), parsed.op, parsed.b),
                        }),
                      ],
                    ),
                    h.div(
                      [],
                      [
                        h.span([], [`B = ${parsed.b}`]),
                        bitRow(h, {
                          label: 'B',
                          value: parsed.b,
                          width,
                          onToggle: (bit) => write(parsed.a, parsed.op, flip(parsed.b, bit, width)),
                        }),
                      ],
                    ),
                    h.div(
                      [],
                      [
                        h.span([], [`Result = ${out}`]),
                        bitRow(h, { label: 'Result', value: out, width }),
                      ],
                    ),
                  ],
                ),
              ]),
              panel(h, null, [
                sectionLabel(h, 'Result'),
                facts(h, [
                  ['Decimal', out.toString(10)],
                  ['Hex', out.toString(16)],
                  ['Binary', out.toString(2)],
                  ['Octal', out.toString(8)],
                ]),
              ]),
            ]),
        parsed !== null || result.error !== '' || ctx.input.trim() === ''
          ? null
          : (() => {
              const unary = /^\s*~\s*(-?\d+)\s*$/u.exec(ctx.input)
              const value = BigInt(unary?.[1] ?? '0')
              const w = widthOf(value)
              return panel(h, null, [
                bitRow(h, {
                  label: 'Operand',
                  value,
                  width: w,
                  onToggle: (bit) => ctx.on.input(`~${flip(value, bit, w)}`),
                }),
                facts(
                  h,
                  result.value
                    .split('\n')
                    .map((line) => [line.split(': ')[0] ?? '', line.split(': ')[1] ?? ''] as const),
                ),
              ])
            })(),
        chips(h, {
          label: 'Examples',
          value: ctx.input,
          options: ['12 & 10', '1 << 4', '255 ^ 15', '~5'].map((v) => ({ value: v, label: v })),
          onPick: ctx.on.input,
        }),
      ],
    )
  },
})
