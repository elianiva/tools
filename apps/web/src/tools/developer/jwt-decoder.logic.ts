import { decodeBase64 } from './base64.logic.ts'

const part = (name: string, encoded: string): string => {
  let json: unknown
  try {
    json = JSON.parse(decodeBase64(encoded))
  } catch {
    throw new Error(`The ${name} is not valid JSON.`)
  }
  return JSON.stringify(json, null, 2)
}

const when = (seconds: unknown): string =>
  typeof seconds === 'number' ? new Date(seconds * 1000).toISOString() : ''

/** Decodes a token. It does not check the signature, so a decoded token is not a trusted one. */
export const decodeJwt = (text: string, now = Date.now()): string => {
  const pieces = text
    .trim()
    .replace(/^Bearer\s+/iu, '')
    .split('.')
  if (pieces.length !== 3) throw new Error('A JWT has three parts separated by dots.')
  const [header = '', payload = ''] = pieces
  const claims: unknown = JSON.parse(part('payload', payload))
  const record =
    claims !== null && typeof claims === 'object' ? (claims as Record<string, unknown>) : {}
  const times = [
    ['Issued', record['iat']],
    ['Not before', record['nbf']],
    ['Expires', record['exp']],
  ].flatMap(([label, value]) => (when(value) === '' ? [] : [`${label}: ${when(value)}`]))
  const exp = record['exp']
  const status =
    typeof exp === 'number' ? [exp * 1000 < now ? 'Status: expired' : 'Status: not expired'] : []
  return [
    'HEADER',
    part('header', header),
    '',
    'PAYLOAD',
    part('payload', payload),
    ...(times.length === 0 ? [] : ['', ...times, ...status]),
    '',
    'The signature is not checked.',
  ].join('\n')
}
