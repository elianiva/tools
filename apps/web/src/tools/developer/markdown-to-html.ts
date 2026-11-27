import { marked } from 'marked'
import { css } from '../../../styled-system/css'
import { columns, panel, segmented, stack } from '../kit.ts'
import { codeBox, defineWorkbench, inputBox, sectionLabel } from './ui.ts'

export const run = (text: string): string => {
  return String(marked.parse(text, { async: false })).trim()
}

const frameCls = css({
  width: '100%',
  minHeight: '24rem',
  border: 0,
  borderRadius: 'var(--radius)',
  background: 'white',
  boxShadow: 'var(--elev-well)',
})

const PAGE = `<style>body{font:15px/1.6 system-ui,sans-serif;color:#222;margin:12px}pre,code{font-family:ui-monospace,monospace;background:#f2f2f2;border-radius:4px}pre{padding:8px;overflow:auto}code{padding:0 3px}pre code{padding:0}img{max-width:100%}blockquote{margin-left:0;padding-left:12px;border-left:3px solid #ccc;color:#555}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px}</style>`

export const markdownToHtml = defineWorkbench({
  meta: {
    id: 'markdown-to-html',
    name: 'Markdown to HTML',
    category: 'developer',
    description: 'Turn Markdown into HTML you can copy.',
    keywords: ['markdown', 'md', 'html', 'convert', 'render'],
  },
  mode: 'preview',
  example: '# Hi\n\n*there* **you**',
  acceptsFiles: true,
  view: (h, ctx) => {
    const html = run(ctx.input)
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          panel(h, null, [
            inputBox(h, ctx, {
              id: 'markdown-input',
              label: 'Markdown',
              placeholder: '# Title',
              rows: 18,
            }),
          ]),
          panel(h, null, [
            h.div(
              [
                h.Class(
                  css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),
                ),
              ],
              [
                sectionLabel(h, 'Result'),
                segmented(h, {
                  label: 'View',
                  value: ctx.mode,
                  options: [
                    { value: 'preview', label: 'Preview' },
                    { value: 'html', label: 'HTML' },
                  ],
                  onSelect: ctx.on.mode,
                }),
              ],
            ),
            ctx.mode === 'html'
              ? codeBox(h, { label: 'HTML', value: html })
              : // The preview is a sandboxed frame, so scripts in the Markdown never run.
                h.iframe(
                  [
                    h.Class(frameCls),
                    h.Title('Preview'),
                    h.Sandbox(''),
                    h.Srcdoc(`${PAGE}${html}`),
                  ],
                  [],
                ),
          ]),
        ]),
      ],
    )
  },
})
