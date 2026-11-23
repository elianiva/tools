import type { Rules } from './rules.ts'

const field = {
  border: '1px solid var(--fl-border)',
  borderRadius: 'var(--fl-radius)',
  background: 'var(--fl-surface)',
  color: 'inherit',
  font: 'inherit',
}

/** Styles for the forms family of components. Merged into the preset last. */
export const formsStyles: Rules = {
  '[data-slot="textarea"]': {
    ...field,
    width: '100%',
    minHeight: '5rem',
    padding: '0.5rem 0.65rem',
    resize: 'vertical',
    fieldSizing: 'content',
  },
  '[data-slot="textarea"]:focus-visible': { outlineOffset: '0', borderColor: 'var(--fl-accent)' },

  '[data-slot="number-input"], [data-slot="password-input"]': { display: 'flex', width: '100%' },
  '[data-slot="number-input-group"]': { display: 'flex', width: '100%', alignItems: 'stretch' },
  '[data-slot="number-input-control"], [data-slot="password-input-control"]': {
    ...field,
    flex: 1,
    minWidth: 0,
    padding: '0.5rem 0.65rem',
  },
  '[data-slot="number-input-group"] > [data-slot="number-input-control"]': {
    textAlign: 'center',
    borderRadius: 0,
  },
  '[data-slot="number-input-increment"], [data-slot="number-input-decrement"], [data-slot="password-input-toggle"]':
    { ...field, padding: '0 0.8rem', cursor: 'pointer' },
  '[data-slot="number-input-decrement"]': { borderRadius: 'var(--fl-radius) 0 0 var(--fl-radius)' },
  '[data-slot="number-input-increment"]': { borderRadius: '0 var(--fl-radius) var(--fl-radius) 0' },
  '[data-slot="password-input-control"]': { borderRadius: 'var(--fl-radius) 0 0 var(--fl-radius)' },
  '[data-slot="password-input-toggle"]': { borderRadius: '0 var(--fl-radius) var(--fl-radius) 0' },
  '[data-slot="password-input-toggle"][aria-pressed="true"]': {
    background: 'var(--fl-accent-soft)',
  },

  '[data-slot="time-input"], [data-slot="date-input"]': {
    ...field,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.1rem',
    padding: '0.45rem 0.65rem',
  },
  '[data-slot="time-input"]:focus-within, [data-slot="date-input"]:focus-within': {
    borderColor: 'var(--fl-accent)',
  },
  '[data-slot="time-input-segment"], [data-slot="date-input-segment"]': {
    font: 'inherit',
    color: 'inherit',
    background: 'transparent',
    border: 0,
    padding: '0 0.1rem',
    width: 'auto',
    minWidth: '1.4ch',
    textAlign: 'center',
    fieldSizing: 'content',
  },
  '[data-slot="time-input-segment"]:focus, [data-slot="date-input-segment"]:focus': {
    outline: 'none',
    background: 'var(--fl-accent-soft)',
    borderRadius: '3px',
  },
  '[data-slot="time-input-segment"][data-empty], [data-slot="date-input-segment"][data-empty]': {
    color: 'var(--fl-muted)',
  },

  '[data-slot="token-input-editor"]': {
    ...field,
    width: '100%',
    minHeight: '2.6rem',
    padding: '0.5rem 0.65rem',
    whiteSpace: 'pre-wrap',
  },
  '[data-slot="token-input-editor"]:focus-visible': {
    outlineOffset: '0',
    borderColor: 'var(--fl-accent)',
  },
  '[data-slot="token-input-host"], [data-slot="token-input-token"]': {
    display: 'inline-block',
    padding: '0 0.4rem',
    borderRadius: '999px',
    background: 'var(--fl-accent-soft)',
  },

  '[data-slot="rating"]': { display: 'inline-flex', gap: '0.15rem' },
  '[data-slot="rating-item"]': {
    position: 'relative',
    display: 'inline-block',
    fontSize: '1.6rem',
    lineHeight: 1,
    color: 'var(--fl-border)',
    backgroundImage:
      'linear-gradient(90deg, var(--fl-accent) calc(var(--rating-fill, 0) * 100%), transparent 0)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
  },
  '[data-slot="rating-item"][data-filled]': { color: 'var(--fl-accent)' },
  '[data-slot="rating-radio"]': { cursor: 'pointer', width: '100%' },
  '[data-slot="rating-radio"]:focus-visible': {
    outline: '2px solid var(--fl-accent)',
    borderRadius: '4px',
  },

  '[data-slot="toggle-icon"]': { display: 'inline-flex', alignItems: 'center' },
  '[data-slot="toast-action"]': { cursor: 'pointer' },
  '[data-slot="slider-value"]': { fontVariantNumeric: 'tabular-nums' },
  '[data-slot="scroll-area-corner"]': { background: 'var(--fl-surface)' },
}
