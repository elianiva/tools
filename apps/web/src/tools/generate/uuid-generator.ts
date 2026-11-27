import { css } from '../../../styled-system/css'
import { stack } from '../kit.ts'
import { copyButton, defineGenerator, smallLabel } from './ui.ts'

export const run = (text: string): string => {
  const count = Math.min(100, Math.max(1, Number.parseInt(text, 10) || 1))
  return Array.from({ length: count }, () => crypto.randomUUID()).join('\n')
}

const listCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  '& li': {
    position: 'relative',
    padding: '0.65rem 3rem 0.65rem 0.9rem',
    borderRadius: 'var(--radius)',
    background: 'var(--card)',
    boxShadow: 'var(--elev-raised)',
    fontFamily: 'var(--mono)',
    fontSize: '0.95rem',
    overflowWrap: 'anywhere',
  },
  '& li > [data-slot="copy-button"]': {
    position: 'absolute',
    top: '50%',
    right: '0.5rem',
    translate: '0 -50%',
  },
})
const barCls = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.8rem',
})

const format = (id: string, mode: string): string =>
  mode === 'upper' ? id.toUpperCase() : mode === 'compact' ? id.replaceAll('-', '') : id

export const uuidGenerator = defineGenerator({
  meta: {
    id: 'uuid-generator',
    name: 'UUID generator',
    category: 'generate',
    description: 'Random version 4 UUIDs. Type how many.',
    keywords: ['uuid', 'guid', 'random id', 'v4', 'identifier'],
  },
  fields: [
    {
      label: 'How many',
      initial: '5',
      integer: true,
      min: 1,
      max: 100,
      presets: ['1', '5', '10', '50'],
    },
  ],
  modes: [
    { id: 'standard', label: 'Standard' },
    { id: 'upper', label: 'Uppercase' },
    { id: 'compact', label: 'No hyphens' },
  ],
  modeLabel: 'Format',
  action: 'Generate',
  run,
  view: (h, { out, mode }) => {
    const ids = out.split('\n').map((id) => format(id, mode))
    return h.div(
      [h.Class(stack)],
      [
        h.div(
          [h.Class(barCls)],
          [
            smallLabel(h, `${ids.length} ${ids.length === 1 ? 'UUID' : 'UUIDs'}`),
            copyButton(h, ids.join('\n')),
          ],
        ),
        h.ul(
          [h.Class(listCls)],
          ids.map((id) => h.li([h.Key(id)], [id, copyButton(h, id)])),
        ),
      ],
    )
  },
})
