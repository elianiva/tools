import { md5, sha1 } from '@noble/hashes/legacy.js'
import { sha256, sha512 } from '@noble/hashes/sha2.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'

const hashes: Readonly<Record<string, (bytes: Uint8Array) => Uint8Array>> = {
  md5,
  sha1,
  sha256,
  sha512,
}

export const hashText = (text: string, mode: string): string => {
  const hash = hashes[mode]
  if (hash === undefined) throw new Error('Unknown algorithm.')
  return bytesToHex(hash(utf8ToBytes(text)))
}
