import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const lines = text.split('\n')
  const lead = (line: string): number => (/^[ \t]*/u.exec(line)?.[0] ?? '').length
  if (mode === 'dedent') {
    const strip = Math.min(...lines.filter((line) => line.trim() !== '').map(lead))
    if (!Number.isFinite(strip)) return text
    return lines.map((line) => line.slice(Math.min(strip, lead(line)))).join('\n')
  }
  const pad = mode === 'tab' ? '\t' : mode === 'indent4' ? '    ' : '  '
  return lines.map((line) => (line === '' ? line : pad + line)).join('\n')
}

export const indent = defineTransform({
  meta: {
    id: 'indent',
    name: 'Indent and dedent',
    category: 'text',
    description: 'Indent every line, or remove the shared indent.',
    keywords: ['indent', 'dedent', 'tab', 'spaces', 'outdent'],
  },
  modes: [
    { id: 'indent2', label: 'Indent 2' },
    { id: 'indent4', label: 'Indent 4' },
    { id: 'tab', label: 'Indent tab' },
    { id: 'dedent', label: 'Dedent' },
  ],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
