import { defineTransform } from '../transform.ts'
import { hashText } from './hash.logic.ts'

export const hash = defineTransform({
  meta: {
    id: 'hash',
    name: 'Hash generator',
    category: 'developer',
    description: 'SHA-256, SHA-512, SHA-1 and MD5 hashes of text.',
    keywords: ['sha', 'md5', 'checksum', 'digest', 'sha256', 'sha512'],
  },
  modes: [
    { id: 'sha256', label: 'SHA-256' },
    { id: 'sha512', label: 'SHA-512' },
    { id: 'sha1', label: 'SHA-1' },
    { id: 'md5', label: 'MD5' },
  ],
  placeholder: 'Text to hash',
  example: 'hello world',
  present: 'display',
  run: hashText,
})
