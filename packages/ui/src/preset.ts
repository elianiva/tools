import { definePreset } from '@pandacss/dev'
import { reviewStyles } from './styles/review.ts'
import { formsStyles } from './styles/forms.ts'
import { leafStyles } from './styles/leaf.ts'
import { listStyles } from './styles/list.ts'

// Every component rule targets the `data-*` attributes ui-sdk writes, so no part
// needs a class name and no recipe prop has to be known at build time. Variants
// are attributes (`data-size`, `data-variant`) the app sets. The look is plain
// on purpose: neutral colors on CSS variables, one accent, system fonts.
const hit = (selector: string) => `${selector}:not([disabled]):not([aria-disabled="true"])`

const base = {
  // The Graphite palette, after the Quorum design language: near-neutral greys with a
  // faint cool cast, an ink primary, Geist for text and Geist Mono for figures.
  // The `--fl-*` names the components use are aliases of these tokens.
  ':root': {
    '--radius': '10px',
    '--sans': "'Geist', ui-sans-serif, system-ui, sans-serif",
    '--mono': "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    '--background': 'oklch(0.981 0.0012 260)',
    '--foreground': 'oklch(0.26 0.01 260)',
    '--card': 'oklch(0.997 0.0006 260)',
    '--primary': 'oklch(0.3 0.004 260)',
    '--primary-foreground': 'oklch(0.99 0 0)',
    '--primary-soft': 'oklch(0.3 0 0 / 0.08)',
    '--muted': 'oklch(0.96 0.002 260)',
    '--muted-foreground': 'oklch(0.52 0.01 260)',
    '--accent': 'oklch(0.94 0.0036 260)',
    '--border': 'oklch(0.914 0.004 260)',
    '--input': 'oklch(0.895 0.0044 260)',
    '--ring': 'oklch(0.55 0 0)',
    '--ok': 'oklch(0.5 0.13 155)',
    '--warn': 'oklch(0.66 0.145 66)',
    '--danger': 'oklch(0.52 0.19 27)',
    '--ok-soft': 'oklch(0.56 0.13 155 / 0.12)',
    '--warn-soft': 'oklch(0.66 0.145 66 / 0.14)',
    '--danger-soft': 'oklch(0.545 0.19 27 / 0.12)',
    '--info': 'oklch(0.55 0.12 235)',
    '--info-soft': 'oklch(0.62 0.135 235 / 0.12)',
    '--page': 'oklch(0.955 0.002 260)',
    '--surface-nested': 'oklch(0.975 0.0012 260)',
    '--well': 'oklch(0.938 0.002 260)',
    '--hairline': 'oklch(0.26 0.01 260 / 0.1)',
    '--hairline-soft': 'oklch(0.26 0.01 260 / 0.06)',
    // Depth. Surfaces sit at four heights, each with one recipe: a hairline edge, a light
    // top edge, and a soft shadow below. well = sunk, raised = one step up, card = a panel,
    // float = above everything.
    '--raised-top': 'oklch(1 0 0)',
    '--raised-bottom': 'oklch(0.972 0.0012 260)',
    '--highlight': 'oklch(1 0 0 / 0.95)',
    '--primary-fill-top': 'oklch(0.38 0.004 260)',
    '--primary-fill-bottom': 'oklch(0.25 0.004 260)',
    '--primary-edge': 'oklch(0.18 0 0)',
    '--destructive-fill-top': 'oklch(0.6 0.19 27)',
    '--destructive-fill-bottom': 'oklch(0.5 0.19 27)',
    '--elev-well':
      'inset 0 1px 2px oklch(0.26 0.01 260 / 0.09), inset 0 0 0 1px var(--hairline-soft)',
    '--elev-raised':
      'inset 0 1px 0 var(--highlight), 0 0 0 1px var(--hairline), 0 1px 1px oklch(0.26 0.01 260 / 0.05), 0 2px 4px -1px oklch(0.26 0.01 260 / 0.07)',
    '--elev-card':
      'inset 0 1px 0 var(--highlight), 0 0 0 1px var(--hairline-soft), 0 1px 2px oklch(0.26 0.01 260 / 0.05), 0 10px 28px -12px oklch(0.26 0.01 260 / 0.16)',
    '--elev-float':
      'inset 0 1px 0 var(--highlight), 0 0 0 1px var(--hairline), 0 2px 6px oklch(0.26 0.01 260 / 0.06), 0 28px 56px -18px oklch(0.26 0.01 260 / 0.3)',
    '--elev-primary':
      'inset 0 1px 0 oklch(1 0 0 / 0.22), inset 0 -1px 0 oklch(0 0 0 / 0.2), 0 0 0 1px var(--primary-edge), 0 1px 2px oklch(0 0 0 / 0.25), 0 4px 10px -4px oklch(0 0 0 / 0.35)',
    // Aliases the components already use.
    '--fl-bg': 'var(--page)',
    '--fl-surface': 'var(--card)',
    '--fl-text': 'var(--foreground)',
    '--fl-muted': 'var(--muted-foreground)',
    '--fl-border': 'var(--border)',
    '--fl-accent': 'var(--primary)',
    '--fl-accent-soft': 'var(--accent)',
    '--fl-danger': 'var(--danger)',
    '--fl-radius': 'calc(var(--radius) * 0.8)',
    colorScheme: 'light',
  },
  body: {
    background: 'var(--page)',
    color: 'var(--foreground)',
    fontFamily: 'var(--sans)',
    fontSize: '13px',
    lineHeight: 1.5,
    WebkitFontSmoothing: 'antialiased',
  },
  'h1, h2, h3, h4': { fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25 },
  h1: { fontSize: '1.5rem' },
  h2: { fontSize: '1.05rem' },
  '::selection': { background: 'var(--primary-soft)' },
  ':focus-visible': {
    outline: '2px solid color-mix(in oklab, var(--ring) 70%, transparent)',
    outlineOffset: '2px',
  },
  '[hidden]': { display: 'none !important' },

  // Buttons and inputs. The demo renders plain elements, so these are element rules.
  button: {
    font: 'inherit',
    padding: '0.5rem 0.9rem',
    border: '1px solid var(--fl-border)',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--fl-surface)',
    color: 'inherit',
    cursor: 'pointer',
    transition: 'background 120ms, border-color 120ms',
  },
  [hit('button:hover')]: { background: 'var(--fl-accent-soft)', borderColor: 'var(--fl-accent)' },
  'input, select': {
    font: 'inherit',
    padding: '0.5rem 0.65rem',
    border: '1px solid var(--fl-border)',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--fl-surface)',
    color: 'inherit',
    width: '100%',
  },
  'input:focus-visible': { outlineOffset: '0', borderColor: 'var(--fl-accent)' },
  'input::placeholder': { color: 'var(--fl-muted)' },

  // ── Elements (no behavior) ──
  '[data-slot="button"]': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  '[data-slot="button"][data-size="sm"]': { padding: '0.3rem 0.65rem', fontSize: '0.85rem' },
  '[data-slot="button"][data-size="lg"]': { padding: '0.65rem 1.2rem', fontSize: '1.05rem' },
  '[data-slot="button"][data-shape="square"]': {
    padding: 0,
    width: '2.25rem',
    height: '2.25rem',
  },
  '[data-slot="button"][data-shape="square"][data-size="sm"]': {
    width: '1.8rem',
    height: '1.8rem',
  },
  '[data-slot="button"][data-shape="square"][data-size="lg"]': {
    width: '2.8rem',
    height: '2.8rem',
  },
  '[data-slot="button"][data-variant="primary"]': {
    background: 'var(--fl-accent)',
    borderColor: 'var(--fl-accent)',
    color: 'var(--primary-foreground)',
  },
  [hit('[data-slot="button"][data-variant="primary"]:hover')]: {
    background: '#244ad0',
    borderColor: '#244ad0',
  },
  '[data-slot="button"][data-variant="ghost"]': {
    background: 'transparent',
    borderColor: 'transparent',
  },
  '[data-slot="button"][data-variant="destructive"]': {
    background: 'var(--fl-danger)',
    borderColor: 'var(--fl-danger)',
    color: 'var(--primary-foreground)',
  },
  [hit('[data-slot="button"][data-variant="destructive"]:hover')]: {
    background: '#a31f26',
    borderColor: '#a31f26',
  },
  '[data-slot="button"]:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  '[data-slot="button-group"]': { display: 'inline-flex' },
  '[data-slot="button-group"] > [data-slot="button"]': { borderRadius: 0 },
  '[data-slot="button-group"] > [data-slot="button"]:first-child': {
    borderStartStartRadius: 'var(--fl-radius)',
    borderEndStartRadius: 'var(--fl-radius)',
  },
  '[data-slot="button-group"] > [data-slot="button"]:last-child': {
    borderStartEndRadius: 'var(--fl-radius)',
    borderEndEndRadius: 'var(--fl-radius)',
  },
  '[data-slot="button-group"] > [data-slot="button"] + [data-slot="button"]': {
    marginInlineStart: '-1px',
  },

  '[data-slot="loader"]': {
    display: 'inline-block',
    width: '1em',
    height: '1em',
    border: '2px solid currentColor',
    borderRightColor: 'transparent',
    borderRadius: '50%',
    animation: 'fl-spin 0.7s linear infinite',
  },
  '[data-slot="loader"][data-size="lg"]': { width: '1.6em', height: '1.6em' },

  '[data-slot="badge"]': {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.1rem 0.5rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 550,
    background: '#eceef2',
    color: '#3a414f',
  },
  '[data-slot="badge"][data-tone="info"]': { background: '#e8edfd', color: '#2447c0' },
  '[data-slot="badge"][data-tone="success"]': { background: '#e2f5e9', color: '#17703a' },
  '[data-slot="badge"][data-tone="warning"]': { background: '#fdf0d8', color: '#8a5a05' },
  '[data-slot="badge"][data-tone="error"]': { background: '#fbe5e6', color: '#a31f26' },

  '[data-slot="banner"]': {
    padding: '0.75rem 1rem',
    border: '1px solid var(--fl-border)',
    borderRadius: 'var(--fl-radius)',
    background: '#e8edfd',
    borderColor: '#c3cffa',
  },
  '[data-slot="banner"][data-tone="neutral"]': {
    background: '#f1f2f5',
    borderColor: 'var(--fl-border)',
  },
  '[data-slot="banner"][data-tone="success"]': { background: '#e2f5e9', borderColor: '#b5e3c6' },
  '[data-slot="banner"][data-tone="warning"]': { background: '#fdf0d8', borderColor: '#f2d9a0' },
  '[data-slot="banner"][data-tone="error"]': { background: '#fbe5e6', borderColor: '#f1b9bc' },
  '[data-slot="banner-title"]': { margin: 0, fontWeight: 600 },
  '[data-slot="banner-body"]': { fontSize: '0.92rem' },

  '[data-slot="breadcrumbs"] ol': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    fontSize: '0.9rem',
    color: 'var(--fl-muted)',
  },
  '[data-slot="breadcrumbs"] li + li::before': {
    content: '"/"',
    marginInlineEnd: '0.4rem',
    opacity: 0.6,
  },
  '[data-slot="breadcrumbs"] [aria-current="page"]': { color: 'var(--fl-text)', fontWeight: 550 },

  '[data-slot="empty"]': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '2rem 1rem',
    textAlign: 'center',
    border: '1px dashed var(--fl-border)',
    borderRadius: 'var(--fl-radius)',
  },
  '[data-slot="empty-title"]': { margin: 0, fontWeight: 600 },
  '[data-slot="empty-description"]': { margin: 0, color: 'var(--fl-muted)', fontSize: '0.9rem' },

  '[data-slot="label"]': { fontWeight: 550, fontSize: '0.9rem' },
  '[data-slot="label"][data-required]::after': { content: '" *"', color: 'var(--fl-danger)' },
  '[data-slot="input"][data-size="sm"]': { padding: '0.3rem 0.55rem', fontSize: '0.85rem' },
  '[data-slot="input"][data-size="lg"]': { padding: '0.7rem 0.85rem', fontSize: '1.05rem' },
  '[data-slot="input"][data-invalid]': { borderColor: 'var(--fl-danger)' },
  '[data-slot="input"]:disabled': { opacity: 0.55, cursor: 'not-allowed' },

  '[data-slot="link"]': {
    color: 'var(--fl-accent)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  '[data-slot="link"][data-variant="plain"]': { color: 'inherit', textDecoration: 'none' },
  '[data-slot="link"]:hover': { textDecoration: 'none' },

  '[data-slot="skeleton-line"]': {
    display: 'block',
    height: '0.8rem',
    borderRadius: '4px',
    background: 'linear-gradient(90deg, #e9ebf0 25%, #f4f5f8 50%, #e9ebf0 75%)',
    backgroundSize: '200% 100%',
    animation: 'fl-shimmer 1.4s ease-in-out infinite',
  },

  '[data-slot="text"]': { margin: 0 },
  '[data-slot="text"][data-variant="heading1"]': {
    fontSize: '1.9rem',
    fontWeight: 650,
    letterSpacing: '-0.02em',
  },
  '[data-slot="text"][data-variant="heading2"]': { fontSize: '1.35rem', fontWeight: 620 },
  '[data-slot="text"][data-variant="heading3"]': { fontSize: '1.05rem', fontWeight: 600 },
  '[data-slot="text"][data-variant="secondary"]': { color: 'var(--fl-muted)' },
  '[data-slot="text"][data-variant="mono"]': {
    fontFamily: 'var(--mono)',
    fontSize: '0.88rem',
  },

  '[data-slot="layer-card"]': {
    padding: '1rem 1.1rem',
    border: '1px solid var(--fl-border)',
    borderRadius: '12px',
    background: 'var(--fl-surface)',
    boxShadow: '0 1px 2px rgb(23 26 33 / 0.05)',
  },

  '[data-slot="table"]': {
    overflowX: 'auto',
    border: '1px solid var(--fl-border)',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--fl-surface)',
  },
  '[data-slot="table"] table': { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  '[data-slot="table"] th': {
    textAlign: 'start',
    padding: '0.6rem 0.9rem',
    color: 'var(--fl-muted)',
    fontWeight: 550,
    fontSize: '0.8rem',
    background: '#f8f9fb',
    borderBottom: '1px solid var(--fl-border)',
  },
  '[data-slot="table"] td': {
    padding: '0.65rem 0.9rem',
    borderBottom: '1px solid var(--fl-border)',
  },
  '[data-slot="table"] tbody tr:last-child td': { borderBottom: 0 },

  '[data-slot="meter-label"]': { fontSize: '0.85rem' },
  '[data-slot="meter-value"]': { fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' },
  '[data-slot="meter-track"]': {
    gridColumn: '1 / -1',
    height: '8px',
    borderRadius: '999px',
    background: '#e9ebf0',
    overflow: 'hidden',
  },
  '[data-slot="meter-indicator"]': {
    height: '100%',
    background: 'var(--fl-accent)',
    borderRadius: '999px',
  },

  '[data-slot="toolbar"]': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.3rem',
    border: '1px solid var(--fl-border)',
    borderRadius: '10px',
    background: 'var(--fl-surface)',
  },
  '[data-slot="toolbar"] [data-slot="button"]': { border: 0 },
  '[data-slot="grid"]': { display: 'grid', gap: '0.75rem', width: '100%' },
  '[data-slot="input-area"]': {
    font: 'inherit',
    width: '100%',
    padding: '0.6rem 0.7rem',
    border: '1px solid var(--fl-border)',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--fl-surface)',
    resize: 'vertical',
  },
  '[data-slot="input-group"]': { display: 'flex', width: '100%' },
  '[data-slot="input-group"] > [data-slot="input"]': {
    borderStartEndRadius: 0,
    borderEndEndRadius: 0,
    flex: 1,
  },
  '[data-slot="input-group"] > [data-slot="button"]': {
    borderStartStartRadius: 0,
    borderEndStartRadius: 0,
    marginInlineStart: '-1px',
  },
  '[data-slot="code"]': {
    margin: 0,
    padding: '0.9rem 1rem',
    borderRadius: 'var(--fl-radius)',
    background: 'oklch(0.215 0.0018 260)',
    color: 'oklch(0.94 0.0018 260)',
    fontFamily: 'var(--mono)',
    fontSize: '0.85rem',
    overflowX: 'auto',
    width: '100%',
  },

  // ── Controlled components ──
  '[data-slot="checkbox"], [data-slot="radio"]': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.15rem',
    height: '1.15rem',
    padding: 0,
    border: '1.5px solid #9aa3b2',
    background: 'var(--fl-surface)',
    color: 'var(--primary-foreground)',
    transition: 'background 120ms, border-color 120ms',
  },
  '[data-slot="checkbox"]': { borderRadius: '4px' },
  '[data-slot="radio"]': { borderRadius: '50%' },
  '[data-slot="checkbox"][data-checked], [data-slot="radio"][data-checked]': {
    background: 'var(--fl-accent)',
    borderColor: 'var(--fl-accent)',
  },
  '[data-slot="checkbox"][data-checked]:hover, [data-slot="radio"][data-checked]:hover': {
    background: 'var(--fl-accent)',
  },
  '[data-slot="checkbox-indicator"]': { fontSize: '0.8rem', lineHeight: 1, visibility: 'hidden' },
  '[data-slot="checkbox-indicator"][data-checked]': { visibility: 'visible' },
  '[data-slot="radio-indicator"]': {
    width: '0.45rem',
    height: '0.45rem',
    borderRadius: '50%',
    background: '#fff',
    visibility: 'hidden',
  },
  '[data-slot="radio-indicator"][data-checked]': { visibility: 'visible' },
  '[data-slot="checkbox"][data-disabled], [data-slot="radio"][data-disabled], [data-slot="switch"][data-disabled]':
    {
      opacity: 0.5,
      cursor: 'not-allowed',
    },

  '[data-slot="switch"]': {
    position: 'relative',
    width: '2.4rem',
    height: '1.4rem',
    padding: 0,
    border: 0,
    borderRadius: '999px',
    background: '#c3c9d4',
    transition: 'background 140ms',
  },
  '[data-slot="switch"][data-checked]': { background: 'var(--fl-accent)' },
  '[data-slot="switch"]:hover': { background: '#b3bac7' },
  '[data-slot="switch"][data-checked]:hover': { background: 'var(--fl-accent)' },
  '[data-slot="switch-thumb"]': {
    position: 'absolute',
    top: '0.15rem',
    insetInlineStart: '0.15rem',
    width: '1.1rem',
    height: '1.1rem',
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 1px 2px rgb(0 0 0 / 0.25)',
    transition: 'transform 140ms',
  },
  '[data-slot="switch-thumb"][data-checked]': { transform: 'translateX(1rem)' },

  '[data-slot="tabs"]': { width: '100%' },
  '[data-slot="tabs-list"]': {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '1px solid var(--fl-border)',
  },
  '[data-slot="tabs-tab"]': {
    border: 0,
    borderBottom: '2px solid transparent',
    borderRadius: 0,
    background: 'transparent',
    color: 'var(--fl-muted)',
    padding: '0.55rem 0.9rem',
    marginBottom: '-1px',
  },
  '[data-slot="tabs-tab"][data-selected]': {
    color: 'var(--fl-text)',
    borderBottomColor: 'var(--fl-accent)',
    fontWeight: 550,
  },
  '[data-slot="tabs-tab"]:hover': { background: 'transparent', color: 'var(--fl-text)' },
  '[data-slot="tabs-panel"]': { padding: '1rem 0.25rem', color: 'var(--fl-muted)' },

  '[data-slot="collapsible"]': { width: '100%' },
  '[data-slot="collapsible-trigger"]': { fontWeight: 500 },
  '[data-slot="collapsible-panel"]': {
    marginTop: '0.6rem',
    padding: '0.8rem 1rem',
    border: '1px solid var(--fl-border)',
    borderRadius: 'var(--fl-radius)',
    background: '#fafbfc',
    color: 'var(--fl-muted)',
  },

  '[data-slot="slider"]': { width: '100%', maxWidth: '24rem' },
  '[data-slot="slider-control"]': {
    display: 'flex',
    alignItems: 'center',
    height: '1.5rem',
    cursor: 'pointer',
  },
  '[data-slot="slider-track"]': {
    width: '100%',
    height: '6px',
    borderRadius: '999px',
    background: '#e1e4ea',
  },
  '[data-slot="slider-indicator"]': { borderRadius: '999px', background: 'var(--fl-accent)' },
  '[data-slot="slider-thumb"]': {
    width: '1.2rem',
    height: '1.2rem',
    borderRadius: '50%',
    background: '#fff',
    border: '2px solid var(--fl-accent)',
    boxShadow: '0 1px 3px rgb(0 0 0 / 0.2)',
  },
  '[data-slot="slider-thumb"]:focus-within': {
    outline: '2px solid var(--fl-accent)',
    outlineOffset: '2px',
  },

  // ── Popups ──
  '[data-slot="tooltip-content"]': {
    zIndex: 20,
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    background: '#1f232b',
    color: 'var(--primary-foreground)',
    fontSize: '0.8rem',
    pointerEvents: 'none',
  },
  '[data-slot="popover-content"], [data-slot="menu-content"], [data-slot="select-content"]': {
    zIndex: 20,
    border: '1px solid var(--fl-border)',
    borderRadius: '10px',
    background: 'var(--fl-surface)',
    boxShadow: '0 12px 32px rgb(23 26 33 / 0.16)',
  },
  '[data-slot="popover-content"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '18rem',
    padding: '1rem',
  },
  '[data-slot="popover-title"]': { margin: 0, fontSize: '1rem', fontWeight: 600 },
  '[data-slot="popover-description"]': {
    margin: 0,
    color: 'var(--fl-muted)',
    fontSize: '0.9rem',
  },
  '[data-slot="menu-content"], [data-slot="select-content"]': {
    minWidth: '11rem',
    padding: '0.3rem',
  },
  '[data-slot="menu-item"], [data-slot="select-item"]': {
    padding: '0.4rem 0.65rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  '[data-slot="menu-item"][data-highlighted], [data-slot="select-item"][data-highlighted]': {
    background: 'var(--fl-accent-soft)',
  },
  '[data-slot="select-item"][data-selected]': { fontWeight: 600, color: 'var(--fl-accent)' },
  '[data-slot="select-trigger"]': {
    display: 'inline-flex',
    minWidth: '12rem',
    justifyContent: 'space-between',
  },
  '[data-slot="select"]': { position: 'relative', display: 'inline-block' },
  '[data-slot="tooltip-content"][data-closed], [data-slot="popover-content"][data-closed], [data-slot="menu-content"][data-closed], [data-slot="select-content"][data-closed]':
    {
      opacity: 0,
    },
  '[data-slot="tooltip-content"], [data-slot="popover-content"], [data-slot="menu-content"], [data-slot="select-content"]':
    {
      transition: 'opacity 120ms',
    },

  // Field
  '[data-slot="field"]': { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  '[data-slot="field-label"], [data-slot="combobox-label"]': {
    fontWeight: 550,
    fontSize: '0.9rem',
  },
  '[data-slot="field-description"]': { color: 'var(--fl-muted)', fontSize: '0.85rem', margin: 0 },
  '[data-slot="field-error"]': { color: 'var(--fl-danger)', fontSize: '0.85rem', margin: 0 },
  '[data-slot="field-control"][data-invalid], [data-slot="combobox-input"][data-invalid]': {
    borderColor: 'var(--fl-danger)',
  },

  // Combobox
  '[data-slot="combobox"]': {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  '[data-slot="combobox-content"]': {
    zIndex: 5,
    width: 'var(--anchor-width)',
    maxHeight: '14rem',
    overflow: 'auto',
    padding: '0.25rem',
    border: '1px solid var(--fl-border)',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--fl-surface)',
    boxShadow: '0 8px 24px rgb(23 26 33 / 0.12)',
  },
  '[data-slot="combobox-item"]': {
    cursor: 'pointer',
    padding: '0.4rem 0.6rem',
    borderRadius: '6px',
  },
  '[data-slot="combobox-item"][data-highlighted]': { background: 'var(--fl-accent-soft)' },
  '[data-slot="combobox-item"][data-selected]': { fontWeight: 600, color: 'var(--fl-accent)' },
  '[data-slot="combobox-empty"]': { padding: '0.4rem 0.6rem', color: 'var(--fl-muted)' },

  // Accordion
  '[data-slot="accordion"]': {
    border: '1px solid var(--fl-border)',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--fl-surface)',
    overflow: 'hidden',
  },
  '[data-slot="accordion-item"] + [data-slot="accordion-item"]': {
    borderTop: '1px solid var(--fl-border)',
  },
  '[data-slot="accordion-header"]': { margin: 0, fontSize: 'inherit' },
  '[data-slot="accordion-trigger"]': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 0,
    borderRadius: 0,
    background: 'transparent',
    fontWeight: 550,
    textAlign: 'start',
    cursor: 'pointer',
  },
  '[data-slot="accordion-trigger"]::after': {
    content: '"+"',
    color: 'var(--fl-muted)',
    fontWeight: 400,
  },
  '[data-slot="accordion-trigger"][aria-expanded="true"]::after': { content: '"\\2212"' },
  '[data-slot="accordion-panel"]': { padding: '0 1rem 0.9rem', color: 'var(--fl-muted)' },
  '[data-slot="accordion-panel"] p': { margin: 0 },

  // Dialog. One theme for both providers: ui-sdk's parts and `@foldkit/ui`'s, stamped.
  '[data-slot="dialog-backdrop"]': {
    position: 'fixed',
    inset: 0,
    background: 'rgb(15 18 25 / 0.5)',
    transition: 'opacity 150ms',
  },
  '[data-slot="dialog-content"]': {
    position: 'fixed',
    top: '50%',
    left: '50%',
    translate: '-50% -50%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: 'min(26rem, calc(100vw - 2rem))',
    padding: '1.25rem',
    border: '1px solid var(--fl-border)',
    borderRadius: '12px',
    background: 'var(--fl-surface)',
    boxShadow: '0 24px 64px rgb(15 18 25 / 0.3)',
    transition: 'opacity 150ms',
  },
  '[data-slot="dialog-title"]': { margin: 0, fontSize: '1.1rem', fontWeight: 650 },
  '[data-slot="dialog-description"]': { margin: 0, color: 'var(--fl-muted)' },
  '[data-slot="dialog-backdrop"][data-closed], [data-slot="dialog-content"][data-closed]': {
    opacity: 0,
  },
}

// Depth recipes. Merged over the flat rules by selector: an object literal with a repeated
// key keeps only the last one, which would drop the earlier properties.
const depth = {
  '[data-slot="alert"]': {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-card)',
    width: '100%',
  },
  '[data-slot="alert"][data-tone="error"]': {
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
  },
  '[data-slot="alert-title"]': { margin: 0, fontWeight: 600 },
  '[data-slot="alert-body"]': { fontSize: '0.9rem', opacity: 0.85 },
  '[data-slot="aspect-ratio"]': {
    width: '100%',
    maxWidth: '20rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="card"]': {
    width: '100%',
    maxWidth: '24rem',
    borderRadius: 'calc(var(--radius) * 1.8)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1.1rem',
  },
  '[data-slot="card-title"]': { margin: 0, fontSize: '1rem' },
  '[data-slot="card-description"]': {
    margin: 0,
    color: 'var(--muted-foreground)',
    fontSize: '0.85rem',
  },
  '[data-slot="card-footer"]': { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' },
  '[data-slot="kbd"]': {
    display: 'inline-flex',
    padding: '0.1rem 0.45rem',
    borderRadius: '6px',
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    fontFamily: 'var(--mono)',
    fontSize: '0.72rem',
  },
  '[data-slot="avatar"]': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: 'var(--elev-raised)',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  '[data-slot="avatar"][data-size="sm"]': {
    width: '1.6rem',
    height: '1.6rem',
    fontSize: '0.65rem',
  },
  '[data-slot="avatar"][data-size="lg"]': {
    width: '3.2rem',
    height: '3.2rem',
    fontSize: '1.05rem',
  },
  '[data-slot="item"], [data-slot="attachment"]': {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.85rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-raised)',
    width: '100%',
    maxWidth: '24rem',
  },
  '[data-slot="item-body"]': { flex: 1 },
  '[data-slot="item-title"]': { margin: 0, fontWeight: 550 },
  '[data-slot="item-description"]': {
    margin: 0,
    color: 'var(--muted-foreground)',
    fontSize: '0.8rem',
  },
  '[data-slot="bubble"]': {
    maxWidth: '70%',
    padding: '0.5rem 0.8rem',
    borderRadius: '14px',
    background: 'var(--card)',
    boxShadow: 'var(--elev-raised)',
  },
  '[data-slot="bubble"][data-from="me"]': {
    marginInlineStart: 'auto',
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    color: 'var(--primary-foreground)',
  },
  '[data-slot="marker"]': {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
    fontFamily: 'var(--mono)',
  },
  '[data-slot="marker"]::before, [data-slot="marker"]::after': {
    content: '""',
    flex: 1,
    height: '1px',
    background: 'var(--hairline)',
  },
  '[data-slot="fieldset"]': {
    border: 0,
    margin: 0,
    padding: '1rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    width: '100%',
  },
  '[data-slot="native-select"]': { width: '100%', maxWidth: '16rem' },
  '[data-slot="nav"]': { display: 'flex', gap: '0.25rem' },
  '[data-slot="nav"] a': {
    padding: '0.35rem 0.7rem',
    borderRadius: '6px',
    color: 'var(--muted-foreground)',
    textDecoration: 'none',
  },
  '[data-slot="nav"] a[aria-current="page"]': {
    background: 'var(--raised-top)',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
  },
  '[data-slot="progress"]': {
    width: '100%',
    height: '8px',
    borderRadius: '999px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    overflow: 'hidden',
  },
  '[data-slot="separator"]': { height: '1px', width: '100%', background: 'var(--hairline)' },
  '[data-slot="separator"][data-orientation="vertical"]': { width: '1px', height: '1.5rem' },
  '[data-slot="scroll-area"]': {
    overflow: 'auto',
    width: '100%',
    maxWidth: '24rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    padding: '0.75rem',
  },
  '[data-slot="autocomplete-content"]': {
    zIndex: 20,
    padding: '0.3rem',
    borderRadius: '10px',
    background: 'var(--card)',
    boxShadow: 'var(--elev-float)',
    minWidth: '14rem',
  },
  '[data-slot="autocomplete-item"], [data-slot="command-item"]': {
    padding: '0.4rem 0.65rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  '[data-slot="autocomplete-item"][data-highlighted], [data-slot="command-item"][data-highlighted]':
    { background: 'var(--accent)' },
  '[data-slot="autocomplete-empty"], [data-slot="command-empty"]': {
    padding: '0.5rem 0.65rem',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="command"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
    maxWidth: '26rem',
    padding: '0.6rem',
    borderRadius: '12px',
    background: 'var(--card)',
    boxShadow: 'var(--elev-float)',
  },
  '[data-slot="calendar"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '17rem',
  },
  '[data-slot="calendar"] > div:first-child': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  '[data-slot="calendar-heading"]': { fontWeight: 600 },
  '[data-slot="calendar-weekdays"], [data-slot="calendar-week"]': {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  },
  '[data-slot="calendar-weekday"]': {
    textAlign: 'center',
    color: 'var(--muted-foreground)',
    fontSize: '0.75rem',
  },
  '[data-slot="calendar-day"]': {
    padding: '0.4rem 0',
    textAlign: 'center',
    background: 'transparent',
    boxShadow: 'none',
    borderRadius: '6px',
  },
  '[data-slot="calendar-day"][data-outside]': { color: 'var(--muted-foreground)', opacity: 0.55 },
  '[data-slot="calendar-day"][data-today]': { fontWeight: 700 },
  '[data-slot="calendar-day"][data-selected]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    color: 'var(--primary-foreground)',
  },
  '[data-slot="toc"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.85rem',
  },
  '[data-slot="toc-title"]': {
    margin: 0,
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="toc"] ul': {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  '[data-slot="toc"] a': { color: 'var(--muted-foreground)', textDecoration: 'none' },
  '[data-slot="toc"] a[aria-current="location"]': { color: 'var(--foreground)', fontWeight: 550 },
  '[data-slot="sidebar"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    width: '14rem',
    padding: '0.75rem',
    background: 'var(--muted)',
    borderRadius: 'calc(var(--radius) * 1.4)',
    boxShadow: 'var(--elev-card)',
  },
  '[data-slot="sidebar-group"]': {
    margin: '0.6rem 0.5rem 0.25rem',
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="sidebar-link"]': {
    padding: '0.35rem 0.5rem',
    borderRadius: '6px',
    color: 'var(--muted-foreground)',
    textDecoration: 'none',
  },
  '[data-slot="sidebar-link"][aria-current="page"]': {
    background: 'var(--raised-top)',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
  },
  '[data-slot="copy-text"]': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    padding: '0.5rem 0.5rem 0.5rem 0.85rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    fontFamily: 'var(--mono)',
    fontSize: '0.8rem',
  },
  '[data-slot="copy-text"][data-inline]': {
    display: 'inline-flex',
    padding: '0.1rem 0.1rem 0.1rem 0.5rem',
  },
  '[data-slot="copy-button"]': { padding: '0.2rem 0.55rem', fontSize: '0.75rem' },
  '[data-slot="page-header"]': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
  },
  '[data-slot="page-header-title"]': { margin: 0, fontSize: '1.2rem' },
  '[data-slot="page-header-description"]': { margin: 0, color: 'var(--muted-foreground)' },
  '[data-slot="page-header-actions"]': { display: 'flex', gap: '0.5rem' },
  '[data-slot="resource-list"]': {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    width: '100%',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-card)',
  },
  '[data-slot="resource-list"] li': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--hairline-soft)',
  },
  '[data-slot="resource-list"] li:last-child': { borderBottom: 0 },
  '[data-slot="resource-name"]': { margin: 0, fontWeight: 550 },
  '[data-slot="resource-meta"]': {
    margin: 0,
    color: 'var(--muted-foreground)',
    fontSize: '0.8rem',
  },
  // ── Depth ── (these come last, so they win over the flat rules above)
  'button, [data-slot="button"]': {
    border: 0,
    borderRadius: 'calc(var(--radius) * 1)',
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), filter 150ms, box-shadow 150ms',
  },
  '[data-slot="button"]:active:not(:disabled), button:active:not(:disabled)': {
    transform: 'scale(0.97)',
  },
  [hit('button:hover')]: {
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    filter: 'brightness(0.98)',
  },
  '[data-slot="button"][data-variant="primary"]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
    color: 'var(--primary-foreground)',
  },
  [hit('[data-slot="button"][data-variant="primary"]:hover')]: {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    filter: 'brightness(1.08)',
  },
  '[data-slot="button"][data-variant="destructive"]': {
    background: 'linear-gradient(var(--destructive-fill-top), var(--destructive-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
    color: '#fff',
  },
  [hit('[data-slot="button"][data-variant="destructive"]:hover')]: {
    background: 'linear-gradient(var(--destructive-fill-top), var(--destructive-fill-bottom))',
    filter: 'brightness(1.08)',
  },
  '[data-slot="button"][data-variant="ghost"]': { background: 'transparent', boxShadow: 'none' },
  [hit('[data-slot="button"][data-variant="ghost"]:hover')]: {
    background: 'var(--accent)',
    filter: 'none',
  },
  'input, select, [data-slot="input-area"]': {
    border: 0,
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    borderRadius: 'var(--fl-radius)',
    fontSize: '13px',
  },
  'input:focus-visible, [data-slot="input-area"]:focus-visible': {
    outline: 0,
    boxShadow: 'var(--elev-well), 0 0 0 3px color-mix(in oklab, var(--ring) 45%, transparent)',
  },
  '[data-slot="input"][data-invalid], [data-slot="field-control"][data-invalid], [data-slot="combobox-input"][data-invalid]':
    {
      boxShadow: 'var(--elev-well), 0 0 0 2px color-mix(in oklab, var(--danger) 55%, transparent)',
    },
  '[data-slot="layer-card"], [data-slot="accordion"], [data-slot="table"], [data-slot="banner"], [data-slot="toolbar"]':
    {
      border: 0,
      boxShadow: 'var(--elev-card)',
    },
  '[data-slot="table"] th': { background: 'var(--surface-nested)' },
  '[data-slot="dialog-content"], [data-slot="popover-content"], [data-slot="menu-content"], [data-slot="select-content"], [data-slot="combobox-content"]':
    {
      border: 0,
      boxShadow: 'var(--elev-float)',
    },
  '[data-slot="tooltip-content"]': {
    boxShadow: 'var(--elev-float)',
    background: 'oklch(0.26 0.01 260)',
  },
  '[data-slot="switch"]': { background: 'var(--well)', boxShadow: 'var(--elev-well)' },
  '[data-slot="switch"][data-checked]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
  },
  '[data-slot="switch-thumb"]': {
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
  },
  '[data-slot="checkbox"], [data-slot="radio"]': {
    border: 0,
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
  },
  '[data-slot="checkbox"][data-checked], [data-slot="radio"][data-checked]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
  },
  '[data-slot="slider-track"]': { background: 'var(--well)', boxShadow: 'var(--elev-well)' },
  '[data-slot="slider-indicator"]': { background: 'var(--primary)' },
  '[data-slot="slider-thumb"]': {
    border: 0,
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
  },
  '[data-slot="tabs-tab"], [data-slot="accordion-trigger"]': {
    boxShadow: 'none',
    background: 'transparent',
  },
  '[data-slot="tabs-tab"][data-selected]': { borderBottomColor: 'var(--primary)' },
  '[data-slot="meter-track"]': { background: 'var(--well)', boxShadow: 'var(--elev-well)' },
  '[data-slot="meter-indicator"]': { background: 'var(--primary)' },
  '[data-slot="badge"]': {
    background: 'var(--muted)',
    color: 'var(--muted-foreground)',
    boxShadow: 'inset 0 0 0 1px var(--hairline-soft)',
  },
  '[data-slot="badge"][data-tone="info"]': {
    background: 'var(--info-soft)',
    color: 'var(--info)',
  },
  '[data-slot="badge"][data-tone="success"]': {
    background: 'var(--ok-soft)',
    color: 'var(--ok)',
  },
  '[data-slot="badge"][data-tone="warning"]': {
    background: 'var(--warn-soft)',
    color: 'var(--warn)',
  },
  '[data-slot="badge"][data-tone="error"]': {
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
  },
  '[data-slot="banner"]': { background: 'var(--info-soft)' },
  '[data-slot="banner"][data-tone="neutral"]': { background: 'var(--muted)' },
  '[data-slot="banner"][data-tone="success"]': { background: 'var(--ok-soft)' },
  '[data-slot="banner"][data-tone="warning"]': { background: 'var(--warn-soft)' },
  '[data-slot="banner"][data-tone="error"]': { background: 'var(--danger-soft)' },
  '[data-slot="link"]': { color: 'var(--foreground)', textDecorationColor: 'var(--hairline)' },
  '[data-slot="combobox-item"][data-highlighted], [data-slot="menu-item"][data-highlighted], [data-slot="select-item"][data-highlighted]':
    {
      background: 'var(--accent)',
    },
  '[data-slot="combobox-item"][data-selected], [data-slot="select-item"][data-selected]': {
    color: 'var(--foreground)',
    fontWeight: 600,
  },
}

type Rules = Record<string, Record<string, unknown>>

// Second batch of ui-sdk components.
const kit = {
  '[data-slot="alert-dialog-backdrop"], [data-slot="drawer-backdrop"]': {
    position: 'fixed',
    inset: 0,
    background: 'rgb(15 18 25 / 0.5)',
    transition: 'opacity 150ms',
  },
  '[data-slot="alert-dialog-content"]': {
    position: 'fixed',
    top: '50%',
    left: '50%',
    translate: '-50% -50%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: 'min(26rem, calc(100vw - 2rem))',
    padding: '1.25rem',
    borderRadius: '12px',
    background: 'var(--fl-surface)',
    boxShadow: 'var(--elev-float)',
    transition: 'opacity 150ms',
  },
  '[data-slot="drawer-viewport"]': { position: 'fixed', inset: 0, pointerEvents: 'none' },
  '[data-slot="drawer-content"]': {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: 'min(24rem, 100vw)',
    padding: '1.25rem',
    background: 'var(--fl-surface)',
    boxShadow: 'var(--elev-float)',
    pointerEvents: 'auto',
    transition: 'opacity 150ms',
  },
  '[data-slot="alert-dialog-title"], [data-slot="drawer-title"]': {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 650,
  },
  '[data-slot="alert-dialog-description"], [data-slot="drawer-description"]': {
    margin: 0,
    color: 'var(--fl-muted)',
  },
  '[data-slot="alert-dialog-backdrop"][data-closed], [data-slot="alert-dialog-content"][data-closed], [data-slot="drawer-backdrop"][data-closed], [data-slot="drawer-content"][data-closed]':
    { opacity: 0 },
  '[data-slot="hover-card-content"]': {
    zIndex: 20,
    width: '16rem',
    padding: '0.9rem',
    borderRadius: '10px',
    background: 'var(--fl-surface)',
    boxShadow: 'var(--elev-float)',
    transition: 'opacity 120ms',
  },
  '[data-slot="hover-card-content"] p': { margin: '0.25rem 0 0', color: 'var(--fl-muted)' },
  '[data-slot="hover-card-content"][data-closed]': { opacity: 0 },
  '[data-slot="hover-card-trigger"]': {
    border: 0,
    background: 'transparent',
    color: 'var(--fl-accent)',
    textDecoration: 'underline',
    padding: 0,
  },
  '[data-slot="toggle"]': { minWidth: '6rem' },
  '[data-slot="toggle"][data-pressed], [data-slot="toggle"][aria-pressed="true"]': {
    background: 'var(--fl-accent-soft)',
    color: 'var(--fl-accent)',
  },
  '[data-slot="listbox"]': {
    display: 'flex',
    flexDirection: 'column',
    width: '14rem',
    padding: '0.3rem',
    borderRadius: '10px',
    boxShadow: 'var(--elev-card)',
    background: 'var(--fl-surface)',
  },
  '[data-slot="listbox-item"]': {
    padding: '0.4rem 0.65rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  '[data-slot="listbox-item"][data-highlighted]': { background: 'var(--fl-accent-soft)' },
  '[data-slot="listbox-item"][data-selected]': { fontWeight: 600, color: 'var(--fl-accent)' },
  '[data-slot="navigation-menu"]': { position: 'relative' },
  '[data-slot="navigation-menu-list"]': {
    display: 'flex',
    gap: '0.25rem',
    margin: 0,
    padding: '0.25rem',
    listStyle: 'none',
    borderRadius: '10px',
    boxShadow: 'var(--elev-card)',
    width: 'fit-content',
  },
  '[data-slot="navigation-menu-item"]': { position: 'relative' },
  '[data-slot="navigation-menu-trigger"]': { border: 0, background: 'transparent' },
  '[data-slot="navigation-menu-link"]': { display: 'inline-block', padding: '0.4rem 0.8rem' },
  '[data-slot="navigation-menu-content"]': {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 20,
    minWidth: '14rem',
    marginTop: '0.3rem',
    padding: '0.8rem',
    borderRadius: '10px',
    background: 'var(--fl-surface)',
    boxShadow: 'var(--elev-float)',
  },
  '[data-slot="otp-input"]': { display: 'inline-block', position: 'relative' },
  '[data-slot="otp-input-control"]': {
    position: 'absolute',
    inset: 0,
    width: '100%',
    opacity: 0,
  },
  '[data-slot="otp-input-group"]': { display: 'flex', gap: '0.4rem' },
  '[data-slot="otp-input-slot"]': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.4rem',
    height: '2.8rem',
    borderRadius: '8px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  '[data-slot="otp-input-slot"][data-active]': { outline: '2px solid var(--fl-accent)' },
  '[data-slot="carousel"]': {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
  },
  '[data-slot="carousel-viewport"]': {
    gridColumn: '1 / -1',
    overflow: 'hidden',
    borderRadius: '10px',
  },
  '[data-slot="carousel-previous"]': { gridColumn: 1, gridRow: 2, justifySelf: 'start' },
  '[data-slot="carousel-next"]': { gridColumn: 3, gridRow: 2, justifySelf: 'end' },
  '[data-slot="carousel-content"]': { display: 'flex' },
  '[data-slot="carousel-item"]': {
    flex: '0 0 100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '9rem',
    background: 'var(--surface-nested)',
  },
  '[data-slot="carousel-indicator-group"]': {
    display: 'flex',
    gridColumn: 2,
    gridRow: 2,
    justifyContent: 'center',
    justifySelf: 'center',
    gap: '0.4rem',
  },
  '[data-slot="carousel-indicator"]': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.25rem',
    height: '1.25rem',
    padding: 0,
    minWidth: 0,
    border: 0,
    borderRadius: '50%',
    background: 'transparent',
    boxShadow: 'none',
  },
  // The dot is smaller than the button, so the hit target stays comfortable.
  '[data-slot="carousel-indicator"]::before': {
    content: '""',
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%',
    background: 'var(--input)',
    boxShadow: 'inset 0 0 0 1px var(--hairline)',
    transition: 'background 150ms, scale 150ms',
  },
  '[data-slot="carousel-indicator"][data-selected]::before, [data-slot="carousel-indicator"][aria-selected="true"]::before':
    { background: 'var(--primary)', boxShadow: 'none', scale: '1.15' },
  '[data-slot="resizable"]': {
    display: 'flex',
    width: '100%',
    height: '9rem',
    borderRadius: '10px',
    boxShadow: 'var(--elev-card)',
    overflow: 'hidden',
  },
  '[data-slot="resizable-panel"]': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  '[data-slot="resizable-handle"]': {
    flex: '0 0 6px',
    minWidth: '6px',
    alignSelf: 'stretch',
    background: 'var(--well)',
    cursor: 'col-resize',
  },
  '[data-slot="resizable-handle"][data-dragging], [data-slot="resizable-handle"]:hover': {
    background: 'var(--fl-accent)',
  },

  '[data-slot="menu-context-trigger"]': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '24rem',
    height: '7rem',
    borderRadius: '10px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    color: 'var(--fl-muted)',
  },
  '[data-slot="menubar"]': {
    display: 'flex',
    gap: '0.25rem',
    width: 'fit-content',
    padding: '0.25rem',
    borderRadius: '10px',
    boxShadow: 'var(--elev-card)',
  },
  '[data-slot="menubar"] [data-slot="menu-trigger"]': { border: 0, background: 'transparent' },
  '[data-slot="toggle-group"]': {
    display: 'inline-flex',
    borderRadius: '10px',
    boxShadow: 'var(--elev-card)',
    overflow: 'hidden',
  },
  '[data-slot="toggle-group"] [data-slot="toggle"]': {
    minWidth: 0,
    border: 0,
    borderRadius: 0,
    boxShadow: 'none',
    background: 'transparent',
  },
  '[data-slot="toggle-group"] [aria-pressed="true"]': {
    background: 'var(--fl-accent-soft)',
    color: 'var(--fl-accent)',
  },
  '[data-slot="toast-region"]': {
    position: 'fixed',
    right: '1.25rem',
    bottom: '1.25rem',
    zIndex: 50,
    width: '22rem',
  },
  '[data-slot="toast-list"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  '[data-slot="toast"]': {
    position: 'relative',
    padding: '0.8rem 2.2rem 0.8rem 1rem',
    borderRadius: '10px',
    background: 'var(--fl-surface)',
    boxShadow: 'var(--elev-float)',
  },
  '[data-slot="toast"][data-type="error"]': { borderLeft: '3px solid var(--fl-danger)' },
  '[data-slot="toast"][data-type="success"]': { borderLeft: '3px solid var(--fl-accent)' },
  '[data-slot="toast-title"]': { fontWeight: 600 },
  '[data-slot="toast-description"]': { color: 'var(--fl-muted)', fontSize: '0.9rem' },
  '[data-slot="toast-close"]': {
    position: 'absolute',
    top: '0.4rem',
    right: '0.4rem',
    minWidth: 0,
    padding: '0 0.45rem',
    border: 0,
    background: 'transparent',
  },

  '[data-slot="file-input-dropzone"]': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    height: '8rem',
    borderRadius: '10px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    color: 'var(--fl-muted)',
  },
  '[data-slot="file-input-dropzone"][data-dragging], [data-slot="file-input-dropzone"][data-drag-accept]':
    {
      outline: '2px dashed var(--fl-accent)',
    },
  '[data-slot="file-input-dropzone"][data-drag-reject]': { outline: '2px dashed var(--fl-danger)' },
  '[data-slot="file-input-input"]': { display: 'none' },
  '[data-slot="resizable-box"]': {
    width: '16rem',
    height: '7rem',
    minWidth: '8rem',
    minHeight: '4rem',
    maxWidth: '100%',
    padding: '0.8rem',
    borderRadius: '10px',
    boxShadow: 'var(--elev-card)',
    resize: 'both',
    overflow: 'auto',
    color: 'var(--fl-muted)',
  },
  '[data-slot="message-scroller"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
    maxWidth: '26rem',
    maxHeight: '10rem',
    padding: '0.6rem',
    overflowY: 'auto',
    borderRadius: '10px',
    boxShadow: 'var(--elev-card)',
  },
  '[data-slot="message-scroller-item"]': { display: 'flex', flexDirection: 'column' },
  '[data-slot="message-scroller-item"] span': { color: 'var(--fl-muted)' },
  '[data-slot="virtual-list"]': {
    width: '100%',
    maxWidth: '20rem',
    overflowY: 'auto',
    borderRadius: '10px',
    boxShadow: 'var(--elev-card)',
  },
  '[data-slot="virtual-list-row"]': {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '0 0.8rem',
    borderBottom: '1px solid var(--fl-border)',
  },
  '[data-slot="sortable"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    margin: 0,
    padding: 0,
    width: '14rem',
    listStyle: 'none',
  },
  '[data-slot="sortable-item"]': {
    padding: '0.55rem 0.8rem',
    borderRadius: '8px',
    background: 'var(--fl-surface)',
    boxShadow: 'var(--elev-card)',
    cursor: 'grab',
  },
  '[data-slot="questionnaire"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxWidth: '24rem',
  },
  '[data-slot="questionnaire-progress"]': {
    margin: 0,
    fontFamily: 'var(--mono)',
    fontSize: '0.75rem',
    color: 'var(--fl-muted)',
  },
  '[data-slot="questionnaire"] h3, [data-slot="questionnaire"] p': { margin: 0 },
  '[data-slot="questionnaire-actions"]': { display: 'flex', gap: '0.5rem' },
  '@keyframes fl-spin': { to: { rotate: '360deg' } },
  '@keyframes fl-shimmer': {
    from: { backgroundPosition: '200% 0' },
    to: { backgroundPosition: '-200% 0' },
  },
  '[data-slot="scroll-area"]': {
    position: 'relative',
    width: '16rem',
    height: '10rem',
    borderRadius: '10px',
    boxShadow: 'var(--elev-card)',
    overflow: 'hidden',
  },
  '[data-slot="scroll-area-viewport"]': {
    width: '100%',
    height: '100%',
    overflow: 'scroll',
    scrollbarWidth: 'none',
  },
  '[data-slot="scroll-area-content"]': { padding: '0.5rem 0.8rem' },
  '[data-slot="scroll-area-scrollbar"]': {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '0.5rem',
  },
  '[data-slot="scroll-area-thumb"]': { borderRadius: '999px', background: 'var(--well)' },
}

const svg = (body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`,
  )}")`
const copyIcon = svg(
  '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
)
const checkIcon = svg('<path d="M4 12.5l5 5L20 6.5"/>')
const chevronIcon = svg('<path d="M6 9l6 6 6-6"/>')

// Motion follows Emil Kowalski's rules: ease-out curves, short durations, nothing
// scales from zero, and every transition has a reduced-motion fallback.
const ease = 'cubic-bezier(0.23, 1, 0.32, 1)'
// Dialogs cover the page, so they ease in more gently than a small popup, and leave quicker.
const soft = 'cubic-bezier(0.25, 0.8, 0.3, 1)'
const hidden = '[data-closed], [data-starting-style], [data-ending-style]'
const popups = ['popover', 'menu', 'select', 'combobox', 'hover-card', 'tooltip', 'autocomplete']
const popupSel = (suffix = '') =>
  popups.map((p) => `[data-slot="${p}-content"]${suffix}`).join(', ')
const dialogs = ['dialog', 'alert-dialog']
const dialogSel = (suffix = '') =>
  dialogs.map((p) => `[data-slot="${p}-content"]${suffix}`).join(', ')
const backdropSel = (suffix = '') =>
  ['dialog', 'alert-dialog', 'drawer'].map((p) => `[data-slot="${p}-backdrop"]${suffix}`).join(', ')

// A tinted glass surface: the highlight, the ring and the glow all take the element's tone.
const glass = (tone: string) => ({
  '--tone': tone,
  background: 'color-mix(in oklab, var(--tone) 11%, oklch(1 0 0 / 0.55))',
  backdropFilter: 'blur(14px) saturate(1.5)',
  boxShadow: [
    'inset 0 1px 0 oklch(1 0 0 / 0.95)',
    'inset 0 0 0 1px color-mix(in oklab, var(--tone) 24%, transparent)',
  ].join(', '),
})

const polish = {
  // ── Glass: alerts, banners, toasts ──
  '[data-slot="banner"]': { ...glass('var(--info)'), border: 0 },
  '[data-slot="banner"][data-tone="neutral"]': glass('var(--muted-foreground)'),
  '[data-slot="banner"][data-tone="success"]': glass('var(--ok)'),
  '[data-slot="banner"][data-tone="warning"]': glass('var(--warn)'),
  '[data-slot="banner"][data-tone="error"]': glass('var(--danger)'),
  '[data-slot="alert"]': glass('var(--muted-foreground)'),
  '[data-slot="alert"][data-tone="error"]': {
    ...glass('var(--danger)'),
    color: 'var(--foreground)',
  },
  '[data-slot="alert"][data-tone="error"] [data-slot="alert-title"]': { color: 'var(--danger)' },
  '[data-slot="toast"]': {
    ...glass('var(--info)'),
    padding: '0.8rem 2.4rem 0.8rem 2.3rem',
    background: 'color-mix(in oklab, var(--tone) 10%, oklch(1 0 0 / 0.82))',
    transition: `opacity 220ms ${ease}, translate 220ms ${ease}`,
  },
  '[data-slot="toast"]::before': {
    content: '""',
    position: 'absolute',
    top: '1.05rem',
    left: '1rem',
    width: '0.55rem',
    height: '0.55rem',
    borderRadius: '50%',
    background: 'var(--tone)',
    boxShadow: '0 0 0 3px color-mix(in oklab, var(--tone) 22%, transparent)',
  },
  '[data-slot="toast"][data-type="success"]': { '--tone': 'var(--ok)', borderLeft: 0 },
  '[data-slot="toast"][data-type="error"]': { '--tone': 'var(--danger)', borderLeft: 0 },
  '[data-slot="toast"][data-starting-style], [data-slot="toast"][data-ending-style]': {
    opacity: 0,
    translate: '0 0.6rem',
  },

  // ── Panels: accordion and collapsible ──
  // The panel stays mounted (see `keepMounted`), so ui-sdk's own exit runs: it holds the
  // measured height in a variable and sets the ending style until the transition is done.
  '[data-slot="accordion-panel"], [data-slot="collapsible-panel"]': {
    padding: 0,
    marginTop: 0,
    border: 0,
    background: 'transparent',
    overflow: 'hidden',
    transition: `height 260ms ${ease}, opacity 200ms ${ease}`,
  },
  '[data-slot="accordion-panel"]': { height: 'var(--accordion-panel-height)' },
  '[data-slot="collapsible-panel"]': { height: 'var(--collapsible-panel-height)' },
  '[data-slot="accordion-panel"]:is([data-starting-style], [data-ending-style]), [data-slot="collapsible-panel"]:is([data-starting-style], [data-ending-style])':
    { height: 0, opacity: 0 },
  '[data-slot="accordion-panel"][data-closed]:not([data-ending-style]), [data-slot="collapsible-panel"][data-closed]:not([data-ending-style])':
    { visibility: 'hidden' },
  '[data-slot="accordion-panel"] > *': { padding: '0 1rem 0.9rem' },
  '[data-slot="collapsible-panel"] > *': {
    margin: '0.6rem 0 0',
    padding: '0.8rem 1rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="accordion-trigger"]': { gap: '1rem', transition: `background 150ms, color 150ms` },
  [hit('[data-slot="accordion-trigger"]:hover')]: {
    background: 'var(--muted)',
    filter: 'none',
  },
  '[data-slot="accordion-trigger"]:active:not(:disabled)': { transform: 'none' },
  '[data-slot="accordion-trigger"]::after': {
    content: '""',
    width: '1rem',
    height: '1rem',
    flex: 'none',
    background: 'var(--muted-foreground)',
    mask: `${chevronIcon} center / contain no-repeat`,
    transition: `rotate 240ms ${ease}`,
  },
  '[data-slot="accordion-trigger"][aria-expanded="true"]::after': {
    content: '""',
    rotate: '180deg',
  },

  // ── Popups: a short fade with a small scale, from the anchor ──
  [popupSel()]: {
    transformOrigin: 'var(--transform-origin, top center)',
    transition: `opacity 150ms ${ease}, scale 150ms ${ease}`,
  },
  [hidden
    .split(', ')
    .map((c) => popupSel(c))
    .join(', ')]: { opacity: 0, scale: 0.96 },
  [popupSel('[data-side="top"]')]: { transformOrigin: 'bottom center' },

  // ── Dialogs and drawers ──
  [dialogSel()]: {
    transformOrigin: 'center',
    transition: `opacity 280ms ${soft}, scale 280ms ${soft}`,
  },
  [hidden
    .split(', ')
    .map((c) => dialogSel(c))
    .join(', ')]: {
    opacity: 0,
    scale: 0.95,
    transition: `opacity 160ms ease-in, scale 160ms ease-in`,
  },
  [backdropSel()]: {
    backdropFilter: 'blur(3px)',
    transition: `opacity 280ms ${soft}`,
  },
  [hidden
    .split(', ')
    .map((c) => backdropSel(c))
    .join(', ')]: { opacity: 0, transition: 'opacity 160ms ease-in' },
  '[data-slot="drawer-content"]': { transition: `opacity 240ms ${ease}, translate 240ms ${ease}` },
  '[data-slot="drawer-content"][data-closed], [data-slot="drawer-content"][data-starting-style], [data-slot="drawer-content"][data-ending-style]':
    { opacity: 1, translate: '100% 0' },

  // ── Button group: one raised bar, divided by hairlines ──
  '[data-slot="button-group"]': {
    borderRadius: 'var(--fl-radius)',
    boxShadow: 'var(--elev-raised)',
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    overflow: 'hidden',
  },
  '[data-slot="button-group"] > [data-slot="button"]': {
    background: 'transparent',
    boxShadow: 'none',
    marginInlineStart: 0,
  },
  '[data-slot="button-group"] > [data-slot="button"] + [data-slot="button"]': {
    boxShadow: 'inset 1px 0 0 var(--hairline)',
    marginInlineStart: 0,
  },
  [hit('[data-slot="button-group"] > [data-slot="button"]:hover')]: {
    background: 'var(--accent)',
    filter: 'none',
  },
  '[data-slot="button-group"] > [data-slot="button"]:active:not(:disabled)': { transform: 'none' },
  '[data-slot="button-group"] > [data-slot="button"][data-variant="primary"]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 0.18)',
    color: 'var(--primary-foreground)',
  },
  [hit('[data-slot="button-group"] > [data-slot="button"][data-variant="primary"]:hover')]: {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    filter: 'brightness(1.1)',
  },
  '[data-slot="button-group"] > [data-slot="button"][data-variant="primary"] + [data-slot="button"]':
    { boxShadow: 'none' },

  // ── Gauges: ui-sdk renders the track and the indicator as parts ──
  '[data-slot="progress"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    height: 'auto',
    background: 'transparent',
    boxShadow: 'none',
    overflow: 'visible',
  },
  // The meter puts its label and value on one row above the track.
  '[data-slot="meter"]': {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: '0.35rem 0.5rem',
    height: 'auto',
    background: 'transparent',
    boxShadow: 'none',
    overflow: 'visible',
  },
  '[data-slot="progress-track"]': {
    height: '8px',
    borderRadius: '999px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    overflow: 'hidden',
  },
  '[data-slot="progress-indicator"]': {
    height: '100%',
    borderRadius: '999px',
    background: 'var(--primary)',
    transition: `width 300ms ${ease}`,
  },
  '[data-slot="avatar"]': { overflow: 'hidden', background: 'var(--raised-top)' },
  '[data-slot="avatar-fallback"]': { display: 'inline-flex' },

  // ── Pagination ──
  '[data-slot="pagination-list"]': {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  '[data-slot="pagination-item"]': { display: 'inline-flex' },
  '[data-slot="pagination-link"], [data-slot="pagination-previous"], [data-slot="pagination-next"], [data-slot="pagination-first"], [data-slot="pagination-last"]':
    { minWidth: '2rem', padding: '0.4rem 0.6rem' },
  '[data-slot="pagination-link"][data-current], [data-slot="pagination-link"][aria-current="page"]':
    {
      background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
      boxShadow: 'var(--elev-primary)',
      color: 'var(--primary-foreground)',
    },
  '[data-slot="pagination-ellipsis"]': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '2rem',
    height: '2rem',
    padding: '0 0.4rem',
    color: 'var(--muted-foreground)',
  },

  // ── Attachment ──
  '[data-slot="attachment"] > div': { flex: 1, minWidth: 0 },
  '[data-slot="attachment-icon"]': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none',
    width: '2.1rem',
    height: '2.1rem',
    borderRadius: '8px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    color: 'var(--muted-foreground)',
    fontSize: '1.05rem',
  },

  // ── Fieldset: the legend is the first line of the card ──
  '[data-slot="fieldset"]': { display: 'block' },
  '[data-slot="fieldset"] > legend': {
    float: 'left',
    width: '100%',
    padding: 0,
    margin: '0 0 0.7rem',
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="fieldset"] > :not(legend)': { clear: 'both', display: 'block' },
  '[data-slot="fieldset"] > :not(legend) + :not(legend)': { marginTop: '0.6rem' },

  // ── Copy: an icon in the corner ──
  '[data-slot="copy-button"]': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none',
    width: '1.7rem',
    height: '1.7rem',
    padding: 0,
    background: 'transparent',
    boxShadow: 'none',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="copy-button"]::before': {
    content: '""',
    width: '0.9rem',
    height: '0.9rem',
    background: 'currentColor',
    mask: `${copyIcon} center / contain no-repeat`,
  },
  '[data-slot="copy-button"][data-copied]': { color: 'var(--ok)' },
  '[data-slot="copy-button"][data-copied]::before': {
    mask: `${checkIcon} center / contain no-repeat`,
  },
  [hit('[data-slot="copy-button"]:hover')]: {
    background: 'var(--accent)',
    color: 'var(--foreground)',
    filter: 'none',
  },
  '[data-slot="copy-text"]': { padding: '0.35rem 0.35rem 0.35rem 0.85rem' },
  '[data-slot="copy-text"][data-inline]': { padding: '0.1rem 0.1rem 0.1rem 0.5rem' },
  '[data-slot="code-block"]': {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'var(--fl-radius)',
    background: 'oklch(0.215 0.0018 260)',
    boxShadow: 'var(--elev-card)',
  },
  '[data-slot="code-header"]': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.3rem 0.4rem 0.3rem 1rem',
    borderBottom: '1px solid oklch(1 0 0 / 0.08)',
    color: 'oklch(0.7 0.01 260)',
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  '[data-slot="code-header"] [data-slot="copy-button"]': { color: 'oklch(0.75 0.01 260)' },
  [hit('[data-slot="code-header"] [data-slot="copy-button"]:hover')]: {
    background: 'oklch(1 0 0 / 0.1)',
    color: 'oklch(0.98 0 0)',
  },
  '[data-slot="code-header"] [data-slot="copy-button"][data-copied]': {
    color: 'oklch(0.8 0.15 155)',
  },
  '[data-slot="code-block"] > [data-slot="code"]': { borderRadius: 0 },

  // ── Drag and drop: the gap shows where the item will land ──
  '[data-slot="sortable-item"]': { transition: 'background 150ms, box-shadow 150ms' },
  '[data-slot="sortable-item"][data-moving]': {
    opacity: 1,
    cursor: 'grabbing',
    color: 'transparent',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    outline: '1.5px dashed color-mix(in oklab, var(--foreground) 30%, transparent)',
    outlineOffset: '-1.5px',
  },

  // ── Menubar ──
  '[data-slot="menubar"] [data-slot="menu-trigger"]': {
    background: 'transparent',
    boxShadow: 'none',
    padding: '0.3rem 0.7rem',
  },
  [hit('[data-slot="menubar"] [data-slot="menu-trigger"]:hover')]: {
    background: 'var(--accent)',
    filter: 'none',
  },
  '[data-slot="menubar"] [data-slot="menu-trigger"][aria-expanded="true"]': {
    background: 'var(--accent)',
  },
  '[data-slot="menubar"] [data-slot="menu-trigger"]:active:not(:disabled)': { transform: 'none' },

  // ── Segmented control: a sunk track with a raised pill under the chosen item ──
  '[data-slot="segmented-control"]': {
    position: 'relative',
    display: 'inline-flex',
    gap: '2px',
    width: 'fit-content',
    padding: '3px',
    borderRadius: '10px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
  },
  '[data-slot="segmented-control-indicator"]': {
    position: 'absolute',
    zIndex: 0,
    top: 'var(--segmented-control-indicator-top)',
    left: 'var(--segmented-control-indicator-left)',
    width: 'var(--segmented-control-indicator-width)',
    height: 'var(--segmented-control-indicator-height)',
    borderRadius: '7px',
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    pointerEvents: 'none',
    transition: `left 220ms ${ease}, top 220ms ${ease}, width 220ms ${ease}, height 220ms ${ease}`,
  },
  '[data-slot="segmented-control-item"]': {
    position: 'relative',
    zIndex: 1,
    padding: '0.35rem 0.85rem',
    border: 0,
    borderRadius: '7px',
    background: 'transparent',
    boxShadow: 'none',
    color: 'var(--muted-foreground)',
    fontWeight: 500,
    transition: 'color 150ms',
  },
  [hit('[data-slot="segmented-control-item"]:hover')]: {
    background: 'transparent',
    color: 'var(--foreground)',
    filter: 'none',
  },
  '[data-slot="segmented-control-item"][data-checked]': {
    background: 'transparent',
    color: 'var(--foreground)',
  },
  '[data-slot="segmented-control-item"][data-disabled]': { opacity: 0.5, cursor: 'not-allowed' },
  '[data-slot="segmented-control-input"]': { display: 'none' },

  '@media (prefers-reduced-motion: reduce)': {
    '[data-slot] ': { transitionDuration: '1ms !important' },
  },
}

const merge = (a: Rules, b: Rules): Rules => {
  const out: Rules = { ...a }
  for (const [selector, rule] of Object.entries(b)) out[selector] = { ...out[selector], ...rule }
  return out
}

export const tools = definePreset({
  name: 'tools',
  globalCss: merge(
    merge(merge(merge(merge(base, depth), kit), polish), listStyles),
    merge(merge(formsStyles, leafStyles), reviewStyles),
  ) as never,
})
