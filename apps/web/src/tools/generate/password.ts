import { Effect, Schema } from 'effect'
import { Command, Submodel } from 'foldkit'
import { defineMessageUnion } from 'foldkit/message'
import { Elements } from '@tools/ui'
import { css } from '../../../styled-system/css'
import { button, checkbox, columns, meter, panel, range, row, stack, stats } from '../kit.ts'
import { defineTool } from '../tool.ts'
import { entropyBits, generatePassword, secureInt, SET_IDS, type SetId } from './password.logic.ts'

const LABELS: Readonly<Record<SetId, string>> = {
  lower: 'a–z',
  upper: 'A–Z',
  digits: '0–9',
  symbols: '!@#',
}

const Model = Schema.Struct({
  length: Schema.Finite,
  sets: Schema.Array(Schema.String),
  password: Schema.String,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedLength: { length: Schema.Finite },
  ToggledSet: { id: Schema.String },
  ClickedGenerate: {},
  Generated: { password: Schema.String },
})
type Message = typeof Message.Type

const isSet = (id: string): id is SetId => SET_IDS.some((known) => known === id)
const setsOf = (model: Model): ReadonlyArray<SetId> => model.sets.filter(isSet)

const Generate = Command.define('GeneratePassword', {
  args: { length: Schema.Finite, sets: Schema.Array(Schema.String) },
  messages: [Message.Generated],
  execute: ({ length, sets }) =>
    Effect.sync(() =>
      Message.Generated({ password: generatePassword(length, sets.filter(isSet), secureInt) }),
    ),
})

const regenerate = (model: Model) => ({
  model,
  commands: [Generate({ length: model.length, sets: model.sets })],
})

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model; commands?: ReadonlyArray<Command.Command<Message>> }>(message, {
    ChangedLength: ({ length }) => regenerate({ ...model, length }),
    ToggledSet: ({ id }) => {
      const on = model.sets.includes(id)
      // The last kind cannot be switched off: a password needs some characters.
      if (on && model.sets.length === 1) return { model }
      return regenerate({
        ...model,
        sets: on ? model.sets.filter((set) => set !== id) : [...model.sets, id],
      })
    },
    ClickedGenerate: () => regenerate(model),
    Generated: ({ password }) => ({ model: { ...model, password } }),
  })

const kindOf = (char: string): string =>
  /\d/u.test(char) ? 'digit' : /[a-z]/iu.test(char) ? 'letter' : 'symbol'

const strengthLabel = (bits: number): string =>
  bits < 40 ? 'Weak' : bits < 64 ? 'Fair' : bits < 100 ? 'Strong' : 'Excellent'

const passwordCls = css({
  position: 'relative',
  padding: '1.4rem 3rem 1.4rem 1.4rem',
  borderRadius: 'var(--radius)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  fontFamily: 'var(--mono)',
  fontSize: 'clamp(1.3rem, 3vw, 2rem)',
  letterSpacing: '0.04em',
  wordBreak: 'break-all',
  '& [data-kind=digit]': { color: 'oklch(0.55 0.2 255)' },
  '& [data-kind=symbol]': { color: 'oklch(0.58 0.22 25)' },
  '& > button': { position: 'absolute', top: '0.6rem', right: '0.6rem' },
})

const view = Submodel.defineView<Model, Message>((model, h) => {
  const bits = entropyBits(model.length, setsOf(model))
  return h.div(
    [h.Class(stack)],
    [
      panel(h, null, [
        h.div(
          [h.Class(passwordCls)],
          [
            h.div(
              [h.AriaLabel('Password'), h.Tabindex(0)],
              [...model.password].map((char) =>
                h.span([h.Attribute('data-kind', kindOf(char))], [char]),
              ),
            ),
            Elements.copyButton(h, false, h.Attribute('data-copy', model.password)),
          ],
        ),
        meter(h, {
          label: strengthLabel(bits),
          value: Math.min(bits, 128),
          limit: 128,
          display: `${bits} bits`,
        }),
        h.div(
          [h.Class(row)],
          [
            button(
              h,
              { variant: 'primary' },
              [h.OnClick(Message.ClickedGenerate())],
              ['Generate another'],
            ),
          ],
        ),
      ]),
      columns(h, [
        panel(h, `Length ${model.length}`, [
          range(h, {
            id: 'password-length',
            min: 8,
            max: 64,
            value: model.length,
            onInput: (length) => Message.ChangedLength({ length }),
          }),
        ]),
        panel(
          h,
          'Characters',
          SET_IDS.map((id) =>
            checkbox(h, {
              id: `password-${id}`,
              label: LABELS[id],
              checked: model.sets.includes(id),
              onToggle: Message.ToggledSet({ id }),
            }),
          ),
        ),
      ]),
      stats(h, [
        ['Strength', `${bits} bits`],
        ['Length', String(model.length)],
      ]),
    ],
  )
})

export const passwordGenerator = defineTool({
  meta: {
    id: 'password',
    name: 'Password generator',
    category: 'generate',
    description: 'Strong random passwords from your device’s secure random source.',
    keywords: ['random', 'secure', 'strong', 'passphrase', 'entropy', 'secret'],
  },
  // Random on purpose: the page opens with a usable password instead of an empty box.
  init: () => ({
    length: 20,
    sets: [...SET_IDS],
    password: generatePassword(20, SET_IDS, secureInt),
  }),
  update,
  view,
})
