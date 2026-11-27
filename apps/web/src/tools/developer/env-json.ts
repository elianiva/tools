import { codecView, defineWorkbench } from './ui.ts'

export const run = (text: string, mode: string): string => {
  if (mode === 'to-env') {
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('This is not valid JSON.')
    }
    if (data === null || typeof data !== 'object' || Array.isArray(data))
      throw new Error('Use a JSON object.')
    return Object.entries(data)
      .map(([key, value]) => {
        if (value !== null && typeof value === 'object')
          throw new Error('Use flat values: no nested objects or arrays.')
        const raw = String(value)
        return `${key}=${/[\s#"']/u.test(raw) ? `"${raw.replaceAll('"', '\\"')}"` : raw}`
      })
      .join('\n')
  }
  const entries: Array<readonly [string, string]> = []
  for (const [index, line] of text.split('\n').entries()) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) continue
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*(.*)$/u.exec(trimmed)
    if (match === null) throw new Error(`Line ${index + 1} is not KEY=VALUE.`)
    const value = (match[2] ?? '').replace(/^(["'])(.*)\1$/u, '$2')
    entries.push([match[1] ?? '', value])
  }
  return JSON.stringify(Object.fromEntries(entries), null, 2)
}

export const envJson = defineWorkbench({
  meta: {
    id: 'env-json',
    name: '.env and JSON',
    category: 'developer',
    description: 'Convert a .env file to JSON and back.',
    keywords: ['env', 'dotenv', 'environment', 'json', 'config', 'variables'],
  },
  mode: 'to-json',
  example: 'A=1\n# note\nexport B="x y"\nC=\'z\'',
  acceptsFiles: true,
  view: (h, ctx) =>
    codecView(h, ctx, {
      id: 'env-json',
      modes: [
        { value: 'to-json', label: '.env to JSON' },
        { value: 'to-env', label: 'JSON to .env' },
      ],
      inverse: { 'to-json': 'to-env', 'to-env': 'to-json' },
      run,
      labels: (mode) => (mode === 'to-json' ? ['.env', 'JSON'] : ['JSON', '.env']),
      placeholder: ctx.mode === 'to-json' ? 'KEY=value' : '{"KEY":"value"}',
    }),
})
