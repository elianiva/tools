import { secureInt } from './password.logic.ts'
import { css } from '../../../styled-system/css'
import { stack } from '../kit.ts'
import { splitBar } from '../calculate/money-ui.ts'
import { defineGenerator } from './ui.ts'

export const run = (text: string): string => {
  const count = Math.min(1000, Math.max(1, Number.parseInt(text, 10) || 1))
  const flips = Array.from({ length: count }, () => (secureInt(2) === 0 ? 'H' : 'T'))
  const heads = flips.filter((flip) => flip === 'H').length
  const totals = `Heads: ${heads}\nTails: ${count - heads}`
  return count <= 20 ? `${flips.join(' ')}\n${totals}` : totals
}

const stageCls = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  padding: '1.6rem 1rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  perspective: '900px',
})
const coinCls = css({
  position: 'relative',
  width: '9rem',
  height: '9rem',
  transformStyle: 'preserve-3d',
  transition: 'transform 900ms cubic-bezier(0.2, 0.7, 0.2, 1)',
  '& div': {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    backfaceVisibility: 'hidden',
    fontFamily: 'var(--mono)',
    fontSize: '3.4rem',
    fontWeight: 600,
    color: 'oklch(0.32 0.06 80)',
    background: 'radial-gradient(circle at 35% 30%, oklch(0.9 0.12 90), oklch(0.74 0.14 80))',
    boxShadow:
      'inset 0 0 0 6px oklch(0.8 0.13 85), inset 0 0 0 8px oklch(0.6 0.12 75), 0 8px 18px oklch(0 0 0 / 0.2)',
  },
  '& div + div': { transform: 'rotateY(180deg)' },
})
const flipsCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.3rem',
  justifyContent: 'center',
  '& i': {
    display: 'grid',
    placeItems: 'center',
    width: '1.9rem',
    height: '1.9rem',
    borderRadius: '50%',
    fontStyle: 'normal',
    fontFamily: 'var(--mono)',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: 'oklch(0.85 0.12 88)',
    color: 'oklch(0.32 0.06 80)',
  },
  '& i[data-tails]': { background: 'oklch(0.78 0.04 250)', color: 'oklch(0.3 0.04 250)' },
})

export const coinFlip = defineGenerator({
  meta: {
    id: 'coin-flip',
    name: 'Coin flip',
    category: 'generate',
    description: 'Flip a coin once or up to a thousand times.',
    keywords: ['coin', 'flip', 'heads', 'tails', 'random', 'toss'],
  },
  fields: [
    {
      label: 'Flips',
      initial: '1',
      integer: true,
      min: 1,
      max: 1000,
      presets: ['1', '5', '10', '100'],
    },
  ],
  action: 'Flip',
  run,
  view: (h, { out, rolls }) => {
    const lines = out.split('\n')
    const flips = lines.length === 3 ? (lines[0] ?? '').split(' ') : []
    const heads = Number((lines.at(-2) ?? '').replace('Heads: ', ''))
    const tails = Number((lines.at(-1) ?? '').replace('Tails: ', ''))
    const single = heads + tails === 1
    const angle = rolls * 1080 + (single && tails === 1 ? 180 : 0)
    return h.div(
      [h.Class(stack)],
      [
        h.div(
          [h.Class(stageCls)],
          [
            single
              ? h.div(
                  [h.Class(coinCls), h.Style({ transform: `rotateY(${angle}deg)` })],
                  [h.div([], ['H']), h.div([], ['T'])],
                )
              : null,
            flips.length === 0
              ? null
              : h.div(
                  [h.Class(flipsCls)],
                  flips.map((flip) =>
                    h.i(flip === 'T' ? [h.Attribute('data-tails', '')] : [], [flip]),
                  ),
                ),
            single ? h.span([], [heads === 1 ? 'Heads' : 'Tails']) : null,
          ],
        ),
        splitBar(h, 'Heads and tails', [
          { label: 'Heads', value: heads, text: String(heads), tone: 'warn' },
          { label: 'Tails', value: tails, text: String(tails), tone: 'info' },
        ]),
      ],
    )
  },
})
