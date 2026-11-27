import { css } from '../../../styled-system/css'
import { button, stack, panel } from '../kit.ts'
import {
  cellInput,
  dataTable,
  defineWorkbench,
  errorNote,
  inputBox,
  sectionLabel,
  textField,
} from './ui.ts'

export const run = (text: string): string => {
  const raw = text.trim()
  let url: URL
  try {
    url = new URL(raw.includes('://') ? raw : `https://${raw}`)
  } catch {
    throw new Error('This is not a valid URL.')
  }
  const lines = [`Protocol: ${url.protocol}`, `Host: ${url.host}`, `Path: ${url.pathname}`]
  if (url.hash !== '') lines.push(`Hash: ${url.hash}`)
  const params = [...url.searchParams]
  if (params.length > 0)
    lines.push('', 'Parameters', ...params.map(([key, value]) => `${key} = ${value}`))
  return lines.join('\n')
}

const partsCls = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
  gap: '0.8rem',
})

const parse = (text: string): URL | null => {
  const raw = text.trim()
  try {
    return new URL(raw.includes('://') ? raw : `https://${raw}`)
  } catch {
    return null
  }
}

export const urlParser = defineWorkbench({
  meta: {
    id: 'url-parser',
    name: 'URL parser',
    category: 'developer',
    description: 'Split a URL into its host, path, and query parameters.',
    keywords: ['url', 'query string', 'parameters', 'host', 'parse', 'utm'],
  },
  example: 'https://x.com/a?b=1&c=hello%20w#top',
  view: (h, ctx) => {
    const url = parse(ctx.input)
    // Each edit rebuilds the whole URL, so the input and the parts never disagree.
    const change = (apply: (next: URL) => void) => {
      const next = new URL((url ?? new URL('https://example.com')).href)
      apply(next)
      return ctx.on.input(next.href)
    }
    const part = (
      id: string,
      label: string,
      value: string,
      apply: (next: URL, v: string) => void,
    ) =>
      textField(h, {
        id: `url-${id}`,
        label,
        value,
        onInput: (v) => change((next) => apply(next, v)),
      })
    const params = url === null ? [] : [...url.searchParams]
    const rebuild = (next: URL, list: ReadonlyArray<readonly [string, string]>) => {
      next.search = new URLSearchParams(list.map(([k, v]) => [k, v])).toString()
    }
    return h.div(
      [h.Class(stack)],
      [
        panel(h, null, [
          inputBox(h, ctx, {
            id: 'url-input',
            label: 'URL',
            placeholder: 'https://example.com/path?q=1',
            rows: 3,
          }),
          ctx.input.trim() !== '' && url === null ? errorNote(h, 'This is not a valid URL.') : null,
        ]),
        url === null
          ? null
          : panel(h, null, [
              sectionLabel(h, 'Parts'),
              h.div(
                [h.Class(partsCls)],
                [
                  part('protocol', 'Protocol', url.protocol.replace(':', ''), (n, v) => {
                    n.protocol = v
                  }),
                  part('host', 'Host', url.hostname, (n, v) => {
                    n.hostname = v
                  }),
                  part('port', 'Port', url.port, (n, v) => {
                    n.port = v
                  }),
                  part('path', 'Path', url.pathname, (n, v) => {
                    n.pathname = v
                  }),
                  part('hash', 'Fragment', url.hash.replace('#', ''), (n, v) => {
                    n.hash = v
                  }),
                  part('user', 'Username', url.username, (n, v) => {
                    n.username = v
                  }),
                ],
              ),
            ]),
        url === null
          ? null
          : panel(h, null, [
              h.div(
                [
                  h.Class(
                    css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),
                  ),
                ],
                [
                  sectionLabel(h, `Query parameters (${params.length})`),
                  button(
                    h,
                    { variant: 'ghost', size: 'sm' },
                    [h.OnClick(change((n) => rebuild(n, [...params, ['key', 'value']])))],
                    ['Add'],
                  ),
                ],
              ),
              dataTable(h, {
                headers: ['Key', 'Value', ''],
                empty: 'No query parameters.',
                rows: params.map(([key, value], index) => {
                  const set = (k: string, v: string) =>
                    change((n) =>
                      rebuild(
                        n,
                        params.map((p, at) => (at === index ? [k, v] : p)),
                      ),
                    )
                  return [
                    cellInput(h, {
                      label: `Key ${index + 1}`,
                      value: key,
                      onInput: (v) => set(v, value),
                    }),
                    cellInput(h, { label: `Value of ${key}`, value, onInput: (v) => set(key, v) }),
                    button(
                      h,
                      { variant: 'ghost', size: 'sm' },
                      [
                        h.AriaLabel(`Remove ${key}`),
                        h.OnClick(
                          change((n) =>
                            rebuild(
                              n,
                              params.filter((_, at) => at !== index),
                            ),
                          ),
                        ),
                      ],
                      ['Remove'],
                    ),
                  ]
                }),
              }),
            ]),
      ],
    )
  },
})
