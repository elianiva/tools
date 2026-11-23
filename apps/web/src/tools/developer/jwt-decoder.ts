import { defineTransform } from '../transform.ts'
import { decodeJwt } from './jwt-decoder.logic.ts'

export const jwtDecoder = defineTransform({
  meta: {
    id: 'jwt-decoder',
    name: 'JWT decoder',
    category: 'developer',
    description: 'Read the header, claims, and expiry of a JSON Web Token.',
    keywords: ['jwt', 'token', 'bearer', 'claims', 'auth', 'json web token'],
  },
  modes: [{ id: 'decode', label: 'Decode' }],
  placeholder: 'eyJhbGciOi…',
  run: (text) => decodeJwt(text),
})
