import { cleaner, defineTextTool } from './ui.ts'

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

export const indent = defineTextTool({
  meta: {
    id: 'indent',
    name: 'Indent and dedent',
    category: 'text',
    description: 'Indent every line, or remove the shared indent.',
    keywords: ['indent', 'dedent', 'tab', 'spaces', 'outdent'],
  },
  mode: 'indent2',
  example: 'function add(a, b) {\n  return a + b\n}',
  files: true,
  render: (c) =>
    cleaner(c, {
      run,
      options: [
        { value: 'indent2', label: 'Indent 2' },
        { value: 'indent4', label: 'Indent 4' },
        { value: 'tab', label: 'Indent tab' },
        { value: 'dedent', label: 'Dedent' },
      ],
    }),
})
