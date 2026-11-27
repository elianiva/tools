import { cleaner, defineTextTool } from './ui.ts'

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

export const htmlToText = defineTextTool({
  meta: {
    id: 'html-to-text',
    name: 'HTML to text',
    category: 'text',
    description: 'Strip HTML tags and keep the readable text.',
    keywords: ['html', 'strip tags', 'plain text', 'clean'],
  },
  example: '<h1>Title</h1>\n<p>Hi <b>there</b> &amp; welcome.</p><script>x()</script>',
  files: true,
  render: (c) =>
    cleaner(c, {
      run,
      placeholder: 'Paste HTML',
      extra: (before) => [['Tags', String((before.match(/<[^>]+>/gu) ?? []).length)]],
    }),
})
