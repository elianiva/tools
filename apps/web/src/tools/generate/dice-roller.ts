import { secureInt } from './password.logic.ts'
import { css } from '../../../styled-system/css'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { stack } from '../kit.ts'
import { defineGenerator, hero } from './ui.ts'

export const run = (text: string): string => {
  const match = /^\s*(\d*)d(\d+)\s*([+-]\s*\d+)?\s*$/iu.exec(text)
  if (match === null) throw new Error('Write a roll like 2d6+3.')
  const count = match[1] === '' || match[1] === undefined ? 1 : Number(match[1])
  const sides = Number(match[2])
  const bonus = Number((match[3] ?? '0').replaceAll(/\s/gu, ''))
  if (count < 1 || count > 100 || sides < 2 || sides > 1000)
    throw new Error('Use 1 to 100 dice with 2 to 1000 sides.')
  const rolls = Array.from({ length: count }, () => secureInt(sides) + 1)
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + bonus
  return `Rolls: ${rolls.join(', ')}\nTotal: ${total}`
}

const PIPS: Readonly<Record<number, ReadonlyArray<readonly [number, number]>>> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [2, 0],
    [0, 2],
    [2, 2],
  ],
  5: [
    [0, 0],
    [2, 0],
    [1, 1],
    [0, 2],
    [2, 2],
  ],
  6: [
    [0, 0],
    [2, 0],
    [0, 1],
    [2, 1],
    [0, 2],
    [2, 2],
  ],
}

const diceCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.8rem',
  padding: '1.4rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  '& svg': {
    width: '4.6rem',
    height: '4.6rem',
    transition: 'transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1)',
  },
  '& text': {
    fontFamily: 'var(--mono)',
    fontSize: '28px',
    fontWeight: 600,
    fill: 'var(--foreground)',
  },
})
const historyCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  fontFamily: 'var(--mono)',
  fontSize: '0.85rem',
  '& li': { display: 'flex', justifyContent: 'space-between', gap: '1rem' },
  '& small': { color: 'var(--muted-foreground)' },
})

const parse = (out: string): Readonly<{ rolls: ReadonlyArray<number>; total: number }> => {
  const [rolls = '', total = ''] = out.split('\n')
  return {
    rolls: rolls.replace('Rolls: ', '').split(', ').map(Number),
    total: Number(total.replace('Total: ', '')),
  }
}

const die = <M>(h: HtmlBuilder<M>, value: number, sides: number, turn: number, key: number): Html =>
  h.svg(
    [
      h.Key(String(key)),
      h.Attribute('viewBox', '0 0 60 60'),
      h.Role('img'),
      h.AriaLabel(`Rolled ${value}`),
      h.Style({ transform: `rotate(${turn}deg)` }),
    ],
    [
      h.rect(
        [
          h.Attribute('x', '2'),
          h.Attribute('y', '2'),
          h.Attribute('width', '56'),
          h.Attribute('height', '56'),
          h.Attribute('rx', '12'),
          h.Attribute('fill', 'var(--card)'),
          h.Attribute('stroke', 'var(--foreground)'),
          h.Attribute('stroke-width', '2'),
        ],
        [],
      ),
      ...(sides === 6
        ? (PIPS[value] ?? []).map(([x, y]) =>
            h.circle(
              [
                h.Attribute('cx', String(15 + x * 15)),
                h.Attribute('cy', String(15 + y * 15)),
                h.Attribute('r', '5'),
                h.Attribute('fill', 'var(--foreground)'),
              ],
              [],
            ),
          )
        : [
            h.text(
              [
                h.Attribute('x', '30'),
                h.Attribute('y', '39'),
                h.Attribute('text-anchor', 'middle'),
                h.Attribute('font-size', value >= 100 ? '20' : '26'),
              ],
              [String(value)],
            ),
          ]),
    ],
  )

export const diceRoller = defineGenerator({
  meta: {
    id: 'dice-roller',
    name: 'Dice roller',
    category: 'generate',
    description: 'Roll dice written like 2d6+3.',
    keywords: ['dice', 'd20', 'roll', 'rpg', 'tabletop', 'random'],
  },
  fields: [
    {
      label: 'Dice',
      initial: '2d6+3',
      text: { pattern: /^\s*\d*d\d+\s*(?:[+-]\s*\d+)?\s*$/iu, message: 'Write a roll like 2d6+3.' },
      presets: ['1d4', '1d6', '2d6', '1d8', '1d10', '1d12', '1d20', '1d100'],
    },
  ],
  action: 'Roll',
  run,
  view: (h, { out, history, rolls, values }) => {
    const { rolls: faces, total } = parse(out)
    const sides = Number(/d(\d+)/iu.exec(values[0] ?? '')?.[1] ?? 6)
    const sum = faces.reduce((a, b) => a + b, 0)
    const bonus = total - sum
    return h.div(
      [h.Class(stack)],
      [
        h.div(
          [h.Class(diceCls)],
          faces.slice(0, 24).map((face, index) => die(h, face, sides, rolls * 360, index)),
        ),
        hero(h, 'Total', String(total), [
          h.span(
            [],
            [
              bonus === 0
                ? faces.join(' + ')
                : `${faces.join(' + ')} ${bonus > 0 ? '+' : '−'} ${Math.abs(bonus)}`,
            ],
          ),
        ]),
        history.length === 0
          ? null
          : h.ul(
              [h.Class(historyCls)],
              history.map((entry) => {
                const past = parse(entry)
                return h.li(
                  [],
                  [h.b([], [String(past.total)]), h.small([], [past.rolls.join(', ')])],
                )
              }),
            ),
      ],
    )
  },
})
