import { secureInt } from './password.logic.ts'
import { css } from '../../../styled-system/css'
import { stack } from '../kit.ts'
import { dataTable } from '../calculate/money-ui.ts'
import { copyButton, defineGenerator } from './ui.ts'

export const run = (text: string): string => {
  const [min, max, count = 1] = (text.match(/-?\d+/gu) ?? []).map(Number)
  if (min === undefined || max === undefined)
    throw new Error('Enter a minimum and a maximum, such as 1 100 5.')
  if (min > max) throw new Error('The minimum cannot be above the maximum.')
  if (max - min + 1 > 4_294_967_296) throw new Error('The range can span up to 4 billion numbers.')
  if (count < 1 || count > 100) throw new Error('Draw 1 to 100 numbers.')
  return Array.from({ length: count }, () => min + secureInt(max - min + 1)).join(', ')
}

const cardCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
  padding: '1.1rem 3.4rem 1.1rem 1.1rem',
  position: 'relative',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  '& > [data-slot="copy-button"]': { position: 'absolute', top: '0.6rem', right: '0.6rem' },
  '& b': {
    padding: '0.35rem 0.8rem',
    borderRadius: '10px',
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    fontFamily: 'var(--mono)',
    fontSize: '1.5rem',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  '&[data-single] b': { fontSize: 'clamp(2.4rem, 8vw, 4.5rem)', padding: '0.5rem 1.2rem' },
})

export const randomNumber = defineGenerator({
  meta: {
    id: 'random-number',
    name: 'Random number',
    category: 'generate',
    description: 'Draw random whole numbers from a range.',
    keywords: ['random', 'number', 'lottery', 'range', 'draw', 'integer'],
  },
  fields: [
    { label: 'Minimum', initial: '1', integer: true, min: -1_000_000_000_000 },
    { label: 'Maximum', initial: '100', integer: true, min: -1_000_000_000_000 },
    { label: 'How many', initial: '5', integer: true, min: 1, max: 100 },
  ],
  action: 'Draw again',
  run,
  view: (h, { out, history }) => {
    const numbers = out.split(', ')
    return h.div(
      [h.Class(stack)],
      [
        h.div(
          [h.Class(cardCls), ...(numbers.length === 1 ? [h.Attribute('data-single', '')] : [])],
          [...numbers.map((value) => h.b([], [value])), copyButton(h, out)],
        ),
        history.length === 0
          ? null
          : dataTable(
              h,
              ['Earlier draws'],
              history.map((draw) => [draw]),
            ),
      ],
    )
  },
})
