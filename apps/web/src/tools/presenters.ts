// How a tool shows its answer. Each presenter reads the same text the tool returns, so the
// tool's logic and tests stay as they are; only the look changes.
import { Elements } from '@tools/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { css } from '../../styled-system/css'
import { factsView, parseFacts } from './facts.ts'
import { output } from './kit.ts'

export type Present =
  | 'swatch'
  | 'tokens'
  | 'pairs'
  | 'bars'
  | 'verdict'
  | 'facts'
  | 'list'
  | 'display'
  | 'code'
  | 'chmod'

const labelCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const wrapCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
})
const copyCls = css({ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 1 })
const swatchRowCls = css({
  display: 'grid',
  gap: '0.6rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
})
const swatchCls = css({
  display: 'flex',
  alignItems: 'flex-end',
  minHeight: '6rem',
  padding: '0.5rem 0.6rem',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--elev-card), inset 0 0 0 1px oklch(0 0 0 / 0.08)',
  fontFamily: 'var(--mono)',
  fontSize: '0.75rem',
  '& span': {
    padding: '0.1rem 0.4rem',
    borderRadius: '5px',
    background: 'oklch(1 0 0 / 0.85)',
    color: 'oklch(0.25 0 0)',
  },
})
const chipsCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.4rem',
  padding: '1rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
})
const chipCls = css({
  padding: '0.3rem 0.65rem',
  borderRadius: '8px',
  background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
  boxShadow: 'var(--elev-raised)',
  fontFamily: 'var(--mono)',
  fontSize: '1rem',
  letterSpacing: '0.05em',
  '&[data-gap]': {
    background: 'transparent',
    boxShadow: 'none',
    color: 'var(--tone)',
    fontSize: '1.3rem',
  },
})
const cardsCls = css({
  display: 'grid',
  gap: '0.6rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 15rem), 1fr))',
})
const cardCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.8rem 1rem',
  borderRadius: 'var(--radius)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-raised)',
  borderInlineStart: '3px solid var(--tone)',
  '& b': {
    fontFamily: 'var(--mono)',
    fontWeight: 500,
    fontSize: '1.05rem',
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'anywhere',
  },
})
const barRowCls = css({
  display: 'grid',
  gridTemplateColumns: '3.5rem 1fr auto',
  alignItems: 'center',
  gap: '0.7rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.85rem',
  '& i': {
    display: 'block',
    height: '14px',
    borderRadius: '4px',
    background: 'linear-gradient(90deg, var(--tone-soft), var(--tone))',
    transition: 'width 250ms cubic-bezier(0.23, 1, 0.32, 1)',
  },
  '& small': { color: 'var(--muted-foreground)' },
})
const barsCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  padding: '1rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  maxHeight: '28rem',
  overflow: 'auto',
})

const copy = <M>(h: HtmlBuilder<M>, text: string): Html =>
  h.div([h.Class(copyCls)], [Elements.copyButton(h, false, h.Attribute('data-copy', text))])

const lines = (text: string): ReadonlyArray<string> =>
  text.split('\n').filter((line) => line.trim() !== '')

const split = (line: string): ReadonlyArray<string> =>
  line.split(/\s{2,}/u).filter((part) => part !== '')

const swatch = <M>(h: HtmlBuilder<M>, input: string, value: string): Html => {
  const found = [
    ...new Set(`${input}\n${value}`.match(/#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/giu) ?? []),
  ].slice(0, 12)
  const hasFacts = parseFacts(value).facts.length > 0 && /^[^:\n]{1,48}: /u.test(value)
  return h.div(
    [h.Class(wrapCls)],
    [
      found.length === 0
        ? null
        : h.div(
            [h.Class(swatchRowCls)],
            found.map((color) =>
              h.div(
                [h.Class(swatchCls), h.Style({ background: color })],
                [h.span([], [color.toLowerCase()])],
              ),
            ),
          ),
      hasFacts
        ? factsView(h, value)
        : found.length > 1 && lines(value).every((line) => found.includes(line))
          ? copy(h, value)
          : lines(value).some((line) => split(line).length > 1)
            ? pairs(h, value)
            : output(h, { label: 'Output', value }),
    ],
  )
}

const tokens = <M>(h: HtmlBuilder<M>, value: string): Html =>
  h.div(
    [h.Class(wrapCls)],
    [
      h.div(
        [h.Class(chipsCls)],
        value
          .split(/\s+/u)
          .filter((token) => token !== '')
          .map((token) =>
            h.span(
              [
                h.Class(chipCls),
                ...(token === '/' || token === '-' ? [h.Attribute('data-gap', '')] : []),
              ],
              [token],
            ),
          ),
      ),
      copy(h, value),
    ],
  )

function pairs<M>(h: HtmlBuilder<M>, value: string): Html {
  return h.div(
    [h.Class(wrapCls)],
    [
      h.div(
        [h.Class(cardsCls)],
        lines(value).map((line) => {
          const [label = '', ...rest] = split(line)
          return h.div(
            [h.Class(cardCls)],
            rest.length === 0
              ? [h.b([], [label])]
              : [h.span([h.Class(labelCls)], [label]), h.b([], [rest.join('  ')])],
          )
        }),
      ),
      copy(h, value),
    ],
  )
}

const bars = <M>(h: HtmlBuilder<M>, value: string): Html => {
  const rows = lines(value).map(split)
  const top = Math.max(1, ...rows.map(([, count]) => Number(count) || 0))
  return h.div(
    [h.Class(wrapCls)],
    [
      h.div(
        [h.Class(barsCls)],
        rows.map(([label = '', count = '0', percent = '']) =>
          h.div(
            [h.Class(barRowCls)],
            [
              h.span([], [label]),
              h.i([h.Style({ width: `${Math.max(2, ((Number(count) || 0) / top) * 100)}%` })], []),
              h.span([], [count, h.small([], [percent === '' ? '' : `  ${percent}`])]),
            ],
          ),
        ),
      ),
      copy(h, value),
    ],
  )
}

const verdictCls = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1.4rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  borderLeft: '6px solid var(--danger)',
  '&[data-yes]': { borderLeftColor: 'oklch(0.62 0.17 150)' },
  '& i': { fontStyle: 'normal', fontSize: '2.4rem', lineHeight: 1 },
  '& b': { fontSize: '1.3rem' },
})
const listCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  padding: '1rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  maxHeight: '28rem',
  overflow: 'auto',
  counterReset: 'row',
  '& > div': {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.45rem 0.6rem',
    borderRadius: '8px',
    background: 'var(--muted)',
    counterIncrement: 'row',
    '&::before': {
      content: 'counter(row)',
      fontFamily: 'var(--mono)',
      fontSize: '0.7rem',
      color: 'var(--muted-foreground)',
      minWidth: '1.6rem',
    },
  },
})
const displayCls = css({
  padding: '1.6rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
  lineHeight: 1.35,
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
})

const verdict = <M>(h: HtmlBuilder<M>, value: string): Html => {
  const yes = /^yes/iu.test(value)
  return h.div(
    [h.Class(wrapCls)],
    [
      h.div(
        [h.Class(verdictCls), ...(yes ? [h.Attribute('data-yes', '')] : [])],
        [h.i([], [yes ? '✓' : '✗']), h.b([], [value])],
      ),
    ],
  )
}

const list = <M>(h: HtmlBuilder<M>, value: string): Html =>
  h.div(
    [h.Class(wrapCls)],
    [
      h.div(
        [h.Class(listCls)],
        lines(value).map((line) => h.div([], [line])),
      ),
      copy(h, value),
    ],
  )

const display = <M>(h: HtmlBuilder<M>, value: string): Html =>
  h.div([h.Class(wrapCls)], [h.div([h.Class(displayCls)], [value]), copy(h, value)])

const codeCls = css({
  margin: 0,
  padding: '1rem 1rem 1rem 0',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'oklch(0.2 0.01 260)',
  color: 'oklch(0.92 0.01 260)',
  fontFamily: 'var(--mono)',
  fontSize: '0.82rem',
  lineHeight: 1.6,
  maxHeight: '30rem',
  overflow: 'auto',
  counterReset: 'ln',
  '& > span': {
    display: 'block',
    paddingLeft: '3.4rem',
    position: 'relative',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    minHeight: '1.3em',
    counterIncrement: 'ln',
    '&::before': {
      content: 'counter(ln)',
      position: 'absolute',
      left: 0,
      width: '2.4rem',
      textAlign: 'right',
      color: 'oklch(0.55 0.01 260)',
    },
  },
})
const chmodCls = css({
  display: 'grid',
  gridTemplateColumns: 'auto repeat(3, 1fr)',
  gap: '0.4rem',
  alignItems: 'center',
  padding: '1rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  '& > span': {
    fontFamily: 'var(--mono)',
    fontSize: '0.7rem',
    color: 'var(--muted-foreground)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  '& > b': {
    textAlign: 'center',
    padding: '0.7rem 0',
    borderRadius: '8px',
    background: 'var(--muted)',
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--mono)',
    fontWeight: 500,
    '&[data-on]': { background: 'var(--tone)', color: 'white' },
  },
})

const code = <M>(h: HtmlBuilder<M>, value: string): Html =>
  h.div(
    [h.Class(wrapCls)],
    [
      h.pre(
        [h.Class(codeCls), h.AriaLabel('Output'), h.Tabindex(0)],
        value.split('\n').map((line) => h.span([], [line])),
      ),
      copy(h, value),
    ],
  )

const chmod = <M>(h: HtmlBuilder<M>, value: string): Html => {
  const text = value.trim()
  const bits = /^[rwx-]{9}$/u.test(text)
    ? [...text].map((char) => char !== '-')
    : /^[0-7]{3,4}$/u.test(text)
      ? Array.from(text.slice(-3)).flatMap((digit) =>
          [4, 2, 1].map((bit) => (Number(digit) & bit) !== 0),
        )
      : null
  if (bits === null) return display(h, value)
  return h.div(
    [h.Class(wrapCls)],
    [
      h.div(
        [h.Class(chmodCls)],
        [
          h.span([], ['']),
          ...['Read', 'Write', 'Execute'].map((name) => h.span([], [name])),
          ...['Owner', 'Group', 'Others'].flatMap((who, row) => [
            h.span([], [who]),
            ...['r', 'w', 'x'].map((letter, col) =>
              h.b(bits[row * 3 + col] === true ? [h.Attribute('data-on', '')] : [], [letter]),
            ),
          ]),
        ],
      ),
      display(h, value),
    ],
  )
}

/** The answer of a tool, in its own presenter if it has one, else as facts or plain text. */
export const presentOutput = <M>(
  h: HtmlBuilder<M>,
  present: Present | undefined,
  category: string,
  input: string,
  value: string,
): Html => {
  if (value !== '') {
    if (present === 'swatch') return swatch(h, input, value)
    if (present === 'tokens') return tokens(h, value)
    if (present === 'pairs') return pairs(h, value)
    if (present === 'bars') return bars(h, value)
    if (present === 'verdict') return verdict(h, value)
    if (present === 'list') return list(h, value)
    if (present === 'display') return display(h, value)
    if (present === 'code') return code(h, value)
    if (present === 'chmod') return chmod(h, value)
    if (present === 'facts') return factsView(h, value)
    if (
      category !== 'text' &&
      /^[^:\n]{1,48}: /u.test(value) &&
      parseFacts(value).facts.length > 0
    ) {
      return factsView(h, value)
    }
  }
  return output(h, { label: 'Output', value })
}
