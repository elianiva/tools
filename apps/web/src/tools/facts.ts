// Calculators answer in `Label: value` lines. This turns that text into a dashboard: the
// first fact is the headline, the rest are tiles, and anything else is a note with its
// links made clickable. A tool with no such lines gets its whole answer as a headline.
import { Elements } from '@tools/ui'
import type { Html, HtmlBuilder } from 'foldkit/html'
import { css } from '../../styled-system/css'

const FACT = /^([^:\n]{1,48}): (.+)$/u

export type Facts = Readonly<{
  facts: ReadonlyArray<readonly [string, string]>
  notes: ReadonlyArray<string>
}>

export const parseFacts = (text: string): Facts => {
  const facts: Array<readonly [string, string]> = []
  const notes: Array<string> = []
  for (const line of text.split('\n')) {
    const match = FACT.exec(line)
    if (match !== null && !match[1]?.startsWith('http'))
      facts.push([match[1] ?? '', match[2] ?? ''])
    else if (line.trim() !== '') notes.push(line.trim())
  }
  return { facts, notes }
}

const wrapCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  position: 'relative',
})
const heroCls = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  padding: '1.1rem 1.3rem 1.2rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'linear-gradient(135deg, var(--tone-soft), transparent 70%), var(--card)',
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
const labelCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const heroValueCls = css({
  fontFamily: 'var(--mono)',
  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
  fontWeight: 500,
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--tone-ink)',
  overflowWrap: 'anywhere',
})
const gridCls = css({
  display: 'grid',
  gap: '0.6rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 13rem), 1fr))',
})
const tileCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  padding: '0.7rem 0.9rem',
  borderRadius: 'var(--radius)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-raised)',
})
const tileValueCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '1.05rem',
  fontVariantNumeric: 'tabular-nums',
  overflowWrap: 'anywhere',
})
const noteCls = css({
  margin: 0,
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
  overflowWrap: 'anywhere',
  '& a': { color: 'var(--tone-ink)' },
})
const copyCls = css({ position: 'absolute', top: '0.6rem', right: '0.6rem' })

/** Text with its links made clickable. */
export const linkify = <M>(h: HtmlBuilder<M>, text: string): ReadonlyArray<Html | string> =>
  text
    .split(/(https?:\/\/\S+)/u)
    .map((part, index) =>
      index % 2 === 1
        ? h.a([h.Href(part), h.Target('_blank'), h.Rel('noopener noreferrer')], [part])
        : part,
    )

export const factsView = <M>(h: HtmlBuilder<M>, text: string): Html => {
  const { facts, notes } = parseFacts(text)
  const [hero, ...rest] = facts
  return h.div(
    [h.Class(wrapCls)],
    [
      hero === undefined
        ? h.div([h.Class(heroCls)], [h.span([h.Class(heroValueCls)], [text])])
        : h.div(
            [h.Class(heroCls)],
            [h.span([h.Class(labelCls)], [hero[0]]), h.span([h.Class(heroValueCls)], [hero[1]])],
          ),
      rest.length === 0
        ? null
        : h.div(
            [h.Class(gridCls)],
            rest.map(([label, value]) =>
              h.div(
                [h.Class(tileCls)],
                [h.span([h.Class(labelCls)], [label]), h.span([h.Class(tileValueCls)], [value])],
              ),
            ),
          ),
      ...notes.map((note) => h.p([h.Class(noteCls)], linkify(h, note))),
      h.div([h.Class(copyCls)], [Elements.copyButton(h, false, h.Attribute('data-copy', text))]),
    ],
  )
}
