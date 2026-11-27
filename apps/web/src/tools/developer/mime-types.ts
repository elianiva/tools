import { referenceView, defineWorkbench } from './ui.ts'

export const MIME_ROWS = [
  'html|text/html',
  'css|text/css',
  'js|text/javascript',
  'mjs|text/javascript',
  'json|application/json',
  'xml|application/xml',
  'txt|text/plain',
  'csv|text/csv',
  'md|text/markdown',
  'yaml|application/yaml',
  'yml|application/yaml',
  'pdf|application/pdf',
  'zip|application/zip',
  'gz|application/gzip',
  'tar|application/x-tar',
  'wasm|application/wasm',
  'png|image/png',
  'jpg|image/jpeg',
  'jpeg|image/jpeg',
  'gif|image/gif',
  'webp|image/webp',
  'avif|image/avif',
  'svg|image/svg+xml',
  'ico|image/vnd.microsoft.icon',
  'bmp|image/bmp',
  'heic|image/heic',
  'mp3|audio/mpeg',
  'wav|audio/wav',
  'ogg|audio/ogg',
  'mp4|video/mp4',
  'webm|video/webm',
  'mov|video/quicktime',
  'woff|font/woff',
  'woff2|font/woff2',
  'ttf|font/ttf',
  'otf|font/otf',
  'docx|application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xlsx|application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'pptx|application/vnd.openxmlformats-officedocument.presentationml.presentation',
].map((row) => {
  const [extension = '', type = ''] = row.split('|')
  return { extension, type }
})

export const run = (text: string): string => {
  const query = text.trim().toLowerCase()
  if (query.includes('/')) {
    const found = MIME_ROWS.filter((row) => row.type === query)
    if (found.length === 0) throw new Error('No extension is known for that type.')
    return `${query}: ${found.map((row) => `.${row.extension}`).join(', ')}`
  }
  const extension = query.replace(/^\*?\./u, '')
  const row = MIME_ROWS.find((candidate) => candidate.extension === extension)
  if (row === undefined) throw new Error('That extension is not in the list.')
  return `${row.extension}: ${row.type}`
}

const KINDS = ['text', 'image', 'audio', 'video', 'application', 'font']

export const mimeTypes = defineWorkbench({
  meta: {
    id: 'mime-types',
    name: 'MIME types',
    category: 'developer',
    description: 'Look up the MIME type of a file extension, or the extensions of a type.',
    keywords: ['mime', 'content type', 'extension', 'media type', 'file type'],
  },
  view: (h, ctx) =>
    referenceView(h, ctx, {
      id: 'mime-types',
      label: 'Search',
      placeholder: 'png or image/png',
      categories: KINDS,
      headers: ['Extension', 'MIME type'],
      kinds: ['mono', 'mono'],
      copyColumn: 1,
      empty: 'Nothing matches.',
      rows: MIME_ROWS.map((row) => ({
        category: row.type.split('/')[0] ?? '',
        search: `${row.extension} ${row.type}`.toLowerCase(),
        cells: [`.${row.extension}`, row.type],
      })),
    }),
})
