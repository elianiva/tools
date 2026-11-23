// View helpers every tool shares, so the tools look and behave alike. They are plain
// functions of `h`: no state, no Messages of their own. A tool passes in the Message
// its own update handles.
import { Elements } from '@tools/ui'
import type { Attribute, Html, HtmlBuilder } from 'foldkit/html'
import { css, cx } from '../../styled-system/css'

type Children = ReadonlyArray<Html | string>

export const stack = css({ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' })
export const row = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.6rem',
})
const panelCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  padding: '1rem 1.1rem',
  borderRadius: 'calc(var(--radius) * 1.6)',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
})
const panelTitleCls = css({
  margin: 0,
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const twoColumnsCls = css({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 22rem), 1fr))',
})
const fieldCls = css({ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 })
const fieldLabelCls = css({ fontSize: '0.85rem', fontWeight: 550 })
const hintCls = css({ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' })
const statGridCls = css({
  display: 'grid',
  gap: '0.6rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(8.5rem, 1fr))',
})
const statCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.15rem',
  padding: '0.7rem 0.85rem',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
})
const statValueCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '1.35rem',
  fontWeight: 500,
  fontVariantNumeric: 'tabular-nums',
})
const statLabelCls = css({ fontSize: '0.75rem', color: 'var(--muted-foreground)' })
const segmentedCls = css({
  display: 'inline-flex',
  flexWrap: 'wrap',
  gap: '2px',
  padding: '3px',
  borderRadius: '10px',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  '& button': {
    padding: '0.35rem 0.8rem',
    borderRadius: '7px',
    background: 'transparent',
    boxShadow: 'none',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
  },
  '& button[aria-checked="true"]': {
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
  },
})
const checkRowCls = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem',
  cursor: 'pointer',
})
const rangeCls = css({ width: '100%', accentColor: 'var(--primary)' })
const dropzoneCls = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.3rem',
  minHeight: '9rem',
  padding: '1.5rem',
  borderRadius: 'calc(var(--radius) * 1.4)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  color: 'var(--muted-foreground)',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'outline-color 150ms, color 150ms',
  outline: '2px dashed transparent',
  outlineOffset: '-6px',
  '&:hover, &:has(input:focus-visible)': {
    outlineColor: 'color-mix(in oklab, var(--foreground) 30%, transparent)',
    color: 'var(--foreground)',
  },
  '& input': { position: 'absolute', width: 1, height: 1, opacity: 0 },
})
const outputCls = css({
  position: 'relative',
  '& pre, & textarea': {
    margin: 0,
    padding: '0.8rem 3rem 0.8rem 0.9rem',
    minHeight: '4rem',
    maxHeight: '28rem',
    overflow: 'auto',
    borderRadius: 'var(--radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    fontFamily: 'var(--mono)',
    fontSize: '0.82rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  '& [data-slot="copy-button"]': { position: 'absolute', top: '0.4rem', right: '0.4rem' },
})
const meterCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  fontSize: '0.8rem',
  '& span:first-child': { display: 'flex', justifyContent: 'space-between' },
  '& i': {
    display: 'block',
    height: '6px',
    borderRadius: '999px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    overflow: 'hidden',
  },
  '& b': {
    display: 'block',
    height: '100%',
    borderRadius: '999px',
    background: 'var(--primary)',
    transition: 'width 200ms cubic-bezier(0.23, 1, 0.32, 1)',
  },
  '&[data-over] b': { background: 'var(--danger)' },
})

/** A titled card. Tools are a few panels in a column. */
export const panel = <M>(h: HtmlBuilder<M>, title: string | null, children: Children): Html =>
  h.section(
    [h.Class(panelCls)],
    title === null ? children : [h.h3([h.Class(panelTitleCls)], [title]), ...children],
  )

/** Panels side by side while they fit, stacked when they do not. */
export const columns = <M>(h: HtmlBuilder<M>, children: Children): Html =>
  h.div([h.Class(twoColumnsCls)], children)

export const field = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ label: string; for: string; hint?: string }>,
  control: Html,
): Html =>
  h.div(
    [h.Class(fieldCls)],
    [
      h.label([h.Class(fieldLabelCls), h.For(props.for)], [props.label]),
      control,
      ...(props.hint === undefined ? [] : [h.p([h.Class(hintCls)], [props.hint])]),
    ],
  )

export const hint = <M>(h: HtmlBuilder<M>, text: string): Html => h.p([h.Class(hintCls)], [text])

/** One number with its name. */
export const stat = <M>(h: HtmlBuilder<M>, label: string, value: string): Html =>
  h.div(
    [h.Class(statCls)],
    [h.span([h.Class(statValueCls)], [value]), h.span([h.Class(statLabelCls)], [label])],
  )

export const stats = <M>(
  h: HtmlBuilder<M>,
  items: ReadonlyArray<readonly [string, string]>,
): Html =>
  h.div(
    [h.Class(statGridCls)],
    items.map(([label, value]) => stat(h, label, value)),
  )

/** One choice out of a few, as a row of buttons. */
export const segmented = <M, V extends string>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    label: string
    value: V
    options: ReadonlyArray<Readonly<{ value: V; label: string }>>
    onSelect: (value: V) => M
  }>,
): Html =>
  h.div(
    [h.Class(segmentedCls), h.Role('radiogroup'), h.AriaLabel(props.label)],
    props.options.map((option) =>
      h.button(
        [
          h.Type('button'),
          h.Role('radio'),
          h.AriaChecked(option.value === props.value),
          h.OnClick(props.onSelect(option.value)),
        ],
        [option.label],
      ),
    ),
  )

export const checkbox = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ id: string; label: string; checked: boolean; onToggle: M }>,
): Html =>
  h.label(
    [h.Class(checkRowCls), h.For(props.id)],
    [
      h.input([
        h.Id(props.id),
        h.Type('checkbox'),
        h.Checked(props.checked),
        h.OnClick(props.onToggle),
      ]),
      props.label,
    ],
  )

export const range = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    id: string
    min: number
    max: number
    step?: number
    value: number
    onInput: (value: number) => M
  }>,
): Html =>
  h.input([
    h.Class(rangeCls),
    h.Id(props.id),
    h.Type('range'),
    h.Min(String(props.min)),
    h.Max(String(props.max)),
    h.Step(String(props.step ?? 1)),
    h.Value(String(props.value)),
    h.OnInput((value) => props.onInput(Number(value))),
  ])

export const textInput = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    id: string
    value: string
    placeholder?: string
    type?: string
    onInput: (value: string) => M
  }>,
): Html =>
  Elements.input(
    h,
    {
      ...(props.placeholder === undefined ? {} : { placeholder: props.placeholder }),
      ...(props.type === undefined ? {} : { type: props.type }),
    },
    [h.Id(props.id), h.Value(props.value), h.OnInput(props.onInput)],
  )

export const textArea = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    id: string
    value: string
    placeholder?: string
    rows?: number
    onInput: (value: string) => M
  }>,
): Html =>
  Elements.inputArea(
    h,
    {
      ...(props.placeholder === undefined ? {} : { placeholder: props.placeholder }),
      ...(props.rows === undefined ? {} : { rows: props.rows }),
    },
    [h.Id(props.id), h.Value(props.value), h.Spellcheck(false), h.OnInput(props.onInput)],
  )

/**
 * Read-only output with a copy button in the corner. The button only carries the text in
 * `data-copy`: the shell listens for it, writes the clipboard, and shows the toast.
 */
export const output = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ label: string; value: string }>,
): Html =>
  h.div(
    [h.Class(outputCls)],
    [
      h.pre([h.AriaLabel(props.label), h.Tabindex(0)], [props.value]),
      props.value === ''
        ? null
        : Elements.copyButton(h, false, h.Attribute('data-copy', props.value)),
    ],
  )

/** A file picker that also takes drops. `onFiles` gets every file the user chose. */
export const dropzone = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{
    id: string
    accept: ReadonlyArray<string>
    multiple?: boolean
    title: string
    detail: string
    onFiles: (files: ReadonlyArray<File>) => M
  }>,
): Html =>
  h.label(
    [h.Class(dropzoneCls), h.For(props.id), h.OnDropFiles(props.onFiles)],
    [
      h.input([
        h.Id(props.id),
        h.Type('file'),
        h.Accept(props.accept.join(',')),
        ...(props.multiple === true ? [h.Multiple(true)] : []),
        h.OnFileChange(props.onFiles),
      ]),
      h.span([h.Class(css({ color: 'var(--foreground)', fontWeight: 550 }))], [props.title]),
      h.span([h.Class(hintCls)], [props.detail]),
    ],
  )

/** A bar that fills toward a limit and turns red past it. `display` replaces the `value / limit` text. */
export const meter = <M>(
  h: HtmlBuilder<M>,
  props: Readonly<{ label: string; value: number; limit: number; display?: string }>,
): Html =>
  h.div(
    [h.Class(cx(meterCls)), ...(props.value > props.limit ? [h.Attribute('data-over', '')] : [])],
    [
      h.span(
        [],
        [
          h.span([], [props.label]),
          h.span([], [props.display ?? `${props.value} / ${props.limit}`]),
        ],
      ),
      h.i(
        [],
        [h.b([h.Style({ width: `${Math.min(100, (props.value / props.limit) * 100)}%` })], [])],
      ),
    ],
  )

export const button = Elements.button
export const badge = Elements.badge
export type { Attribute }
