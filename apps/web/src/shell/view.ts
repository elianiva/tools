import { Dialog as FkDialog } from '@foldkit/ui'
import { stamp, Toast, type PartsConfig, type Message as UiMessage } from '@tools/adapter'
import { Elements } from '@tools/ui'
import { Option } from 'effect'
import type { Document, Html, HtmlBuilder } from 'foldkit/html'
import { css } from '../../styled-system/css'
import { AppRoute } from '../app/route.ts'
import { paletteGroups, type Message, type Model } from '../app/main.ts'
import { Message as AppMessage, toolsFor } from '../app/main.ts'
import { pathOfTool, toolOf, tools, toolsIn } from '../tools/registry.ts'
import { highlight } from '../tools/search.ts'
import {
  CATEGORIES,
  categoryDescription,
  categoryName,
  type CategoryId,
  type Tool,
} from '../tools/tool.ts'

type H = HtmlBuilder<Message>

const frameCls = css({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundImage:
    'linear-gradient(to bottom, color-mix(in oklab, var(--primary) 4%, transparent), transparent 24rem)',
})
const topbarCls = css({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  gap: '0.9rem',
  padding: '0.6rem 1.25rem',
  background: 'color-mix(in oklab, var(--background) 82%, transparent)',
  backdropFilter: 'blur(14px) saturate(1.4)',
  boxShadow: '0 1px 0 var(--hairline)',
})
const brandCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.85rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--foreground)',
  textDecoration: 'none',
})
const searchButtonCls = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flex: 1,
  minWidth: 0,
  maxWidth: '24rem',
  padding: '0.35rem 0.45rem 0.35rem 0.65rem',
  border: 0,
  borderRadius: '8px',
  background: 'var(--card)',
  boxShadow: 'var(--elev-raised)',
  color: 'var(--muted-foreground)',
  fontSize: '0.85rem',
  fontWeight: 400,
  textAlign: 'start',
  transition: 'box-shadow 140ms, color 140ms',
  '&:hover': { color: 'var(--foreground)', boxShadow: 'var(--elev-card)' },
})
const searchLabelCls = css({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
const topbarCountCls = css({
  marginInlineStart: 'auto',
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  color: 'var(--muted-foreground)',
  '@media (max-width: 48rem)': { display: 'none' },
})
const bodyCls = css({
  display: 'grid',
  gridTemplateColumns: '15rem minmax(0, 1fr)',
  flex: 1,
  '@media (max-width: 56rem)': { gridTemplateColumns: 'minmax(0, 1fr)' },
})
const sideCls = css({
  position: 'sticky',
  top: '3.4rem',
  alignSelf: 'start',
  height: 'calc(100vh - 3.4rem)',
  overflowY: 'auto',
  padding: '0.5rem 0.8rem 2rem',
  '@media (max-width: 56rem)': { display: 'none' },
})
const groupCls = css({
  margin: '1rem 0.6rem 0.3rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const linkStyle = {
  display: 'block',
  padding: '0.3rem 0.6rem',
  borderRadius: '6px',
  color: 'var(--muted-foreground)',
  fontSize: '0.88rem',
  textDecoration: 'none',
  '&:hover': { background: 'var(--accent)', color: 'var(--foreground)' },
  '&[aria-current="page"]': {
    background: 'var(--raised-top)',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
    fontWeight: 550,
  },
} as const
const linkCls = css(linkStyle)
const countCls = css({ fontFamily: 'var(--mono)', fontSize: '0.72rem', opacity: 0.7 })
const categoryLinkCls = css(linkStyle, {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'var(--foreground)',
  fontWeight: 550,
})
const mainCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: '100%',
  maxWidth: '58rem',
  padding: '2rem 1.5rem 5rem',
  '@media (min-width: 56rem)': { padding: '2.5rem 2.5rem 5rem' },
})
const titleCls = css({ margin: 0, fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em' })
const leadCls = css({ margin: 0, color: 'var(--muted-foreground)' })
const headerRowCls = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '1rem',
})
const sectionTitleCls = css({
  margin: '0 0 0.7rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.7rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const sectionsCls = css({ display: 'flex', flexDirection: 'column', gap: '2rem' })
const pageHeadCls = css({ display: 'flex', flexDirection: 'column', gap: '0.4rem' })
const pageMetaCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--tone-ink, var(--muted-foreground))',
})
const directoryCls = css({
  display: 'grid',
  gap: '0 2rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  borderBottom: '1px solid var(--hairline-soft)',
  '@media (min-width: 44rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
})
const directoryLinkCls = css({
  display: 'grid',
  gridTemplateColumns: '1.7rem minmax(0, 1fr) auto',
  gridTemplateRows: 'auto auto',
  alignItems: 'baseline',
  columnGap: '0.5rem',
  padding: '0.55rem 0.45rem',
  marginInline: '-0.45rem',
  borderTop: '1px solid var(--hairline-soft)',
  borderRadius: '0',
  color: 'var(--foreground)',
  textDecoration: 'none',
  transition: 'background 140ms, box-shadow 140ms',
  '& svg': { opacity: 0, transition: 'opacity 140ms' },
  '&:hover': { background: 'var(--card)', boxShadow: 'var(--elev-raised)' },
  '&:hover svg': { opacity: 1 },
})
const directoryNoCls = css({
  gridRow: 'span 2',
  fontFamily: 'var(--mono)',
  fontSize: '0.66rem',
  color: 'var(--tone-ink, var(--muted-foreground))',
})
const directoryNameCls = css({
  gridColumn: 2,
  fontSize: '0.9rem',
  fontWeight: 550,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
const directoryDescCls = css({
  gridColumn: 2,
  color: 'var(--muted-foreground)',
  fontSize: '0.78rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  '@media (max-width: 44rem)': { whiteSpace: 'normal', lineClamp: 2 },
})
const directoryArrowCls = css({
  gridRow: 'span 2',
  alignSelf: 'center',
  color: 'var(--muted-foreground)',
})

// ── Home ────────────────────────────────────────────────────────────────────

const homeCls = css({ display: 'flex', flexDirection: 'column', gap: '2.75rem' })

const heroCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.15rem',
  padding: '1.25rem 0 0.5rem',
  '@media (min-width: 56rem)': { padding: '2.25rem 0 0.75rem' },
})
const eyebrowCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.5rem',
  margin: 0,
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 400,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const eyebrowSepCls = css({ color: 'var(--border)' })
const heroTitleCls = css({
  margin: 0,
  maxWidth: '20ch',
  fontSize: 'clamp(2.1rem, 4.2vw, 3.05rem)',
  fontWeight: 600,
  lineHeight: 1.02,
  letterSpacing: '-0.04em',
  textWrap: 'balance',
})
const heroLeadCls = css({
  margin: 0,
  maxWidth: '44ch',
  fontSize: '0.95rem',
  lineHeight: 1.6,
  color: 'var(--muted-foreground)',
  textWrap: 'pretty',
})
const heroSearchCls = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  width: '100%',
  maxWidth: '32rem',
  padding: '0.8rem 0.75rem 0.8rem 0.95rem',
  border: 0,
  borderRadius: '12px',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  color: 'var(--muted-foreground)',
  fontSize: '0.95rem',
  fontWeight: 400,
  textAlign: 'start',
  transition: 'color 140ms, box-shadow 140ms, translate 140ms',
  '&:hover': {
    color: 'var(--foreground)',
    boxShadow: 'var(--elev-float)',
    translate: '0 -1px',
  },
})
const heroSearchLabelCls = css({ flex: 1, minWidth: 0 })
const heroCatsCls = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.35rem',
  marginTop: '0.1rem',
})
const heroCatCls = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.28rem 0.6rem 0.28rem 0.5rem',
  borderRadius: '999px',
  background: 'color-mix(in oklab, var(--card) 60%, transparent)',
  boxShadow: 'inset 0 0 0 1px var(--hairline)',
  color: 'var(--foreground)',
  fontSize: '0.8rem',
  textDecoration: 'none',
  transition: 'background 140ms, box-shadow 140ms',
  '&:hover': { background: 'var(--card)', boxShadow: 'inset 0 0 0 1px var(--foreground)' },
})
const heroCatNoCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.62rem',
  letterSpacing: '0.04em',
  color: 'var(--muted-foreground)',
})
const heroCatCountCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.64rem',
  color: 'var(--muted-foreground)',
})

const blockHeadCls = css({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '1rem',
})
const blockTitleCls = css({
  margin: 0,
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const blockHintCls = css({ fontSize: '0.76rem', color: 'var(--muted-foreground)' })
const continueCls = css({ display: 'flex', flexDirection: 'column', gap: '0.7rem' })
const continueGridCls = css({
  display: 'grid',
  gap: '0.55rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))',
})
const continueCardCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  minWidth: 0,
  padding: '0.8rem 0.9rem',
  borderRadius: '10px',
  background: 'var(--card)',
  boxShadow: 'var(--elev-card)',
  color: 'var(--foreground)',
  textDecoration: 'none',
  transition: 'translate 140ms, box-shadow 140ms',
  '&:hover': { translate: '0 -1px', boxShadow: 'var(--elev-float)' },
})
const continueKindCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.62rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--tone-ink, var(--muted-foreground))',
})
const continueNameCls = css({
  fontSize: '0.95rem',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
const continueDescCls = css({
  color: 'var(--muted-foreground)',
  fontSize: '0.8rem',
  lineHeight: 1.45,
  lineClamp: 2,
})

const shelfStackCls = css({ display: 'flex', flexDirection: 'column', gap: '1.4rem' })
const shelfCls = css({
  borderTop: '1px solid var(--hairline)',
  paddingTop: '0.95rem',
  scrollMarginTop: '4.5rem',
})
const shelfHeadCls = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.7rem',
  marginBottom: '0.35rem',
})
const shelfNoCls = css({
  minWidth: '1.7rem',
  paddingTop: '0.15rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.7rem',
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: 'var(--tone-ink, var(--muted-foreground))',
})
const shelfTitleCls = css({ display: 'flex', flexDirection: 'column', gap: '0.05rem', flex: 1 })
const shelfNameCls = css({
  margin: 0,
  fontSize: '1.05rem',
  fontWeight: 600,
  letterSpacing: '-0.01em',
})
const shelfDescCls = css({ margin: 0, color: 'var(--muted-foreground)', fontSize: '0.82rem' })
const shelfAllCls = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  paddingTop: '0.2rem',
  color: 'var(--muted-foreground)',
  fontSize: '0.78rem',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  '& svg': { transition: 'translate 140ms' },
  '&:hover': { color: 'var(--foreground)' },
  '&:hover svg': { translate: '2px 0' },
})
const shelfGridCls = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  marginInline: '-0.6rem',
  '@media (min-width: 44rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    columnGap: '0.4rem',
  },
})
const shelfToolCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.15rem',
  minWidth: 0,
  padding: '0.55rem 0.6rem 0.65rem',
  borderRadius: '8px',
  color: 'var(--foreground)',
  textDecoration: 'none',
  transition: 'background 140ms, box-shadow 140ms',
  '&:hover': { background: 'var(--card)', boxShadow: 'var(--elev-raised)' },
})
const shelfToolNameCls = css({
  fontSize: '0.9rem',
  fontWeight: 550,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
const shelfToolDescCls = css({
  color: 'var(--muted-foreground)',
  fontSize: '0.79rem',
  lineHeight: 1.45,
  lineClamp: 2,
})

const indexCls = css({
  borderTop: '1px solid var(--hairline)',
  paddingTop: '0.15rem',
  '&[open] summary svg': { rotate: '180deg' },
})
const indexSummaryCls = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.8rem 0.4rem',
  marginInline: '-0.4rem',
  borderRadius: '8px',
  cursor: 'pointer',
  listStyle: 'none',
  '&:hover': { background: 'var(--accent)' },
})
const indexSummaryMainCls = css({ display: 'flex', alignItems: 'baseline', gap: '0.5rem' })
const indexTitleCls = css({ fontSize: '0.9rem', fontWeight: 600 })
const indexCountCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.68rem',
  color: 'var(--muted-foreground)',
})
const indexHintCls = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.66rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
  '& svg': { transition: 'rotate 160ms' },
})
const indexListCls = css({
  margin: 0,
  padding: '0.5rem 0 0.25rem',
  listStyle: 'none',
  columns: 2,
  columnGap: '1.5rem',
  '@media (min-width: 44rem)': { columns: 3 },
})
const indexLinkCls = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.45rem',
  padding: '0.18rem 0.3rem',
  marginInline: '-0.3rem',
  borderRadius: '5px',
  color: 'var(--foreground)',
  fontSize: '0.81rem',
  textDecoration: 'none',
  breakInside: 'avoid',
  '&:hover': { background: 'var(--accent)' },
})
const indexDotCls = css({
  flexShrink: 0,
  width: '5px',
  height: '5px',
  borderRadius: '50%',
  background: 'var(--tone, var(--muted-foreground))',
})
const indexNameCls = css({ minWidth: 0, lineHeight: 1.35 })

const overlayCls = css({
  position: 'fixed',
  inset: 0,
  zIndex: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'color-mix(in oklab, var(--background) 70%, transparent)',
  backdropFilter: 'blur(6px)',
  outline: '2px dashed var(--primary)',
  outlineOffset: '-1.2rem',
  fontSize: '1.2rem',
  fontWeight: 550,
  pointerEvents: 'none',
})

// ── Palette ─────────────────────────────────────────────────────────────────

const paletteBackdropCls = css({
  background: 'rgb(15 18 25 / 0.38)',
  backdropFilter: 'blur(3px) saturate(1.1)',
})
const paletteCls = css({
  top: '11vh',
  bottom: 'auto',
  translate: '-50% 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  width: 'min(44rem, calc(100vw - 2rem))',
  maxHeight: 'min(36rem, 78vh)',
  padding: 0,
  borderRadius: '14px',
  overflow: 'hidden',
})
const paletteInputRowCls = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  padding: '0.8rem 0.9rem 0.8rem 1rem',
  boxShadow: 'inset 0 -1px 0 var(--hairline-soft)',
  '& > svg': { flexShrink: 0, color: 'var(--muted-foreground)' },
})
const paletteInputCls = css({
  flex: 1,
  minWidth: 0,
  padding: 0,
  border: 0,
  borderRadius: 0,
  background: 'transparent',
  boxShadow: 'none',
  fontSize: '0.98rem',
  color: 'var(--foreground)',
  '&:focus-visible': { outline: 'none', border: 0, boxShadow: 'none' },
  '&::placeholder': { color: 'var(--muted-foreground)' },
})
const paletteBodyCls = css({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  padding: '0.35rem',
})
const paletteGroupCls = css({ '& + &': { marginTop: '0.15rem' } })
const paletteGroupLabelCls = css({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.55rem 0.65rem 0.25rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.61rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
})
const paletteItemCls = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1.25rem',
  width: '100%',
  padding: '0.45rem 0.65rem',
  border: 0,
  borderRadius: '8px',
  background: 'transparent',
  boxShadow: 'none',
  color: 'var(--foreground)',
  textAlign: 'start',
  '&:hover': { background: 'var(--accent)' },
  '&[aria-selected="true"]': { background: 'var(--accent)' },
})
const paletteItemMainCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.05rem',
  minWidth: 0,
})
const paletteItemNameCls = css({ fontSize: '0.87rem', fontWeight: 500 })
const paletteItemDescCls = css({
  color: 'var(--muted-foreground)',
  fontSize: '0.76rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
const paletteMarkCls = css({
  padding: '0 0.08em',
  borderRadius: '2px',
  background: 'oklch(0.92 0.09 92)',
  color: 'inherit',
})
const paletteItemCatCls = css({
  flexShrink: 0,
  minWidth: '4.8rem',
  fontFamily: 'var(--mono)',
  fontSize: '0.62rem',
  letterSpacing: '0.02em',
  color: 'var(--muted-foreground)',
  textAlign: 'end',
  '@media (max-width: 30rem)': { display: 'none' },
})
const paletteFooterCls = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.5rem 0.9rem',
  background: 'var(--surface-nested)',
  boxShadow: 'inset 0 1px 0 var(--hairline-soft)',
})
const paletteHintsCls = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  fontSize: '0.7rem',
  color: 'var(--muted-foreground)',
})
const paletteHintCls = css({ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' })
const paletteCountCls = css({
  fontFamily: 'var(--mono)',
  fontSize: '0.66rem',
  color: 'var(--muted-foreground)',
})
const paletteEmptyCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  padding: '2.2rem 1rem 2.4rem',
  textAlign: 'center',
})
const paletteEmptyTitleCls = css({ margin: 0, fontSize: '0.92rem', fontWeight: 550 })
const paletteEmptyHintCls = css({
  margin: 0,
  fontSize: '0.8rem',
  color: 'var(--muted-foreground)',
})

const pickerCls = css({
  position: 'fixed',
  inset: 0,
  zIndex: 45,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgb(15 18 25 / 0.45)',
  '& > div': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    width: 'min(26rem, calc(100vw - 2rem))',
    padding: '1.1rem',
    borderRadius: '14px',
    background: 'var(--card)',
    boxShadow: 'var(--elev-float)',
  },
})

const hiddenCls = css({
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
})

// Static on purpose: Panda reads these literals at build time.
const tones: Readonly<Record<string, string>> = {
  images: css({
    '--tone': 'var(--info)',
    '--tone-soft': 'color-mix(in oklab, var(--info) 12%, transparent)',
    '--tone-ink': 'color-mix(in oklab, var(--info) 75%, var(--foreground))',
  }),
  text: css({
    '--tone': 'var(--foreground)',
    '--tone-soft': 'color-mix(in oklab, var(--foreground) 12%, transparent)',
    '--tone-ink': 'color-mix(in oklab, var(--foreground) 75%, var(--foreground))',
  }),
  developer: css({
    '--tone': 'oklch(0.55 0.15 300)',
    '--tone-soft': 'color-mix(in oklab, oklch(0.55 0.15 300) 12%, transparent)',
    '--tone-ink': 'color-mix(in oklab, oklch(0.55 0.15 300) 75%, var(--foreground))',
  }),
  convert: css({
    '--tone': 'var(--warn)',
    '--tone-soft': 'color-mix(in oklab, var(--warn) 12%, transparent)',
    '--tone-ink': 'color-mix(in oklab, var(--warn) 75%, var(--foreground))',
  }),
  calculate: css({
    '--tone': 'var(--ok)',
    '--tone-soft': 'color-mix(in oklab, var(--ok) 12%, transparent)',
    '--tone-ink': 'color-mix(in oklab, var(--ok) 75%, var(--foreground))',
  }),
  generate: css({
    '--tone': 'oklch(0.58 0.17 350)',
    '--tone-soft': 'color-mix(in oklab, oklch(0.58 0.17 350) 12%, transparent)',
    '--tone-ink': 'color-mix(in oklab, oklch(0.58 0.17 350) 75%, var(--foreground))',
  }),
}
const toneCls = (category: string): string => tones[category] ?? ''

const uiOf = (model: Model): PartsConfig<Message> => ({
  toMessage: (message: UiMessage) => AppMessage.GotUiMessage({ message }),
  anchor: model.anchorId,
})

const link = (h: H, href: string, label: string, current: boolean): Html =>
  h.a([h.Class(linkCls), h.Href(href), ...(current ? [h.AriaCurrent('page')] : [])], [label])

const currentToolId = (model: Model): string | undefined =>
  model.route._tag === 'Tool' ? model.route.id : undefined

// ── Icons ───────────────────────────────────────────────────────────────────

const iconPaths = {
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 3-4.35-4.35',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  chevron: 'm6 9 6 6 6-6',
} as const

const icon = (h: H, path: string, size: number): Html =>
  h.svg(
    [
      h.Attribute('viewBox', '0 0 24 24'),
      h.Attribute('width', String(size)),
      h.Attribute('height', String(size)),
      h.Attribute('fill', 'none'),
      h.Attribute('stroke', 'currentColor'),
      h.Attribute('stroke-width', '1.7'),
      h.Attribute('stroke-linecap', 'round'),
      h.Attribute('stroke-linejoin', 'round'),
      h.Attribute('focusable', 'false'),
      h.AriaHidden(true),
    ],
    [h.path([h.Attribute('d', path)], [])],
  )

// ── Top bar and sidebar ─────────────────────────────────────────────────────

const topbar = (h: H): Html =>
  h.header(
    [h.Class(topbarCls)],
    [
      h.a([h.Class(brandCls), h.Href('/')], ['tools']),
      h.button(
        [
          h.Class(searchButtonCls),
          h.Type('button'),
          h.AriaLabel('Search tools'),
          h.OnClick(AppMessage.OpenedPalette()),
        ],
        [
          icon(h, iconPaths.search, 15),
          h.span([h.Class(searchLabelCls)], ['Search tools']),
          Elements.kbd(h, '⌘K'),
        ],
      ),
      h.span([h.Class(topbarCountCls)], [`${tools.length} tools`]),
    ],
  )

const sidebar = (h: H, model: Model): Html => {
  const current = currentToolId(model)
  const openCategory =
    model.route._tag === 'Tool' || model.route._tag === 'Category'
      ? model.route.category
      : undefined
  const starred = model.favorites.flatMap((id) => tools.filter((tool) => tool.meta.id === id))
  const recent = model.recents
    .filter((id) => !model.favorites.includes(id))
    .slice(0, 5)
    .flatMap((id) => tools.filter((tool) => tool.meta.id === id))
  return h.nav(
    [h.Class(sideCls), h.AriaLabel('Tools')],
    [
      ...(starred.length === 0
        ? []
        : [
            h.p([h.Class(groupCls)], ['Favorites']),
            ...starred.map((tool) =>
              link(h, pathOfTool(tool), tool.meta.name, tool.meta.id === current),
            ),
          ]),
      ...(recent.length === 0
        ? []
        : [
            h.p([h.Class(groupCls)], ['Recent']),
            ...recent.map((tool) =>
              link(h, pathOfTool(tool), tool.meta.name, tool.meta.id === current),
            ),
          ]),
      h.p([h.Class(groupCls)], ['Categories']),
      ...CATEGORIES.flatMap((category) => {
        const count = toolsIn(category.id).length
        return count === 0
          ? []
          : [
              h.a(
                [
                  h.Class(categoryLinkCls),
                  h.Href(`/${category.id}`),
                  ...(openCategory === category.id ? [h.AriaCurrent('page')] : []),
                ],
                [category.name, h.span([h.Class(countCls)], [String(count)])],
              ),
            ]
      }),
    ],
  )
}

// ── Pages ───────────────────────────────────────────────────────────────────

/** The hero: what the site is, one search field, and the shelves as jump links. */
const hero = (h: H): Html =>
  h.header(
    [h.Class(heroCls)],
    [
      h.p(
        [h.Class(eyebrowCls)],
        [
          `${tools.length} tools`,
          h.span([h.Class(eyebrowSepCls)], ['·']),
          `${CATEGORIES.length} categories`,
          h.span([h.Class(eyebrowSepCls)], ['·']),
          'on this device',
        ],
      ),
      h.h1([h.Class(heroTitleCls)], ['Small tools for everyday work.']),
      h.p(
        [h.Class(heroLeadCls)],
        [
          'Clean up text, convert a file, decode a token, split a bill. Every tool runs in your browser, so nothing you paste leaves it.',
        ],
      ),
      h.button(
        [
          h.Class(heroSearchCls),
          h.Type('button'),
          h.AriaLabel('Search all tools'),
          h.OnClick(AppMessage.OpenedPalette()),
        ],
        [
          icon(h, iconPaths.search, 17),
          h.span([h.Class(heroSearchLabelCls)], [`Search ${tools.length} tools`]),
          Elements.kbd(h, '⌘K'),
        ],
      ),
      h.nav(
        [h.Class(heroCatsCls), h.AriaLabel('Categories')],
        CATEGORIES.map((category, index) =>
          h.a(
            [h.Class(heroCatCls), h.Href(`/${category.id}`)],
            [
              h.span([h.Class(heroCatNoCls)], [String(index + 1).padStart(2, '0')]),
              category.name,
              h.span([h.Class(heroCatCountCls)], [String(toolsIn(category.id).length)]),
            ],
          ),
        ),
      ),
    ],
  )

type ContinueItem = Readonly<{ tool: Tool; label: string }>

/** Recents first, then favorites the recents do not already cover. */
const continueItems = (model: Model): ReadonlyArray<ContinueItem> => {
  const seen = new Set<string>()
  const items: Array<ContinueItem> = []
  const add = (id: string, label: string) => {
    if (seen.has(id)) return
    const tool = tools.find((candidate) => candidate.meta.id === id)
    if (tool === undefined) return
    seen.add(id)
    items.push({ tool, label })
  }
  model.recents.forEach((id) => add(id, 'Recent'))
  model.favorites.forEach((id) => add(id, 'Favorited'))
  return items.slice(0, 6)
}

const continuation = (h: H, model: Model): Html => {
  const items = continueItems(model)
  if (items.length === 0) return null
  return h.section(
    [h.Class(continueCls)],
    [
      h.div(
        [h.Class(blockHeadCls)],
        [
          h.h2([h.Class(blockTitleCls)], ['Continue']),
          h.span([h.Class(blockHintCls)], ['From this browser']),
        ],
      ),
      h.div(
        [h.Class(continueGridCls)],
        items.map(({ tool, label }) =>
          h.a(
            [
              h.Class(`${continueCardCls} ${toneCls(tool.meta.category)}`),
              h.Href(pathOfTool(tool)),
            ],
            [
              h.span([h.Class(continueKindCls)], [label]),
              h.strong([h.Class(continueNameCls)], [tool.meta.name]),
              h.span([h.Class(continueDescCls)], [tool.meta.description]),
            ],
          ),
        ),
      ),
    ],
  )
}

/** One shelf per category: three tools, then the way to the rest. */
const shelves = (h: H): Html =>
  h.div(
    [h.Class(shelfStackCls)],
    CATEGORIES.flatMap((category, index) => {
      const inCategory = toolsIn(category.id)
      if (inCategory.length === 0) return []
      return [
        h.section(
          [h.Class(`${shelfCls} ${toneCls(category.id)}`), h.Id(`category-${category.id}`)],
          [
            h.div(
              [h.Class(shelfHeadCls)],
              [
                h.span([h.Class(shelfNoCls)], [String(index + 1).padStart(2, '0')]),
                h.div(
                  [h.Class(shelfTitleCls)],
                  [
                    h.h2([h.Class(shelfNameCls)], [category.name]),
                    h.p([h.Class(shelfDescCls)], [category.description]),
                  ],
                ),
                h.a(
                  [h.Class(shelfAllCls), h.Href(`/${category.id}`)],
                  [`All ${inCategory.length}`, icon(h, iconPaths.arrow, 13)],
                ),
              ],
            ),
            h.div(
              [h.Class(shelfGridCls)],
              inCategory
                .slice(0, 3)
                .map((tool) =>
                  h.a(
                    [h.Class(shelfToolCls), h.Href(pathOfTool(tool))],
                    [
                      h.span([h.Class(shelfToolNameCls)], [tool.meta.name]),
                      h.span([h.Class(shelfToolDescCls)], [tool.meta.description]),
                    ],
                  ),
                ),
            ),
          ],
        ),
      ]
    }),
  )

/** Every tool, folded away: the way out when browsing beats searching. */
const toolsIndex = (h: H): Html => {
  const byName = tools.toSorted((a, b) => a.meta.name.localeCompare(b.meta.name))
  return h.details(
    [h.Class(indexCls)],
    [
      h.summary(
        [h.Class(indexSummaryCls)],
        [
          h.span(
            [h.Class(indexSummaryMainCls)],
            [
              h.span([h.Class(indexTitleCls)], ['All tools']),
              h.span([h.Class(indexCountCls)], [String(tools.length)]),
            ],
          ),
          h.span([h.Class(indexHintCls)], ['A–Z', icon(h, iconPaths.chevron, 13)]),
        ],
      ),
      h.ul(
        [h.Class(indexListCls)],
        byName.map((tool) =>
          h.li(
            [h.Key(tool.meta.id)],
            [
              h.a(
                [h.Class(indexLinkCls), h.Href(pathOfTool(tool))],
                [
                  h.span([h.Class(`${indexDotCls} ${toneCls(tool.meta.category)}`)], []),
                  h.span([h.Class(indexNameCls)], [tool.meta.name]),
                ],
              ),
            ],
          ),
        ),
      ),
    ],
  )
}

const home = (h: H, model: Model): Html =>
  h.div([h.Class(homeCls)], [hero(h), continuation(h, model), shelves(h), toolsIndex(h)])

const categoryPage = (h: H, id: CategoryId): Html => {
  const inCategory = toolsIn(id)
  return h.div(
    [h.Class(`${sectionsCls} ${toneCls(id)}`)],
    [
      Elements.breadcrumbs(h, [{ label: 'Tools', href: '/' }, { label: categoryName(id) }]),
      h.header(
        [h.Class(pageHeadCls)],
        [
          h.h1([h.Class(titleCls)], [categoryName(id)]),
          h.p([h.Class(leadCls)], [categoryDescription(id)]),
          h.p([h.Class(pageMetaCls)], [`${inCategory.length} tools`]),
        ],
      ),
      h.ol(
        [h.Class(directoryCls)],
        inCategory.map((tool, index) =>
          h.li(
            [h.Key(tool.meta.id)],
            [
              h.a(
                [h.Class(directoryLinkCls), h.Href(pathOfTool(tool))],
                [
                  h.span([h.Class(directoryNoCls)], [String(index + 1).padStart(2, '0')]),
                  h.span([h.Class(directoryNameCls)], [tool.meta.name]),
                  h.span([h.Class(directoryDescCls)], [tool.meta.description]),
                  h.span([h.Class(directoryArrowCls)], [icon(h, iconPaths.arrow, 13)]),
                ],
              ),
            ],
          ),
        ),
      ),
    ],
  )
}

const notFound = (h: H): Html =>
  Elements.empty(
    h,
    { title: 'Nothing here', description: 'That page does not exist.' },
    Elements.link(h, '/', ['Back to all tools']),
  )

const toolPage = (h: H, model: Model, tool: Tool): Html => {
  const starred = model.favorites.includes(tool.meta.id)
  return h.div(
    [h.Class(`${sectionsCls} ${toneCls(tool.meta.category)}`)],
    [
      h.div(
        [],
        [
          Elements.breadcrumbs(h, [
            { label: 'Tools', href: '/' },
            { label: categoryName(tool.meta.category), href: `/${tool.meta.category}` },
            { label: tool.meta.name },
          ]),
          h.div(
            [h.Class(headerRowCls)],
            [
              h.div(
                [],
                [
                  h.h1([h.Class(titleCls)], [tool.meta.name]),
                  h.p([h.Class(leadCls)], [tool.meta.description]),
                ],
              ),
              h.div(
                [],
                [
                  Elements.button(
                    h,
                    { variant: 'ghost' },
                    [
                      h.AriaPressed(starred ? 'true' : 'false'),
                      h.OnClick(AppMessage.ToggledFavorite({ id: tool.meta.id })),
                    ],
                    [starred ? 'Favorited' : 'Favorite'],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      tool.view(model.tools[tool.meta.id] ?? tool.init(), h, (message) =>
        AppMessage.GotToolMessage({ id: tool.meta.id, message }),
      ),
      h.div([], [Elements.badge(h, 'success', ['Runs on your device'])]),
    ],
  )
}

const content = (h: H, model: Model): Html =>
  AppRoute.match<Html>(model.route, {
    Home: () => home(h, model),
    Category: ({ category }) =>
      CATEGORIES.some((entry) => entry.id === category)
        ? categoryPage(h, category as CategoryId)
        : notFound(h),
    Tool: ({ category, id }) => {
      const tool = toolOf(category, id)
      return tool === undefined ? notFound(h) : toolPage(h, model, tool)
    },
    NotFound: () => notFound(h),
  })

// ── Overlays ────────────────────────────────────────────────────────────────

const paletteMarked = (h: H, text: string, query: string): ReadonlyArray<Html | string> =>
  highlight(text, query).map((piece) =>
    piece.match ? h.mark([h.Class(paletteMarkCls)], [piece.text]) : piece.text,
  )

const paletteHint = (h: H, keys: string, label: string): Html =>
  h.span([h.Class(paletteHintCls)], [Elements.kbd(h, keys), label])

const palette = (h: H, model: Model): Html => {
  const groups = paletteGroups(model)
  const results = groups.flatMap((group) => group.tools)
  const highlighted = results[model.paletteIndex]
  const query = model.paletteQuery
  let offset = 0
  const numbered = groups.map((group) => {
    const items = group.tools.map((tool, index) => ({ tool, index: offset + index }))
    offset += group.tools.length
    return { name: group.name, showCategory: group.showCategory, items }
  })
  return h.submodel({
    slotId: 'palette',
    model: model.palette,
    view: FkDialog.view,
    toParentMessage: (message) => AppMessage.GotPaletteMessage({ message }),
    viewInputs: {
      hasDescription: false,
      toView: (r) =>
        h.dialog(
          [...r.dialog],
          [
            h.div([...r.backdrop, ...stamp(h, 'dialog-backdrop'), h.Class(paletteBackdropCls)], []),
            h.div(
              [...r.panel, ...stamp(h, 'dialog-content'), h.Class(paletteCls)],
              [
                h.h2([...r.title, h.Class(hiddenCls)], ['Search tools']),
                h.div(
                  [h.Class(paletteInputRowCls)],
                  [
                    icon(h, iconPaths.search, 17),
                    h.input([
                      h.Class(paletteInputCls),
                      h.Role('combobox'),
                      h.Attribute('aria-expanded', 'true'),
                      h.Attribute('aria-autocomplete', 'list'),
                      h.Attribute('aria-controls', 'palette-results'),
                      ...(highlighted === undefined
                        ? []
                        : [
                            h.Attribute(
                              'aria-activedescendant',
                              `palette-result-${model.paletteIndex}`,
                            ),
                          ]),
                      h.Id('palette-input'),
                      h.Type('text'),
                      h.Placeholder('Search tools, or type what you need'),
                      h.Autocomplete('off'),
                      h.AriaLabel('Search tools'),
                      ...r.initialFocus,
                      h.Value(query),
                      h.OnInput((next) => AppMessage.ChangedPaletteQuery({ query: next })),
                      h.OnKeyDownPreventDefault((key) =>
                        key === 'ArrowDown'
                          ? Option.some(AppMessage.MovedPaletteIndex({ delta: 1 }))
                          : key === 'ArrowUp'
                            ? Option.some(AppMessage.MovedPaletteIndex({ delta: -1 }))
                            : key === 'Enter' && highlighted !== undefined
                              ? Option.some(
                                  AppMessage.ChosePaletteResult({ id: highlighted.meta.id }),
                                )
                              : Option.none(),
                      ),
                    ]),
                    Elements.kbd(h, 'esc'),
                  ],
                ),
                h.div(
                  [h.Class(paletteBodyCls)],
                  [
                    results.length === 0
                      ? h.div(
                          [h.Class(paletteEmptyCls)],
                          [
                            h.p(
                              [h.Class(paletteEmptyTitleCls)],
                              [`No tool matches “${query.trim()}”`],
                            ),
                            h.p(
                              [h.Class(paletteEmptyHintCls)],
                              ['Try a task instead, like “decode”, “timezone”, or “split”.'],
                            ),
                          ],
                        )
                      : h.div(
                          [h.Id('palette-results'), h.Role('listbox'), h.AriaLabel('Tools')],
                          numbered.map((group) =>
                            h.div(
                              [h.Role('group'), h.AriaLabel(group.name), h.Class(paletteGroupCls)],
                              [
                                h.div(
                                  [h.Class(paletteGroupLabelCls)],
                                  [
                                    h.span([], [group.name]),
                                    h.span([], [String(group.items.length)]),
                                  ],
                                ),
                                ...group.items.map(({ tool, index }) =>
                                  h.button(
                                    [
                                      h.Id(`palette-result-${index}`),
                                      h.Role('option'),
                                      h.AriaSelected(index === model.paletteIndex),
                                      h.OnClick(
                                        AppMessage.ChosePaletteResult({ id: tool.meta.id }),
                                      ),
                                      h.Class(paletteItemCls),
                                    ],
                                    [
                                      h.span(
                                        [h.Class(paletteItemMainCls)],
                                        [
                                          h.span(
                                            [h.Class(paletteItemNameCls)],
                                            paletteMarked(h, tool.meta.name, query),
                                          ),
                                          h.span(
                                            [h.Class(paletteItemDescCls)],
                                            paletteMarked(h, tool.meta.description, query),
                                          ),
                                        ],
                                      ),
                                      ...(group.showCategory
                                        ? [
                                            h.span(
                                              [h.Class(paletteItemCatCls)],
                                              [categoryName(tool.meta.category)],
                                            ),
                                          ]
                                        : []),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                  ],
                ),
                h.div(
                  [h.Class(paletteFooterCls)],
                  [
                    h.div(
                      [h.Class(paletteHintsCls)],
                      [
                        paletteHint(h, '↑↓', 'Move'),
                        paletteHint(h, '↵', 'Open'),
                        paletteHint(h, 'esc', 'Close'),
                      ],
                    ),
                    h.span(
                      [h.Class(paletteCountCls)],
                      [`${results.length} ${results.length === 1 ? 'tool' : 'tools'}`],
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
    },
  })
}

const filePicker = (h: H, model: Model): Html => {
  const candidates = toolsFor(model.pendingFiles)
  return h.div(
    [h.Class(pickerCls), h.Role('dialog'), h.AriaLabel('Open files with')],
    [
      h.div(
        [],
        [
          h.h2(
            [h.Class(sectionTitleCls)],
            [`Open ${model.pendingFiles.length === 1 ? 'file' : 'files'} with`],
          ),
          ...candidates.map((tool) =>
            Elements.button(
              h,
              { variant: 'secondary' },
              [h.OnClick(AppMessage.ChoseFileTool({ id: tool.meta.id }))],
              [tool.meta.name],
            ),
          ),
          Elements.button(
            h,
            { variant: 'ghost' },
            [h.OnClick(AppMessage.DismissedFiles())],
            ['Cancel'],
          ),
        ],
      ),
    ],
  )
}

const toasts = (h: H, model: Model): Html => {
  const t = Toast.parts(model.ui.toast, h, uiOf(model))
  return t.region(
    {},
    [],
    [
      t.list(
        {},
        [],
        [...model.ui.toast.items]
          .reverse()
          .map((item) =>
            t.root(
              { id: item.id },
              [],
              [
                t.title({ id: item.id }, [], [item.title]),
                t.description({ id: item.id }, [], [item.description]),
                t.close({ id: item.id }, [], ['×']),
              ],
            ),
          ),
      ),
    ],
  )
}

// ── Document ────────────────────────────────────────────────────────────────

const titleOf = (model: Model): string => {
  const tool =
    model.route._tag === 'Tool' ? toolOf(model.route.category, model.route.id) : undefined
  return tool === undefined ? 'Tools' : `${tool.meta.name} · Tools`
}

export const shellView = (model: Model, h: H): Document => ({
  title: titleOf(model),
  body: h.div(
    [h.Class(frameCls)],
    [
      topbar(h),
      h.div(
        [h.Class(bodyCls)],
        [sidebar(h, model), h.main([h.Class(mainCls), h.Id('main')], [content(h, model)])],
      ),
      palette(h, model),
      model.dragging ? h.div([h.Class(overlayCls)], ['Drop to open']) : null,
      model.pendingFiles.length > 0 ? filePicker(h, model) : null,
      toasts(h, model),
    ],
  ),
})
