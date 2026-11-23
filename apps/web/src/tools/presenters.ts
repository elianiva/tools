// How a tool shows its answer. Each presenter reads the same text the tool returns, so the
// tool's logic and tests stay as they are; only the look changes.
import { Elements } from '@tools/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { css } from '../../styled-system/css'
import { factsView, parseFacts } from './facts.ts'
import { output } from './kit.ts'

export type Present = 'swatch' | 'tokens' | 'pairs' | 'bars'

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
