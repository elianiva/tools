const toBinary = (bytes: Uint8Array): string => {
  let out = ''
  // Chunked: `String.fromCharCode(...bytes)` overflows the stack on a large input.
  for (let i = 0; i < bytes.length; i += 8192) {
    out += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 8192)))
  }
  return out
}

export const encodeBase64 = (text: string, urlSafe: boolean): string => {
  const base = btoa(toBinary(new TextEncoder().encode(text)))
  return urlSafe ? base.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '') : base
}

/** Accepts both alphabets, with or without padding, and ignores whitespace. */
export const decodeBase64 = (text: string): string => {
  const clean = text.replaceAll(/\s+/gu, '').replaceAll('-', '+').replaceAll('_', '/')
  const padded = clean + '='.repeat((4 - (clean.length % 4)) % 4)
  let binary: string
  try {
    binary = atob(padded)
  } catch {
    throw new Error('This is not valid Base64.')
  }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('The bytes are valid Base64 but not UTF-8 text.')
  }
}

export const runBase64 = (text: string, mode: string): string =>
  mode === 'decode' ? decodeBase64(text) : encodeBase64(text, mode === 'encode-url')
