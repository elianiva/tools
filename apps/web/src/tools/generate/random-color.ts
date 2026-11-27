import { secureInt } from './password.logic.ts'
import { css } from '../../../styled-system/css'
import { stack } from '../kit.ts'
import { copyButton, defineGenerator, smallLabel } from './ui.ts'

export const run = (text: string): string => {
  const count = Math.min(50, Math.max(1, Number.parseInt(text, 10) || 1))
  return Array.from(
    { length: count },
    () => `#${[0, 0, 0].map(() => secureInt(256).toString(16).padStart(2, '0')).join('')}`,
  ).join('\n')
}

const gridCls = css({
  display: 'grid',
  gap: '0.7rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
})
const cardCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 'var(--radius)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  '& > i': { display: 'block', height: '5.5rem', boxShadow: 'inset 0 0 0 1px oklch(0 0 0 / 0.08)' },
  '& > div': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    padding: '0.55rem 2.6rem 0.6rem 0.75rem',
  },
  '& b': { fontFamily: 'var(--mono)', fontWeight: 500, fontSize: '0.95rem' },
  '& small': { fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--muted-foreground)' },
  '& > [data-slot="copy-button"]': { position: 'absolute', right: '0.4rem', bottom: '0.5rem' },
})
const bar = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.8rem',
})

const rgb = (hex: string): string =>
  `rgb(${[1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16)).join(', ')})`

export const randomColor = defineGenerator({
  meta: {
    id: 'random-color',
    name: 'Random colors',
    category: 'generate',
    description: 'Random hex colors. Type how many.',
    keywords: ['random color', 'hex', 'palette', 'swatch', 'colour'],
  },
  fields: [
    {
      label: 'How many',
      initial: '5',
      integer: true,
      min: 1,
      max: 50,
      presets: ['3', '5', '8', '12'],
    },
  ],
  action: 'Generate',
  run,
  view: (h, { out }) => {
    const colors = out.split('\n')
    return h.div(
      [h.Class(stack)],
      [
        h.div(
          [h.Class(bar)],
          [
            smallLabel(h, `${colors.length} ${colors.length === 1 ? 'color' : 'colors'}`),
            copyButton(h, colors.join(', ')),
          ],
        ),
        h.div(
          [h.Class(gridCls)],
          colors.map((hex, index) =>
            h.div(
              [h.Key(`${index}-${hex}`), h.Class(cardCls)],
              [
                h.i([h.Style({ background: hex })], []),
                h.div([], [h.b([], [hex]), h.small([], [rgb(hex)])]),
                copyButton(h, hex),
              ],
            ),
          ),
        ),
      ],
    )
  },
})
