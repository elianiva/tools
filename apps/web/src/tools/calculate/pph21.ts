import { Schema } from 'effect'
import { Submodel } from 'foldkit'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { defineMessageUnion } from 'foldkit/message'
import { css } from '../../../styled-system/css'
import { linkify } from '../facts.ts'
import { columns, field, hint, panel, segmented, stack, textInput } from '../kit.ts'
import { defineTool } from '../tool.ts'
import { calculate, idr, SOURCES, STATUSES, type Layer, type Pph21 } from './pph21.logic.ts'

export { run } from './pph21.logic.ts'

const Model = Schema.Struct({
  gross: Schema.String,
  contribution: Schema.String,
  status: Schema.String,
  year: Schema.Boolean,
})
type Model = typeof Model.Type

const Message = defineMessageUnion({
  ChangedGross: { gross: Schema.String },
  ChangedContribution: { contribution: Schema.String },
  ChangedStatus: { status: Schema.String },
  ChangedScope: { year: Schema.Boolean },
})
type Message = typeof Message.Type

const update = (model: Model, message: Message) =>
  Message.match<{ model: Model }>(message, {
    ChangedGross: ({ gross }) => ({ model: { ...model, gross } }),
    ChangedContribution: ({ contribution }) => ({ model: { ...model, contribution } }),
    ChangedStatus: ({ status }) => ({ model: { ...model, status } }),
    ChangedScope: ({ year }) => ({ model: { ...model, year } }),
  })

/** `15.000.000` and `15,000,000` both mean fifteen million. Anything else is not a number. */
const money = (text: string): number => {
  const clean = text.trim().replaceAll(/[.,_\s]/gu, '')
  return /^\d+$/u.test(clean) ? Number(clean) : Number.NaN
}

const compute = (model: Model): Pph21 | null => {
  const gross = money(model.gross)
  const contribution = model.contribution.trim() === '' ? 0 : money(model.contribution)
  if (!Number.isFinite(gross) || gross <= 0 || !Number.isFinite(contribution)) return null
  const [code = 'TK/0', dependents = '0'] = model.status.split('/')
  return calculate(gross, code === 'K', Number(dependents), contribution)
}

const labelCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const heroCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
  padding: '1.2rem 1.4rem 1.3rem',
  borderRadius: 'calc(var(--radius) * 1.6)',
  background: 'linear-gradient(140deg, var(--tone-soft), transparent 65%), var(--card)',
  boxShadow: 'var(--elev-card)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    width: '4px',
    background: 'var(--tone)',
  },
})
const bigCls = css({
  fontFamily: 'var(--mono)',
  fontSize: 'clamp(2rem, 6vw, 3.4rem)',
  fontWeight: 500,
  letterSpacing: '-0.04em',
  lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--tone-ink)',
  overflowWrap: 'anywhere',
})
const chipsCls = css({ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' })
const chipCls = css({
  padding: '0.15rem 0.6rem',
  borderRadius: '999px',
  background: 'var(--tone-soft)',
  color: 'var(--tone-ink)',
  fontFamily: 'var(--mono)',
  fontSize: '0.75rem',
  fontWeight: 500,
})
const trackCls = css({
  position: 'relative',
  height: '10px',
  borderRadius: '999px',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  overflow: 'hidden',
})
const fillCls = css({
  height: '100%',
  borderRadius: '999px',
  background: 'linear-gradient(90deg, var(--tone-soft), var(--tone))',
  transition: 'width 300ms cubic-bezier(0.23, 1, 0.32, 1)',
})
const scaleCls = css({
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: 'var(--mono)',
  fontSize: '0.7rem',
  color: 'var(--muted-foreground)',
})
const rowsCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.55rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
})
const layerCls = css({
  display: 'grid',
  gridTemplateColumns: '3.2rem 1fr auto',
  alignItems: 'center',
  gap: '0.2rem 0.8rem',
  '& b': { fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--tone-ink)' },
  '& small': {
    gridColumn: '2 / 4',
    fontFamily: 'var(--mono)',
    fontSize: '0.72rem',
    color: 'var(--muted-foreground)',
  },
  '& span': { fontFamily: 'var(--mono)', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' },
})
const stepCls = css({
  display: 'grid',
  gridTemplateColumns: '1.4rem 1fr auto',
  alignItems: 'baseline',
  gap: '0.5rem',
  fontSize: '0.9rem',
  '& i': { fontStyle: 'normal', fontFamily: 'var(--mono)', color: 'var(--muted-foreground)' },
  '& span:last-child': { fontFamily: 'var(--mono)', fontVariantNumeric: 'tabular-nums' },
  '&[data-total] ': {
    paddingBlockStart: '0.45rem',
    boxShadow: 'inset 0 1px 0 var(--hairline)',
    fontWeight: 600,
  },
})
const deltaCls = css({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '1rem',
  flexWrap: 'wrap',
  padding: '0.9rem 1.1rem',
  borderRadius: 'calc(var(--radius) * 1.2)',
  background: 'var(--ok-soft)',
  '&[data-over]': { background: 'var(--warn-soft)' },
  '& strong': { fontFamily: 'var(--mono)', fontSize: '1.5rem', fontVariantNumeric: 'tabular-nums' },
})
const sourcesCls = css({
  margin: 0,
  paddingInlineStart: '1.1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  overflowWrap: 'anywhere',
  '& a': { color: 'var(--tone-ink)' },
})
const gridCls = css({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 24rem), 1fr))',
})

const RANGES: ReadonlyArray<readonly [string, number]> = [
  ['up to Rp 60 jt', 60_000_000],
  ['Rp 60 jt to 250 jt', 190_000_000],
  ['Rp 250 jt to 500 jt', 250_000_000],
  ['Rp 500 jt to 5 M', 4_500_000_000],
  ['above Rp 5 M', 0],
]

const layerRow = <M>(h: HtmlBuilder<M>, layer: Layer, index: number): Html => {
  const [range = '', capacity = 0] = RANGES[index] ?? []
  const fill =
    capacity === 0 ? (layer.taxed > 0 ? 100 : 0) : Math.min(100, (layer.taxed / capacity) * 100)
  return h.li(
    [h.Class(layerCls)],
    [
      h.b([], [`${layer.rate}%`]),
      h.div([h.Class(trackCls)], [h.div([h.Class(fillCls), h.Style({ width: `${fill}%` })], [])]),
      h.span([], [idr(layer.tax)]),
      h.small([], [`${range}${layer.taxed > 0 ? ` · ${idr(layer.taxed)} taxed` : ''}`]),
    ],
  )
}

const step = <M>(
  h: HtmlBuilder<M>,
  sign: string,
  label: string,
  amount: string,
  total = false,
): Html =>
  h.li(
    [h.Class(stepCls), ...(total ? [h.Attribute('data-total', '')] : [])],
    [h.i([], [sign]), h.span([], [label]), h.span([], [amount])],
  )

const yearView = <M>(h: HtmlBuilder<M>, result: Pph21): Html => {
  const y = result.year
  const over = y.december < 0
  return h.div(
    [h.Class(stack)],
    [
      h.div(
        [h.Class(gridCls)],
        [
          panel(h, 'From gross to taxable', [
            h.ul(
              [h.Class(rowsCls)],
              [
                step(h, '', 'Annual gross', idr(y.annualGross)),
                step(h, '−', 'Position allowance (biaya jabatan)', idr(y.allowance)),
                step(h, '−', 'Pension and old-age contributions', idr(y.contributions)),
                step(h, '=', 'Net income', idr(y.net), true),
                step(h, '−', `PTKP ${result.label}`, idr(y.ptkp)),
                step(h, '=', 'Taxable income (PKP)', idr(y.pkp), true),
              ],
            ),
          ]),
          panel(h, 'Article 17 brackets', [
            h.ul(
              [h.Class(rowsCls)],
              y.layers.map((layer, index) => layerRow(h, layer, index)),
            ),
          ]),
        ],
      ),
      h.div(
        [h.Class(deltaCls), ...(over ? [h.Attribute('data-over', '')] : [])],
        [
          h.div(
            [],
            [
              h.span(
                [h.Class(labelCls)],
                [over ? 'December: withheld too much' : 'Withheld in December'],
              ),
              h.div([], [`Year total ${idr(y.tax)} − Jan–Nov ${idr(y.withheld)}`]),
            ],
          ),
          h.strong([], [idr(y.december)]),
        ],
      ),
    ],
  )
}

const resultView = <M>(h: HtmlBuilder<M>, result: Pph21, year: boolean): Html => {
  const percent = result.hundredths / 100
  return h.div(
    [h.Class(stack)],
    [
      h.div(
        [h.Class(heroCls)],
        [
          h.span([h.Class(labelCls)], ['Withheld per month (Jan–Nov)']),
          h.span([h.Class(bigCls)], [idr(result.monthly)]),
          h.div(
            [h.Class(chipsCls)],
            [
              h.span([h.Class(chipCls)], [`TER ${result.category}`]),
              h.span([h.Class(chipCls)], [result.label]),
              h.span([h.Class(chipCls)], [`${percent}% of ${idr(result.gross)}`]),
            ],
          ),
          h.div(
            [h.Class(trackCls)],
            [
              h.div(
                [
                  h.Class(fillCls),
                  h.Style({ width: `${Math.max(2, (result.hundredths / 3400) * 100)}%` }),
                ],
                [],
              ),
            ],
          ),
          h.div([h.Class(scaleCls)], [h.span([], ['0%']), h.span([], ['TER rate · top 34%'])]),
        ],
      ),
      year ? yearView(h, result) : null,
    ],
  )
}

const view = Submodel.defineView<Model, Message>((model, h) => {
  const result = compute(model)
  return h.div(
    [h.Class(stack)],
    [
      columns(h, [
        panel(h, 'Salary', [
          field(
            h,
            {
              label: 'Monthly gross (Rp)',
              for: 'pph21-gross',
              hint: 'Salary plus regular allowances. Dots or commas are fine.',
            },
            textInput(h, {
              id: 'pph21-gross',
              value: model.gross,
              placeholder: '15.000.000',
              onInput: (gross) => Message.ChangedGross({ gross }),
            }),
          ),
          field(
            h,
            {
              label: 'Pension and old-age contributions per month (Rp)',
              for: 'pph21-contribution',
              hint: 'Your share of JHT and JP. Optional.',
            },
            textInput(h, {
              id: 'pph21-contribution',
              value: model.contribution,
              placeholder: '0',
              onInput: (contribution) => Message.ChangedContribution({ contribution }),
            }),
          ),
          h.div(
            [],
            [
              h.span([h.Class(labelCls)], ['PTKP status']),
              segmented(h, {
                label: 'PTKP status',
                value: model.status,
                options: STATUSES.map((status) => ({ value: status as string, label: status })),
                onSelect: (status) => Message.ChangedStatus({ status }),
              }),
            ],
          ),
          segmented(h, {
            label: 'Scope',
            value: model.year ? 'year' : 'month',
            options: [
              { value: 'month', label: 'This month' },
              { value: 'year', label: 'Whole year' },
            ],
            onSelect: (scope) => Message.ChangedScope({ year: scope === 'year' }),
          }),
        ]),
        result === null
          ? panel(h, null, [
              hint(h, 'Enter a monthly gross salary above zero to see the withholding.'),
            ])
          : resultView(h, result, model.year),
      ]),
      panel(h, 'Basis', [
        h.ul(
          [h.Class(sourcesCls)],
          SOURCES.map(([label, url]) =>
            h.li([], url === null ? [label] : [...linkify(h, `${label}: ${url}`)]),
          ),
        ),
        hint(
          h,
          'Assumes a permanent employee on the same gross every month, with no bonus, THR, or zakat.',
        ),
      ]),
    ],
  )
})

export const pph21 = defineTool({
  meta: {
    id: 'pph21',
    name: 'PPh 21 calculator',
    category: 'calculate',
    description:
      'Indonesian employee income tax: monthly TER withholding and the full-year December true-up, by PMK 168/2023.',
    keywords: [
      'pph 21',
      'pajak penghasilan',
      'ter',
      'ptkp',
      'indonesia',
      'gaji',
      'salary tax',
      'december',
    ],
  },
  init: () => ({ gross: '15.000.000', contribution: '', status: 'TK/0', year: true }),
  update,
  view,
})
