import { Effect, Schema } from 'effect'
import { Command, Submodel } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { button, field, row, segmented, textArea } from '../kit.ts'
import { defineTool } from '../tool.ts'
import { copyButton, layout, smallLabel } from './ui.ts'
import { secureInt } from './password.logic.ts'

export const run = (text: string, mode: string): string => {
  const items = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
  if (items.length === 0) throw new Error('Enter at least one item.')
  if (mode === 'shuffle') {
    const out = [...items]
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = secureInt(i + 1)
      const held = out[i] ?? ''
      out[i] = out[j] ?? ''
      out[j] = held
    }
    return out.join('\n')
  }
  return items[secureInt(items.length)] ?? ''
}

const Model = Schema.Struct({
  text: Schema.String,
  mode: Schema.String,
  /** The highlighted item while the picker spins, and the winner once it stops. */
  active: Schema.Finite,
  winner: Schema.Finite,
  spinning: Schema.Boolean,
  remaining: Schema.Finite,
  order: Schema.Array(Schema.String),
  winners: Schema.Array(Schema.String),
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedText: { text: Schema.String },
  ChangedMode: { mode: Schema.String },
  ClickedGo: {},
  Chose: { result: Schema.String },
  Shuffled: { order: Schema.Array(Schema.String) },
  Stepped: {},
})
type Message = typeof Message.Type

const itemsOf = (text: string): ReadonlyArray<string> =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')

const Choose = Command.define('ChooseItem', {
  args: { text: Schema.String, mode: Schema.String },
  messages: [Message.Chose, Message.Shuffled],
  execute: ({ text, mode }) =>
    Effect.sync(() => {
      try {
        const result = run(text, mode)
        return mode === 'shuffle'
          ? Message.Shuffled({ order: result.split('\n') })
          : Message.Chose({ result })
      } catch {
        return Message.Shuffled({ order: [] })
      }
    }),
})

const Step = Command.define('StepSpinner', {
  args: { delay: Schema.Finite },
  messages: [Message.Stepped],
  execute: ({ delay }) => Effect.sleep(delay).pipe(Effect.as(Message.Stepped())),
})

const idle = { spinning: false, remaining: 0, winner: -1, order: [] }

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
    ChangedText: ({ text }) => ({ model: { ...model, ...idle, text } }),
    ChangedMode: ({ mode }) => ({ model: { ...model, ...idle, mode } }),
    ClickedGo: () => ({
      model: { ...model, ...idle, spinning: model.mode === 'pick' },
      commands: [Choose({ text: model.text, mode: model.mode })],
    }),
    Shuffled: ({ order }) => ({ model: { ...model, order } }),
    Chose: ({ result }) => {
      const items = itemsOf(model.text)
      const target = items.indexOf(result)
      if (!model.spinning || target < 0) return { model: { ...model, spinning: false } }
      const count = items.length
      const travel = (target - model.active + count) % count
      const remaining = 2 * count + travel
      return { model: { ...model, remaining }, commands: [Step({ delay: 60 })] }
    },
    Stepped: () => {
      const items = itemsOf(model.text)
      if (!model.spinning || items.length === 0) return { model }
      const active = (model.active + 1) % items.length
      const remaining = model.remaining - 1
      if (remaining > 0) {
        return {
          model: { ...model, active, remaining },
          commands: [Step({ delay: remaining < 10 ? 60 + (10 - remaining) * 35 : 60 })],
        }
      }
      return {
        model: {
          ...model,
          active,
          remaining: 0,
          spinning: false,
          winner: active,
          winners: [items[active] ?? '', ...model.winners].slice(0, 8),
        },
      }
    },
  })

const chipsCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  padding: '1.1rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  '& span': {
    padding: '0.45rem 0.9rem',
    borderRadius: '10px',
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    fontSize: '1rem',
    transition: 'transform 120ms, background 120ms',
  },
  '& span[data-active]': {
    background: 'var(--tone-soft)',
    boxShadow: 'inset 0 0 0 2px var(--tone)',
  },
  '& span[data-winner]': {
    background: 'var(--tone)',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--primary-foreground)',
    fontWeight: 600,
    transform: 'scale(1.08)',
  },
})
const orderCls = css({
  position: 'relative',
  margin: 0,
  padding: '1.1rem 3.4rem 1.1rem 2.6rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  '& > [data-slot="copy-button"]': { position: 'absolute', top: '0.6rem', right: '0.6rem' },
})
const winnersCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.85rem',
  color: 'var(--muted-foreground)',
  '& b': { color: 'var(--foreground)', fontWeight: 550 },
})

const view = Submodel.defineView<Model, Message>((model, h) => {
  const items = itemsOf(model.text)
  const picking = model.mode === 'pick'
  const done = !model.spinning && model.winner >= 0
  return layout(
    h,
    [
      segmented(h, {
        label: 'Action',
        value: model.mode,
        options: [
          { value: 'pick', label: 'Pick one' },
          { value: 'shuffle', label: 'Shuffle' },
        ],
        onSelect: (mode) => Message.ChangedMode({ mode }),
      }),
      field(
        h,
        { label: `Items (${items.length})`, for: 'random-picker-items' },
        textArea(h, {
          id: 'random-picker-items',
          value: model.text,
          placeholder: 'One item per line',
          rows: 8,
          onInput: (text) => Message.ChangedText({ text }),
        }),
      ),
      h.div(
        [h.Class(row)],
        [
          button(
            h,
            { variant: 'primary' },
            [h.Disabled(items.length === 0 || model.spinning), h.OnClick(Message.ClickedGo())],
            [picking ? 'Pick' : 'Shuffle'],
          ),
        ],
      ),
    ],
    [
      picking || model.order.length === 0
        ? h.div(
            [h.Class(chipsCls)],
            items.length === 0
              ? [h.span([], ['Add at least one item.'])]
              : items.map((item, index) =>
                  h.span(
                    [
                      h.Key(`${index}-${item}`),
                      ...(model.spinning && index === model.active
                        ? [h.Attribute('data-active', '')]
                        : []),
                      ...(done && index === model.winner ? [h.Attribute('data-winner', '')] : []),
                    ],
                    [item],
                  ),
                ),
          )
        : h.div(
            [h.Class(orderCls)],
            [
              h.ol(
                [
                  h.Class(
                    css({
                      margin: 0,
                      paddingInlineStart: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }),
                  ),
                ],
                model.order.map((item) => h.li([], [item])),
              ),
              copyButton(h, model.order.join('\n')),
            ],
          ),
      model.winners.length === 0 || !picking
        ? null
        : h.div(
            [h.Class(winnersCls)],
            [
              smallLabel(h, 'Winners'),
              ...model.winners.map((winner, index) => h.b([h.Key(`${index}`)], [winner])),
            ],
          ),
    ],
  )
})

export const randomPicker = defineTool({
  meta: {
    id: 'random-picker',
    name: 'Random picker',
    category: 'generate',
    description: 'Pick a winner or shuffle a list, one item per line.',
    keywords: ['random', 'raffle', 'shuffle', 'draw', 'choose', 'giveaway'],
  },
  init: (): Model => ({
    text: 'pizza\nramen\ntacos\nsushi',
    mode: 'pick',
    active: 0,
    winners: [],
    ...idle,
  }),
  update,
  view,
})
