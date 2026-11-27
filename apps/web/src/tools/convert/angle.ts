import { css } from '../../../styled-system/css'
import { range } from '../kit.ts'
import {
  card,
  convertBetween,
  defineForm,
  formatValue,
  linear,
  parseNumber,
  unitConverter,
  unitStart,
  type UnitSet,
} from './ui.ts'

export const run = (text: string, mode: string): string => {
  const value = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(value)) throw new Error('Enter a number.')
  const degrees = mode === 'rad' ? (value * 180) / Math.PI : mode === 'grad' ? value * 0.9 : value
  const clean = (n: number): number => Number(n.toPrecision(7))
  return [
    `Degrees: ${clean(degrees)}`,
    `Radians: ${clean((degrees * Math.PI) / 180)}`,
    `Gradians: ${clean(degrees / 0.9)}`,
  ].join('\n')
}

const sets: ReadonlyArray<UnitSet> = [
  {
    id: 'angle',
    name: 'Angle',
    units: [
      linear('deg', '°', 1),
      linear('rad', 'rad', 180 / Math.PI),
      linear('grad', 'grad', 0.9),
    ],
  },
]

const dialCls = css({
  position: 'relative',
  width: '9rem',
  height: '9rem',
  margin: '0 auto',
  borderRadius: '50%',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  '& i': {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '2px',
    height: '44%',
    marginLeft: '-1px',
    transformOrigin: '50% 0',
    background: 'var(--primary)',
    borderRadius: '2px',
  },
  '& b': {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '44%',
    height: '2px',
    marginTop: '-1px',
    background: 'var(--muted-foreground)',
    opacity: 0.5,
  },
})

export const angle = defineForm({
  meta: {
    id: 'angle',
    name: 'Angle converter',
    category: 'convert',
    description: 'Degrees, radians, and gradians.',
    keywords: ['angle', 'degrees', 'radians', 'gradians', 'trigonometry', 'pi'],
  },
  init: unitStart(sets, 'deg', 'rad', '180'),
  view: (form, h) => {
    const degrees = convertBetween(
      sets[0] ?? { id: '', name: '', units: [] },
      parseNumber(form.get('amount')),
      form.get('from') || 'deg',
      'deg',
    )
    const shown = Number.isFinite(degrees) ? degrees : 0
    const set = sets[0] as UnitSet
    return unitConverter(h, form, {
      sets,
      extra: card(h, null, [
        h.div(
          [h.Class(dialCls)],
          [h.b([], []), h.i([h.Style({ transform: `rotate(${180 - shown}deg)` })], [])],
        ),
        range(h, {
          id: 'dial',
          min: 0,
          max: 360,
          value: Math.min(360, Math.max(0, shown)),
          onInput: (value) =>
            form.patch({
              from: 'deg',
              amount: String(value),
              right: formatValue(convertBetween(set, value, 'deg', form.get('to') || 'rad')),
            }),
        }),
      ]),
    })
  },
})
