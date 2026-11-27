import { css } from '../../../styled-system/css'
import { columns, hint, panel, stack, stats } from '../kit.ts'
import { slugify } from './slug.logic.ts'
import { copyable, defineTextTool, sourcePanel, useAsInput } from './ui.ts'

const urlCls = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  '& li': {
    padding: '0.6rem 0.8rem',
    borderRadius: 'var(--radius)',
    background: 'var(--well)',
    boxShadow: 'var(--elev-well)',
    fontFamily: 'var(--mono)',
    fontSize: '0.9rem',
    overflowWrap: 'anywhere',
  },
  '& span': { color: 'var(--muted-foreground)' },
  '& b': { fontWeight: 500 },
})

export const slug = defineTextTool({
  meta: {
    id: 'slug',
    name: 'Slug generator',
    category: 'text',
    description: 'Turn titles into clean, URL-friendly slugs.',
    keywords: ['url', 'permalink', 'kebab', 'seo'],
  },
  example: 'Crème Brûlée & Más: A 5-Minute Guide!',
  files: true,
  render: (c) => {
    const { h } = c
    const value = slugify(c.input)
    const slugs = value === '' ? [] : value.split('\n')
    const longest = Math.max(0, ...slugs.map((item) => item.length))
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          sourcePanel(c, { label: 'Titles', placeholder: 'One title per line', rows: 6 }),
          panel(h, 'Slug', [
            slugs.length === 0
              ? hint(h, 'Paste a title.')
              : h.div(
                  [h.Class(stack)],
                  [
                    copyable(
                      h,
                      value,
                      h.ul(
                        [h.Class(urlCls)],
                        slugs.map((item) =>
                          h.li([], [h.span([], ['example.com/blog/']), h.b([], [item])]),
                        ),
                      ),
                    ),
                    stats(h, [
                      ['Slugs', String(slugs.length)],
                      ['Longest', `${longest} characters`],
                    ]),
                    useAsInput(c, value),
                  ],
                ),
          ]),
        ]),
      ],
    )
  },
})
