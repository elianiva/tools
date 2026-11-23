import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const table = [
    '100|Continue|The server got the headers; the client can send the body.',
    '101|Switching Protocols|The server agrees to change protocol, such as to WebSocket.',
    '200|OK|The request worked.',
    '201|Created|The request worked and made a new resource.',
    '202|Accepted|The request is accepted but not finished.',
    '204|No Content|The request worked and there is nothing to send back.',
    '206|Partial Content|The server sent only the byte range that was asked for.',
    '301|Moved Permanently|The resource has a new address for good.',
    '302|Found|The resource is at another address for now.',
    '304|Not Modified|The cached copy is still good.',
    '307|Temporary Redirect|Go to another address and keep the same method.',
    '308|Permanent Redirect|The address changed for good and the method stays.',
    '400|Bad Request|The server cannot read the request.',
    '401|Unauthorized|The request needs valid sign-in credentials.',
    '403|Forbidden|The server knows who you are and refuses.',
    '404|Not Found|Nothing lives at this address.',
    '405|Method Not Allowed|The address does not accept this method.',
    '408|Request Timeout|The server gave up waiting for the request.',
    '409|Conflict|The request clashes with the current state.',
    '410|Gone|The resource was removed on purpose.',
    '413|Content Too Large|The request body is too big.',
    '415|Unsupported Media Type|The server does not take this content type.',
    "418|I'm a teapot|A joke code: the server is a teapot and cannot brew coffee.",
    '422|Unprocessable Content|The request is well formed but its content is wrong.',
    '429|Too Many Requests|Slow down: you hit a rate limit.',
    '500|Internal Server Error|The server failed in an unexpected way.',
    '501|Not Implemented|The server does not support this feature.',
    '502|Bad Gateway|A proxy got a bad answer from the server behind it.',
    '503|Service Unavailable|The server is down or overloaded.',
    '504|Gateway Timeout|A proxy waited too long for the server behind it.',
  ]
  const query = text.trim().toLowerCase()
  const found = table.filter((row) => {
    const [code = '', name = '', description = ''] = row.split('|')
    if (/^[1-5]xx$/u.test(query)) return code.startsWith(query.charAt(0))
    if (/^\d+$/u.test(query)) return code === query
    return `${name} ${description}`.toLowerCase().includes(query)
  })
  if (found.length === 0) throw new Error('No status code matches that.')
  return found
    .map((row) => {
      const [code = '', name = '', description = ''] = row.split('|')
      return `${code} ${name}: ${description}`
    })
    .join('\n')
}

export const httpStatus = defineTransform({
  meta: {
    id: 'http-status',
    name: 'HTTP status codes',
    category: 'developer',
    description: 'Look up what an HTTP status code means.',
    keywords: ['http', 'status code', '404', '500', 'redirect', 'error', 'response'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '404, 4xx, or teapot',
  example: '404',
  run,
})
