import type { Rules } from './rules.ts'

const control = {
  width: '100%',
  padding: '0.45rem 0.7rem',
  border: '1px solid var(--fl-border)',
  borderRadius: 'var(--fl-radius)',
  background: 'var(--fl-surface)',
  color: 'inherit',
  font: 'inherit',
}

const floating = {
  zIndex: 5,
  padding: '0.6rem',
  border: 0,
  borderRadius: '12px',
  background: 'var(--card)',
  boxShadow: 'var(--elev-float)',
}

const row = { display: 'flex', alignItems: 'center', gap: '0.5rem' }

const rows = (selector: string) => ({
  [selector]: { ...row, justifyContent: 'space-between', paddingBottom: '0.4rem' },
})

/** Styles for the leaf family of components. Merged into the preset last. */
export const leafStyles: Rules = {
  // Date picker. Its calendar parts carry the `calendar-*` slots the preset already styles.
  '[data-slot="date-picker"]': { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  '[data-slot="date-picker-row"]': row,
  '[data-slot="date-picker-input"]': control,
  '[data-slot="date-picker-input"][data-invalid]': { borderColor: 'var(--fl-danger)' },
  '[data-slot="date-picker-hint"]': { color: 'var(--muted-foreground)', fontSize: '0.8rem' },
  '[data-slot="date-picker-content"]': { ...floating, width: '17.5rem' },
  ...rows('[data-slot="date-picker-header"]'),
  '[data-slot="date-picker-presets"]': { ...row, flexWrap: 'wrap', paddingBottom: '0.5rem' },
  '[data-slot="date-picker-preset"][data-selected]': { fontWeight: 700 },
  '[data-slot="date-picker-content"] [data-slot="calendar-grid"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  // Color picker
  '[data-slot="color-picker"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '16rem',
  },
  '[data-slot="color-picker-row"]': { ...row, gap: '0.75rem' },
  '[data-slot="color-picker-area"]': {
    height: '9rem',
    borderRadius: '8px',
    background: 'var(--color-area-background)',
    boxShadow: 'inset 0 0 0 1px var(--hairline)',
    cursor: 'crosshair',
  },
  '[data-slot="color-picker-slider"]': {
    flex: 1,
    height: '12px',
    borderRadius: '999px',
    background: 'var(--color-slider-background)',
    boxShadow: 'inset 0 0 0 1px var(--hairline)',
  },
  '[data-slot="color-picker-area-thumb"], [data-slot="color-picker-slider-thumb"]': {
    boxSizing: 'border-box',
    width: '16px',
    height: '16px',
    border: '2px solid #fff',
    borderRadius: '50%',
    boxShadow: '0 0 0 1px rgb(0 0 0 / 0.35)',
    background: 'var(--color-picker-color)',
  },
  '[data-slot="color-picker-slider-thumb"]': {
    position: 'absolute',
    top: '50%',
    left: 'var(--color-slider-thumb-position, 0%)',
    transform: 'translate(-50%, -50%)',
  },
  '[data-slot="color-picker-area-thumb"]': { transform: 'translate(-50%, -50%)' },
  '[data-slot="color-picker-swatch"]': {
    width: '2rem',
    height: '2rem',
    borderRadius: '8px',
    background: 'var(--color-picker-color)',
    boxShadow: 'inset 0 0 0 1px var(--hairline)',
  },
  '[data-slot="color-picker-input"]': { ...control, fontFamily: 'var(--mono)' },
  '[data-slot="color-picker-swatches"]': { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  '[data-slot="color-picker-swatch-item"]': {
    width: '1.6rem',
    height: '1.6rem',
    padding: 0,
    borderRadius: '50%',
    background: 'var(--color-picker-color)',
    boxShadow: 'inset 0 0 0 1px var(--hairline)',
  },
  '[data-slot="color-picker-swatch-item"][data-selected]': {
    outline: '2px solid var(--foreground)',
    outlineOffset: '2px',
  },

  // Image cropper
  '[data-slot="image-cropper"]': {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '26rem',
    maxWidth: '100%',
  },
  '[data-slot="image-cropper-controls"]': { ...row, flexWrap: 'wrap' },
  '[data-slot="image-cropper-viewport"]': {
    padding: '0.75rem',
    aspectRatio: 'var(--image-cropper-aspect-ratio, 4 / 3)',
    borderRadius: '8px',
    background: 'var(--surface-nested)',
    boxShadow: 'inset 0 0 0 1px var(--hairline)',
  },
  '[data-slot="image-cropper-selection"]': {
    border: '2px solid #fff',
    boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.45)',
  },
  '[data-slot="image-cropper-grid"]': {
    opacity: 0,
    backgroundImage:
      'linear-gradient(to right, transparent 33%, rgb(255 255 255 / 0.6) 33% calc(33% + 1px), transparent calc(33% + 1px) 66%, rgb(255 255 255 / 0.6) 66% calc(66% + 1px), transparent calc(66% + 1px)), linear-gradient(to bottom, transparent 33%, rgb(255 255 255 / 0.6) 33% calc(33% + 1px), transparent calc(33% + 1px) 66%, rgb(255 255 255 / 0.6) 66% calc(66% + 1px), transparent calc(66% + 1px))',
  },
  '[data-slot="image-cropper-grid"][data-dragging]': { opacity: 1 },
  '[data-slot="image-cropper-handle"]': {
    position: 'absolute',
    width: '12px',
    height: '12px',
    border: '1px solid rgb(0 0 0 / 0.4)',
    borderRadius: '3px',
    background: '#fff',
  },
  '[data-slot="image-cropper-handle"][data-position="n"]': {
    top: 0,
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  '[data-slot="image-cropper-handle"][data-position="s"]': {
    bottom: 0,
    left: '50%',
    transform: 'translate(-50%, 50%)',
  },
  '[data-slot="image-cropper-handle"][data-position="e"]': {
    right: 0,
    top: '50%',
    transform: 'translate(50%, -50%)',
  },
  '[data-slot="image-cropper-handle"][data-position="w"]': {
    left: 0,
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  '[data-slot="image-cropper-handle"][data-position="ne"]': {
    top: 0,
    right: 0,
    transform: 'translate(50%, -50%)',
  },
  '[data-slot="image-cropper-handle"][data-position="nw"]': {
    top: 0,
    left: 0,
    transform: 'translate(-50%, -50%)',
  },
  '[data-slot="image-cropper-handle"][data-position="se"]': {
    bottom: 0,
    right: 0,
    transform: 'translate(50%, 50%)',
  },
  '[data-slot="image-cropper-handle"][data-position="sw"]': {
    bottom: 0,
    left: 0,
    transform: 'translate(-50%, 50%)',
  },
  '[data-slot="image-cropper-zoom"]': { flex: 1, minWidth: '8rem' },

  // Tree
  '[data-slot="tree"], [data-slot="tree-group"]': { listStyle: 'none', margin: 0, padding: 0 },
  '[data-slot="tree"]': { width: '20rem', fontSize: '0.9rem' },
  '[data-slot="tree-item"]': { outline: 'none' },
  '[data-slot="tree-label"]': {
    ...row,
    gap: '0.4rem',
    padding: '0.3rem 0.5rem',
    paddingLeft: 'calc(0.5rem + (var(--tree-level, 1) - 1) * 2rem)',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  // A leaf has no indicator, so it reserves that column to keep labels aligned.
  '[data-slot="tree-label"]:not([data-branch])': {
    paddingLeft: 'calc(1.9rem + (var(--tree-level, 1) - 1) * 2rem)',
  },
  '[data-slot="tree-label"]:hover, [data-slot="tree-item"]:focus-visible > [data-slot="tree-label"]':
    {
      background: 'var(--accent)',
    },
  '[data-slot="tree-label"][data-selected]': { background: 'var(--accent)', fontWeight: 600 },
  '[data-slot="tree-indicator"]': {
    display: 'inline-block',
    width: '1rem',
    textAlign: 'center',
    color: 'var(--muted-foreground)',
    transition: 'transform 120ms',
  },
  '[data-slot="tree-indicator"][data-expanded]': { transform: 'rotate(90deg)' },
  '[data-slot="tree-checkbox"]': {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    borderRadius: '4px',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
  },
  '[data-slot="tree-checkbox"][data-checked], [data-slot="tree-checkbox"][data-indeterminate]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
  },

  // Timeline
  '[data-slot="timeline"]': {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    width: '24rem',
    maxWidth: '100%',
  },
  '[data-slot="timeline"][data-orientation="horizontal"]': { flexDirection: 'row', width: '100%' },
  '[data-slot="timeline-item"]': {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    paddingLeft: '1.75rem',
    paddingBottom: '1.25rem',
    outline: 'none',
  },
  '[data-slot="timeline"][data-orientation="horizontal"] [data-slot="timeline-item"]': {
    flex: 1,
    paddingLeft: 0,
    paddingTop: '1.75rem',
  },
  '[data-slot="timeline-marker"]': {
    position: 'absolute',
    left: 0,
    top: '0.25rem',
    width: '0.8rem',
    height: '0.8rem',
    borderRadius: '50%',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
  },
  '[data-slot="timeline"][data-orientation="horizontal"] [data-slot="timeline-marker"]': {
    left: 0,
    top: 0,
  },
  '[data-slot="timeline-marker"][data-complete], [data-slot="timeline-marker"][data-current]': {
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
  },
  '[data-slot="timeline-connector"]': {
    position: 'absolute',
    left: 'calc(0.4rem - 1px)',
    top: '1.2rem',
    bottom: '0.1rem',
    width: '2px',
    background: 'var(--hairline)',
  },
  '[data-slot="timeline"][data-orientation="horizontal"] [data-slot="timeline-connector"]': {
    left: '1.2rem',
    right: '0.4rem',
    top: 'calc(0.4rem - 1px)',
    bottom: 'auto',
    width: 'auto',
    height: '2px',
  },
  '[data-slot="timeline-item"]:last-child [data-slot="timeline-connector"]': { display: 'none' },
  '[data-slot="timeline-title"]': { margin: 0, fontSize: '0.95rem', fontWeight: 600 },
  '[data-slot="timeline-time"]': {
    color: 'var(--muted-foreground)',
    fontSize: '0.78rem',
    order: 3,
  },
  '[data-slot="timeline-description"]': {
    margin: 0,
    color: 'var(--muted-foreground)',
    fontSize: '0.88rem',
  },

  // Waterfall
  '[data-slot="waterfall"]': {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    fontSize: '0.85rem',
  },
  '[data-slot="waterfall-header-row"], [data-slot="waterfall-row"]': {
    display: 'grid',
    gridTemplateColumns: '11rem 1fr',
    alignItems: 'center',
    minHeight: '1.9rem',
  },
  '[data-slot="waterfall-row"]': { borderTop: '1px solid var(--hairline-soft)', outline: 'none' },
  '[data-slot="waterfall-row"][hidden]': { display: 'none' },
  '[data-slot="waterfall-row"][data-selected], [data-slot="waterfall-row"]:focus-visible': {
    background: 'var(--accent)',
  },
  '[data-slot="waterfall-column-header"]': {
    position: 'relative',
    height: '2.2rem',
    color: 'var(--muted-foreground)',
    fontFamily: 'var(--mono)',
    fontSize: '0.7rem',
  },
  '[data-slot="waterfall-axis"]': { position: 'relative', height: '100%' },
  '[data-slot="waterfall-tick"]': {
    position: 'absolute',
    top: 0,
    zIndex: 2,
    left: 'var(--waterfall-tick)',
    transform: 'translateX(-50%)',
    paddingInline: '0.15rem',
    background: 'var(--card)',
    whiteSpace: 'nowrap',
  },
  // Keep the first and last labels inside the track instead of half outside it.
  '[data-slot="waterfall-tick"]:first-of-type': { transform: 'none' },
  '[data-slot="waterfall-tick"]:last-of-type': { transform: 'translateX(-100%)' },
  // Marks keep their label on a second line, below the ticks, so the two never overlap.
  '[data-slot="waterfall-mark"]': {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 1,
    left: 'var(--waterfall-mark)',
    display: 'flex',
    alignItems: 'flex-end',
    borderLeft: '1px dashed var(--fl-danger)',
    paddingRight: '0.25rem',
    paddingLeft: '0.25rem',
    background: 'linear-gradient(to bottom, transparent 50%, var(--card) 50%)',
    color: 'var(--fl-danger)',
    whiteSpace: 'nowrap',
  },
  '[data-slot="waterfall-row-header"]': {
    ...row,
    gap: '0.3rem',
    paddingLeft: 'calc((var(--waterfall-level, 1) - 1) * 1rem)',
  },
  '[data-slot="waterfall-indicator"]': {
    display: 'inline-block',
    width: '1rem',
    textAlign: 'center',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="waterfall-indicator"][data-expanded]': { transform: 'rotate(90deg)' },
  '[data-slot="waterfall-bar"]': {
    height: '0.9rem',
    marginLeft: 'var(--waterfall-start)',
    width: 'var(--waterfall-size)',
    minWidth: '2px',
    borderRadius: '4px',
    background: 'linear-gradient(var(--primary-fill-top), var(--primary-fill-bottom))',
    boxShadow: 'var(--elev-primary)',
  },

  // Trigger menu
  '[data-slot="trigger-menu-input"]': { ...control, maxWidth: '24rem' },
  '[data-slot="trigger-menu-content"]': {
    ...floating,
    width: '16rem',
    maxHeight: '14rem',
    overflow: 'auto',
    padding: '0.25rem',
  },
  '[data-slot="trigger-menu-item"]': {
    cursor: 'pointer',
    padding: '0.4rem 0.6rem',
    borderRadius: '6px',
  },
  '[data-slot="trigger-menu-item"][data-highlighted]': { background: 'var(--accent)' },
  '[data-slot="trigger-menu-separator"]': {
    height: '1px',
    margin: '0.25rem 0',
    background: 'var(--hairline)',
  },
  '[data-slot="trigger-menu-empty"], [data-slot="trigger-menu-status"]': {
    padding: '0.4rem 0.6rem',
    color: 'var(--muted-foreground)',
  },
  '[data-slot="trigger-menu-hint"]': { color: 'var(--muted-foreground)', fontSize: '0.8rem' },
}
