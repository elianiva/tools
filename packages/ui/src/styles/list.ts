import type { Rules } from './rules.ts'

const lists = ['select', 'combobox', 'autocomplete', 'command', 'listbox']
const popups = ['popover', 'tooltip', 'hover-card']
const each = (names: ReadonlyArray<string>, part: string, suffix = '') =>
  names.map((name) => `[data-slot="${name}-${part}"]${suffix}`).join(', ')

/** Styles for the list family of components. Merged into the preset last. */
export const listStyles: Rules = {
  [each(lists, 'group-label')]: {
    padding: '0.4rem 0.65rem 0.2rem',
    color: 'var(--fl-muted)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  [each([...lists, 'menu'], 'separator')]: {
    height: '1px',
    margin: '0.3rem 0',
    background: 'var(--fl-border)',
  },
  [each(lists, 'group', '[hidden]')]: { display: 'none' },
  [each(['combobox', 'autocomplete'], 'header')]: {
    padding: '0.4rem 0.65rem',
    color: 'var(--fl-muted)',
    fontSize: '0.8rem',
  },
  [each(['select', 'combobox', 'autocomplete', 'command'], 'status')]: {
    padding: '0.3rem 0.65rem',
    color: 'var(--fl-muted)',
    fontSize: '0.8rem',
  },
  [each(['select'], 'empty')]: { padding: '0.4rem 0.6rem', color: 'var(--fl-muted)' },
  [each(['select', 'combobox', 'autocomplete', 'menu', 'popover'], 'viewport')]: {
    maxHeight: '14rem',
    overflowY: 'auto',
  },
  '[data-slot="select-label"]': { fontSize: '0.85rem', fontWeight: 600 },
  '[data-slot="select-value"]': { overflow: 'hidden', textOverflow: 'ellipsis' },
  '[data-slot="select-value"][data-placeholder]': { color: 'var(--fl-muted)' },
  '[data-slot="select-input"]': {
    width: '100%',
    padding: '0.4rem 0.6rem',
    border: '1px solid var(--fl-border)',
    borderRadius: '6px',
    font: 'inherit',
  },
  [each(['select', 'combobox', 'autocomplete'], 'clear')]: {
    border: 0,
    background: 'transparent',
    color: 'var(--fl-muted)',
    cursor: 'pointer',
    padding: '0 0.4rem',
  },
  [each(['select', 'combobox', 'autocomplete'], 'arrow')]: {
    display: 'inline-block',
    marginLeft: '0.4rem',
    color: 'var(--fl-muted)',
    pointerEvents: 'none',
  },
  [each(['select', 'combobox', 'autocomplete'], 'arrow', '::before')]: { content: '"\\25BE"' },
  [each(['select', 'combobox', 'autocomplete'], 'arrow', '[data-open]')]: {
    transform: 'rotate(180deg)',
  },
  [each(['command', 'menu', 'popover', 'tooltip', 'dialog'], 'shortcut')]: {
    marginLeft: 'auto',
    paddingLeft: '1rem',
    color: 'var(--fl-muted)',
    fontFamily: 'ui-monospace, monospace',
    fontSize: '0.75rem',
  },
  [each(['menu', 'command'], 'item')]: { display: 'flex', alignItems: 'center' },
  '[data-slot="command-page"]': { padding: '0.25rem' },
  [each(popups, 'arrow')]: {
    width: '10px',
    height: '10px',
    background: 'var(--fl-surface)',
    border: '1px solid var(--fl-border)',
    borderWidth: '0 1px 1px 0',
    transform: 'rotate(45deg)',
    position: 'absolute',
  },
  [each(popups, 'arrow', '[data-side="bottom"]')]: {
    top: '-6px',
    transform: 'rotate(-135deg)',
  },
  [each(popups, 'arrow', '[data-side="top"]')]: { bottom: '-6px' },
  [each(popups, 'arrow', '[data-side="left"]')]: { right: '-6px', transform: 'rotate(-45deg)' },
  [each(popups, 'arrow', '[data-side="right"]')]: { left: '-6px', transform: 'rotate(135deg)' },
  '[data-slot="tabs-indicator"][data-activation-direction="none"]': { transition: 'none' },
  '[data-slot="navigation-menu-viewport"]': {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 20,
    overflow: 'hidden',
    width: 'var(--viewport-width)',
    height: 'var(--viewport-height)',
    marginTop: '0.3rem',
    borderRadius: '10px',
    background: 'var(--fl-surface)',
    boxShadow: 'var(--elev-float)',
  },
}
