import { css } from '../../../styled-system/css'
import { columns, panel, stack } from '../kit.ts'
import { decodeBase64, encodeBase64 } from './base64.logic.ts'
import {
  attempt,
  codeBox,
  dataTable,
  defineWorkbench,
  errorNote,
  highlightJson,
  inputBox,
  jsonTokens,
  sectionLabel,
} from './ui.ts'

const sample = (header: unknown, payload: unknown) =>
  `${encodeBase64(JSON.stringify(header), true)}.${encodeBase64(JSON.stringify(payload), true)}.c2lnbmF0dXJl`

const tokenCls = css({
  margin: 0,
  padding: '0.8rem 0.9rem',
  borderRadius: 'var(--radius)',
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  fontFamily: 'var(--mono)',
  fontSize: '0.82rem',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  '& [data-p="header"]': { color: 'var(--danger)' },
  '& [data-p="payload"]': { color: 'var(--info)' },
  '& [data-p="signature"]': { color: 'var(--ok)' },
  '& [data-p="dot"]': { color: 'var(--muted-foreground)' },
})
const badgeCls = css({
  display: 'inline-flex',
  alignSelf: 'flex-start',
  padding: '0.2rem 0.7rem',
  borderRadius: '999px',
  fontSize: '0.8rem',
  fontWeight: 600,
  background: 'var(--well)',
  boxShadow: 'var(--elev-well)',
  '&[data-ok]': { color: 'var(--ok)' },
  '&[data-bad]': { color: 'var(--danger)' },
})

const decodePart = (name: string, encoded: string): unknown => {
  try {
    return JSON.parse(decodeBase64(encoded))
  } catch {
    throw new Error(`The ${name} is not valid JSON.`)
  }
}

const CLAIMS: Readonly<Record<string, string>> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expires',
  nbf: 'Not before',
  iat: 'Issued',
  jti: 'ID',
}

const relative = (seconds: number): string => {
  const abs = Math.abs(seconds)
  const [n, unit] =
    abs < 60
      ? [abs, 'second']
      : abs < 3600
        ? [abs / 60, 'minute']
        : abs < 86400
          ? [abs / 3600, 'hour']
          : [abs / 86400, 'day']
  const count = Math.floor(n)
  return `${count} ${unit}${count === 1 ? '' : 's'} ${seconds < 0 ? 'ago' : 'from now'}`
}

export const jwtDecoder = defineWorkbench({
  meta: {
    id: 'jwt-decoder',
    name: 'JWT decoder',
    category: 'developer',
    description: 'Read the header, claims, and expiry of a JSON Web Token.',
    keywords: ['jwt', 'token', 'bearer', 'claims', 'auth', 'json web token'],
  },
  example: sample(
    { alg: 'HS256', typ: 'JWT' },
    { sub: '1234567890', name: 'Ada Lovelace', iat: 1516239022, exp: 4102444800 },
  ),
  view: (h, ctx) => {
    const token = ctx.input.trim().replace(/^Bearer\s+/iu, '')
    const pieces = token.split('.')
    const decoded =
      token === ''
        ? null
        : attempt(() => {
            if (pieces.length !== 3) throw new Error('A JWT has three parts separated by dots.')
            decodePart('header', pieces[0] ?? '')
            decodePart('payload', pieces[1] ?? '')
            return ''
          })
    const ok = decoded !== null && decoded.error === ''
    const header = ok ? decodePart('header', pieces[0] ?? '') : null
    const payload = ok ? decodePart('payload', pieces[1] ?? '') : null
    const record =
      payload !== null && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
    const exp = record['exp']
    const now = Date.now() / 1000
    const claimRows = Object.entries(CLAIMS).flatMap(([key, name]) => {
      const value = record[key]
      if (value === undefined) return []
      const shown =
        typeof value === 'number' && ['exp', 'nbf', 'iat'].includes(key)
          ? `${new Date(value * 1000).toISOString()} (${relative(value - now)})`
          : typeof value === 'string'
            ? value
            : JSON.stringify(value)
      return [[key, name, shown]]
    })
    const pretty = (value: unknown) => JSON.stringify(value, null, 2)
    return h.div(
      [h.Class(stack)],
      [
        panel(h, null, [
          inputBox(h, ctx, {
            id: 'jwt-input',
            label: 'Token',
            placeholder: 'eyJhbGciOi…',
            rows: 6,
          }),
          errorNote(h, decoded?.error ?? ''),
          ok
            ? h.pre(
                [h.Class(tokenCls), h.AriaLabel('Token by part')],
                [
                  h.span([h.Attribute('data-p', 'header')], [pieces[0] ?? '']),
                  h.span([h.Attribute('data-p', 'dot')], ['.']),
                  h.span([h.Attribute('data-p', 'payload')], [pieces[1] ?? '']),
                  h.span([h.Attribute('data-p', 'dot')], ['.']),
                  h.span([h.Attribute('data-p', 'signature')], [pieces[2] ?? '']),
                ],
              )
            : null,
        ]),
        !ok
          ? null
          : h.div(
              [h.Class(stack)],
              [
                typeof exp === 'number'
                  ? h.span(
                      [h.Class(badgeCls), h.Attribute(exp < now ? 'data-bad' : 'data-ok', '')],
                      [exp < now ? 'Expired' : 'Not expired'],
                    )
                  : null,
                columns(h, [
                  panel(h, null, [
                    sectionLabel(h, 'Header'),
                    codeBox(h, {
                      label: 'Header',
                      value: pretty(header),
                      class: jsonTokens,
                      children: highlightJson(h, pretty(header)),
                    }),
                  ]),
                  panel(h, null, [
                    sectionLabel(h, 'Payload'),
                    codeBox(h, {
                      label: 'Payload',
                      value: pretty(payload),
                      class: jsonTokens,
                      children: highlightJson(h, pretty(payload)),
                    }),
                  ]),
                ]),
                claimRows.length === 0
                  ? null
                  : panel(h, null, [
                      sectionLabel(h, 'Claims'),
                      dataTable(h, {
                        headers: ['Claim', 'Name', 'Value'],
                        kinds: ['mono', 'text', 'mono'],
                        rows: claimRows,
                      }),
                    ]),
                panel(h, null, [
                  sectionLabel(h, 'Signature'),
                  codeBox(h, { label: 'Signature', value: pieces[2] ?? '' }),
                ]),
              ],
            ),
      ],
    )
  },
})
