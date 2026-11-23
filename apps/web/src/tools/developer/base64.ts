import { defineTransform } from '../transform.ts'
import { runBase64 } from './base64.logic.ts'

export const base64 = defineTransform({
  meta: {
    id: 'base64',
    name: 'Base64',
    category: 'developer',
    description: 'Encode and decode text as Base64, standard or URL-safe.',
    keywords: ['encode', 'decode', 'base64url', 'utf-8'],
  },
  modes: [
    { id: 'encode', label: 'Encode' },
    { id: 'decode', label: 'Decode' },
    { id: 'encode-url', label: 'Encode URL-safe' },
  ],
  placeholder: 'Text to encode, or Base64 to decode',
  run: runBase64,
})
