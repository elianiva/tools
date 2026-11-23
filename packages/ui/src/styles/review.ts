import type { Rules } from './rules.ts'

const ease = 'cubic-bezier(0.23, 1, 0.32, 1)'
const trigger = 'button[aria-haspopup]'
const choiceSlots = ['checkbox', 'radio', 'switch']
const choices = choiceSlots.map((n) => `[data-slot="${n}"]`).join(', ')
const onChoice = (suffix: string) =>
  choiceSlots.map((n) => `[data-slot="${n}"]${suffix}`).join(', ')
const live = ':not([disabled]):not([aria-disabled="true"])'
const popupList = [
  'popover',
  'menu',
  'select',
  'combobox',
  'autocomplete',
  'tooltip',
  'hover-card',
  'navigation-menu',
]
const popups = popupList.map((n) => `[data-slot="${n}-content"]`).join(', ')
const popupsStart = popupList
  .map((n) => `[data-slot="${n}-content"][data-starting-style]`)
  .join(', ')
const popupsEnd = popupList
  .map(
    (n) => `[data-slot="${n}-content"][data-ending-style], [data-slot="${n}-content"][data-closed]`,
  )
  .join(', ')
const pressed = '[data-slot="toggle-group"] [data-slot="toggle"]'

/** Fixes from review: dropdown triggers, toasts that stack, grouped controls, handles, segments. */
export const reviewStyles: Rules = {
  // A trigger that opens a popup has no press-down; while open it keeps its face and gains a ring.
  [`${trigger}:active:not(:disabled)`]: { transform: 'none', filter: 'brightness(0.97)' },
  [`${trigger}[aria-expanded="true"]`]: {
    filter: 'none',
    boxShadow: 'var(--elev-raised), 0 0 0 3px color-mix(in oklab, var(--ring) 35%, transparent)',
  },
  // Checkbox, radio and switch: hover adds a soft halo and nothing else, so no gradient swap.
  [onChoice(`:not([data-checked]):hover${live}`)]: {
    filter: 'none',
    boxShadow: 'var(--elev-well), 0 0 0 4px color-mix(in oklab, var(--foreground) 7%, transparent)',
  },
  [onChoice(`[data-checked]:hover${live}`)]: {
    filter: 'none',
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow:
      'var(--elev-primary), 0 0 0 4px color-mix(in oklab, var(--primary) 18%, transparent)',
  },
  [onChoice(':active:not([disabled])')]: { transform: 'none' },
  [choices]: {
    transition: `background 150ms, box-shadow 200ms ${ease}`,
  },
  '[data-slot="radio-group"], [data-slot="checkbox-group"]': {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.6rem 1.2rem',
  },
  'label > input[type="checkbox"], label > input[type="radio"]': {
    width: '1.1rem',
    height: '1.1rem',
    padding: 0,
    flex: 'none',
    accentColor: 'var(--primary)',
  },

  // Fieldset: the legend is the first line of the card, as a mono caption.
  '[data-slot="field-set"]': {
    border: 0,
    padding: '1rem',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-card)',
    display: 'block',
    width: '100%',
  },
  '[data-slot="field-legend"]': {
    padding: 0,
    marginBottom: '0.2rem',
    fontFamily: 'var(--mono)',
    fontSize: '0.68rem',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="field-set"] > legend': {
    float: 'left',
    width: '100%',
    marginBottom: '0.75rem',
  },
  '[data-slot="field-set"] > legend + *': { clear: 'both' },
  '[data-slot="field-set"] > :not(legend) + *': { marginTop: '0.6rem' },

  // Menubar: a quiet bar of text triggers.
  '[data-slot="menubar"]': {
    gap: '2px',
    padding: '0.2rem',
    borderRadius: '10px',
    background: 'var(--card)',
    boxShadow: 'var(--elev-raised)',
  },
  '[data-slot="menubar"] [data-slot="menu-trigger"]': {
    padding: '0.3rem 0.7rem',
    borderRadius: '7px',
    boxShadow: 'none',
    background: 'transparent',
    fontWeight: 500,
  },
  '[data-slot="menubar"] [data-slot="menu-trigger"][aria-expanded="true"]': {
    background: 'var(--accent)',
    boxShadow: 'none',
  },

  // Toggle group: a sunk track with a raised pill under the pressed item.
  '[data-slot="toggle-group"]': {
    gap: '2px',
    padding: '3px',
    borderRadius: '10px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    overflow: 'visible',
  },
  [pressed]: {
    minWidth: 0,
    padding: '0.3rem 0.8rem',
    borderRadius: '7px',
    border: 0,
    background: 'transparent',
    boxShadow: 'none',
    color: 'var(--muted-foreground)',
    transition: `background 150ms ${ease}, color 150ms, box-shadow 150ms`,
  },
  [`${pressed}[aria-pressed="true"], ${pressed}[data-pressed]`]: {
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    color: 'var(--foreground)',
  },

  // Number and password inputs: one well, ghost buttons inside it.
  '[data-slot="number-input-group"], [data-slot="password-input"]': {
    alignItems: 'center',
    borderRadius: 'var(--fl-radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
  },
  '[data-slot="number-input-group"]:has([data-slot$="-control"]:focus), [data-slot="password-input"]:has([data-slot$="-control"]:focus)':
    {
      boxShadow: 'var(--elev-well), 0 0 0 3px color-mix(in oklab, var(--ring) 45%, transparent)',
    },
  '[data-slot="number-input-control"], [data-slot="password-input-control"]': {
    background: 'transparent',
    boxShadow: 'none',
    border: 0,
    outline: 0,
    borderRadius: 0,
  },
  '[data-slot="number-input-control"]': { textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
  '[data-slot="number-input-increment"], [data-slot="number-input-decrement"], [data-slot="password-input-toggle"]':
    {
      background: 'transparent',
      boxShadow: 'none',
      border: 0,
      outline: 0,
      borderRadius: '7px',
      margin: '3px',
      padding: '0.25rem 0.6rem',
      color: 'var(--muted-foreground)',
    },
  [`[data-slot="number-input-increment"]:hover, [data-slot="number-input-decrement"]:hover, [data-slot="password-input-toggle"]:hover`]:
    { background: 'var(--accent)', color: 'var(--foreground)', filter: 'none' },
  [`[data-slot="number-input-increment"]:active, [data-slot="number-input-decrement"]:active, [data-slot="password-input-toggle"]:active`]:
    {
      transform: 'none',
      background: 'color-mix(in oklab, var(--foreground) 12%, transparent)',
    },

  // Resizable: a hairline that thickens into a grip while hovered or dragged.
  '[data-slot="resizable"]': { gap: 0, boxShadow: 'none', overflow: 'visible' },
  '[data-slot="resizable-panel"]': {
    borderRadius: 'var(--fl-radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-raised)',
  },
  '[data-slot="resizable-handle"]': {
    position: 'relative',
    flex: '0 0 16px',
    minWidth: '16px',
    background: 'transparent',
    outline: 0,
  },
  '[data-slot="resizable-handle"]::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: '1px',
    translate: '-50% 0',
    background: 'var(--hairline)',
    transition: `background 150ms, width 150ms`,
  },
  '[data-slot="resizable-handle"]::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '8px',
    height: '1.4rem',
    translate: '-50% -50%',
    borderRadius: '4px',
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    transition: `scale 160ms ${ease}`,
  },
  '[data-slot="resizable-handle"]:hover::before, [data-slot="resizable-handle"][data-dragging]::before, [data-slot="resizable-handle"]:focus-visible::before':
    { background: 'var(--primary)', width: '2px' },
  '[data-slot="resizable-handle"]:hover::after, [data-slot="resizable-handle"][data-dragging]::after':
    { scale: '1.1' },

  // Segmented inputs: each segment is a small well that lights when focused.
  '[data-slot="time-input"], [data-slot="date-input"]': {
    maxWidth: '100%',
    gap: '0.15rem',
    padding: '0.3rem 0.5rem',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    border: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  '[data-slot="time-input"]:focus-within, [data-slot="date-input"]:focus-within': {
    boxShadow: 'var(--elev-well), 0 0 0 3px color-mix(in oklab, var(--ring) 45%, transparent)',
  },
  'input[data-slot="time-input-segment"], input[data-slot="date-input-segment"]': {
    width: '2.1ch',
    padding: '0.15rem 0.3rem',
    boxSizing: 'content-box',
    textAlign: 'center',
    borderRadius: '5px',
    background: 'transparent',
    boxShadow: 'none',
    outline: 0,
    caretColor: 'transparent',
  },
  'input[data-slot="time-input-segment"]:focus, input[data-slot="date-input-segment"]:focus': {
    background: 'var(--primary)',
    color: 'var(--primary-foreground)',
  },
  'input[data-slot="time-input-segment"][data-type="dayPeriod"]': { width: '2.6ch' },
  'input[data-slot="date-input-segment"][data-type="year"]': { width: '4.2ch' },
  'span[data-slot="time-input-segment"], span[data-slot="date-input-segment"]': {
    color: 'var(--muted-foreground)',
    padding: 0,
  },

  // Toast: stacked like ui-sdk's own. Hidden behind the front one until the region is hovered.
  '[data-slot="toast-region"]': {
    '--dir': -1,
    height: 'var(--toast-front-height)',
    outline: 0,
  },
  '[data-slot="toast-region"][data-expanded]': {
    height: 'calc(var(--toast-stack-height) + (var(--toast-count) - 1) * 0.6rem)',
  },
  '[data-slot="toast-list"]': { display: 'contents' },
  '[data-slot="toast"]': {
    '--y': 'calc(var(--dir) * var(--toast-index) * 0.6rem)',
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 'calc(100 - var(--toast-index))',
    '--behind': 'min(var(--toast-index), 1)',
    height:
      'calc(var(--toast-height) + (var(--toast-front-height) - var(--toast-height)) * var(--behind))',
    overflow: 'hidden',
    background: 'color-mix(in oklab, var(--tone) 10%, oklch(0.99 0 0))',
    backdropFilter: 'none',
    translate:
      'var(--toast-swipe-x, 0px) calc(var(--y) + var(--toast-swipe-y, 0px) + var(--exit-y, 0px))',
    scale: 'calc(1 - var(--toast-index) * 0.05)',
    opacity: 1,
    transition: 'translate 400ms ease, scale 400ms ease, opacity 400ms ease, height 400ms ease',
    userSelect: 'none',
  },
  '[data-slot="toast"]::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'inherit',
    opacity: 'var(--behind)',
    pointerEvents: 'none',
    transition: 'opacity 400ms ease',
  },
  '[data-slot="toast"][data-expanded]': {
    '--y': 'calc(var(--dir) * (var(--toast-offset) + var(--toast-index) * 0.6rem))',
    scale: 1,
    '--behind': 0,
    height: 'var(--toast-height)',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-out',
  },
  '[data-slot="toast"][data-starting-style]': {
    transition: 'none',
    opacity: 0,
    '--y': 'calc(var(--dir) * -100% * (1 - var(--behind)))',
  },
  '[data-slot="toast"][data-ending-style]': {
    opacity: 0,
    '--exit-y': 'calc(var(--dir) * -100% * (1 - var(--behind)))',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-out',
  },
  '[data-slot="toast"][data-swiping]': { transition: 'none' },
  '@media (prefers-reduced-motion: reduce)': {
    '[data-slot="toast"]': { transitionProperty: 'opacity' },
  },

  // Navigation menu: quiet text items; the indicator slides under the hovered or open one.
  '[data-slot="navigation-menu-list"]': {
    gap: '0.15rem',
    padding: 0,
    boxShadow: 'none',
    background: 'transparent',
  },
  '[data-slot="navigation-menu-trigger"], [data-slot="navigation-menu-link"]': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '8px',
    border: 0,
    background: 'transparent',
    boxShadow: 'none',
    color: 'var(--muted-foreground)',
    fontSize: '13px',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: `color 150ms, background 150ms`,
  },
  '[data-slot="navigation-menu-trigger"]:hover, [data-slot="navigation-menu-link"]:hover, [data-slot="navigation-menu-trigger"][aria-expanded="true"]':
    {
      background: 'var(--accent)',
      color: 'var(--foreground)',
      filter: 'none',
      boxShadow: 'none',
    },
  '[data-slot="navigation-menu-trigger"]::after': {
    content: '""',
    width: '0.4rem',
    height: '0.4rem',
    borderRight: '1.5px solid currentColor',
    borderBottom: '1.5px solid currentColor',
    rotate: '45deg',
    translate: '0 -2px',
    transition: `rotate 200ms ${ease}`,
  },
  '[data-slot="navigation-menu-trigger"][aria-expanded="true"]::after': { rotate: '225deg' },
  '[data-slot="navigation-menu-indicator"]': { display: 'none' },

  // Native select: room for the text and a drawn chevron.
  select: {
    appearance: 'none',
    padding: '0.5rem 2.1rem 0.5rem 0.8rem',
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%238a919e' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.7rem center',
    cursor: 'pointer',
  },

  // Select trigger: a well like the inputs, with a drawn chevron.
  '[data-slot="select"]': { display: 'block', width: '100%' },
  '[data-slot="select-trigger"]': {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    padding: '0.5rem 0.8rem',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    fontWeight: 400,
    color: 'var(--foreground)',
    textAlign: 'left',
  },
  '[data-slot="select-trigger"]::after': {
    content: '""',
    flex: 'none',
    marginLeft: 'auto',
    width: '0.45rem',
    height: '0.45rem',
    borderRight: '1.5px solid var(--muted-foreground)',
    borderBottom: '1.5px solid var(--muted-foreground)',
    rotate: '45deg',
    translate: '0 -2px',
    transition: `rotate 200ms ${ease}`,
  },
  '[data-slot="select-trigger"][aria-expanded="true"]::after': { rotate: '225deg' },
  '[data-slot="select-trigger"][aria-expanded="true"]': {
    background: 'var(--well)',
    boxShadow: 'var(--elev-well), 0 0 0 3px color-mix(in oklab, var(--ring) 35%, transparent)',
  },
  '[data-slot="select-trigger"]:hover:not([disabled])': {
    background: 'var(--well)',
    filter: 'brightness(0.98)',
  },

  // Tabs: a sunk track with a raised pill that slides to the selected tab.
  '[data-slot="tabs-list"]': {
    display: 'inline-flex',
    position: 'relative',
    gap: '2px',
    padding: '3px',
    borderRadius: '10px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    borderBottom: 0,
  },
  '[data-slot="tabs-tab"]': {
    position: 'relative',
    zIndex: 1,
    padding: '0.35rem 0.85rem',
    border: 0,
    borderRadius: '7px',
    background: 'transparent',
    boxShadow: 'none',
    color: 'var(--muted-foreground)',
    transition: 'color 150ms',
  },
  '[data-slot="tabs-tab"]:hover:not([data-selected])': {
    background: 'transparent',
    color: 'var(--foreground)',
    filter: 'none',
  },
  '[data-slot="tabs-tab"][data-selected]': {
    color: 'var(--foreground)',
    borderBottomColor: 'transparent',
    background: 'transparent',
  },
  '[data-slot="tabs-indicator"]': {
    position: 'absolute',
    top: 'var(--active-tab-top)',
    left: 'var(--active-tab-left)',
    width: 'var(--active-tab-width)',
    height: 'var(--active-tab-height)',
    zIndex: 0,
    border: 0,
    pointerEvents: 'none',
    borderRadius: '7px',
    background: 'linear-gradient(var(--raised-top), var(--raised-bottom))',
    boxShadow: 'var(--elev-raised)',
    transitionProperty: 'top, left, width, height',
    transitionDuration: '320ms',
    transitionTimingFunction: ease,
  },
  '[data-slot="tabs-panel"][data-starting-style]': { opacity: 0, translate: '0 4px' },
  '[data-slot="tabs-panel"]': {
    transition: `opacity 220ms ease, translate 260ms ${ease}`,
    '@starting-style': { opacity: 0, translate: '0 4px' },
  },

  // Popups: grow from the trigger with a short fade; leave faster than they arrive.
  [popups]: {
    transformOrigin: 'var(--transform-origin, center)',
    transition: `opacity 160ms ease, scale 200ms ${ease}`,
    scale: 1,
  },
  [popupsStart]: { opacity: 0, scale: '0.96' },
  [popupsEnd]: { opacity: 0, scale: '0.98', transitionDuration: '110ms' },
}
