import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  let fenced = false
  const headings: Array<{ level: number; title: string }> = []
  for (const line of text.split('\n')) {
    if (line.trimStart().startsWith('```')) fenced = !fenced
    const match = fenced ? null : /^(#{1,6})\s+(.+?)\s*#*\s*$/u.exec(line)
    if (match !== null) headings.push({ level: (match[1] ?? '#').length, title: match[2] ?? '' })
  }
  if (headings.length === 0) throw new Error('No headings found.')
  const top = Math.min(...headings.map((heading) => heading.level))
  return headings
    .map(({ level, title }) => {
      const slug = title
        .toLowerCase()
        .replaceAll(/[^\p{L}\p{N}\s-]/gu, '')
        .replaceAll(/\s/gu, '-')
      return `${'  '.repeat(level - top)}- [${title}](#${slug})`
    })
    .join('\n')
}

export const markdownToc = defineTransform({
  meta: {
    id: 'markdown-toc',
    name: 'Markdown table of contents',
    category: 'text',
    description: 'Build a linked table of contents from Markdown headings.',
    keywords: ['markdown', 'toc', 'headings', 'outline', 'readme'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  run,
})
