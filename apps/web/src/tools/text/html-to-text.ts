import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  return text
    .replaceAll(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/giu, '')
    .replaceAll(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr)>/giu, '\n')
    .replaceAll(/<[^>]+>/gu, '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll(/\n{3,}/gu, '\n\n')
    .trim()
}

export const htmlToText = defineTransform({
  meta: {
    id: 'html-to-text',
    name: 'HTML to text',
    category: 'text',
    description: 'Strip HTML tags and keep the readable text.',
    keywords: ['html', 'strip tags', 'plain text', 'clean'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'Type or paste text',
  acceptsFiles: true,
  example: '<p>Hi <b>there</b></p><script>x()</script>',
  run,
})
