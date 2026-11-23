export const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
} as const

export type SetId = keyof typeof SETS

export const SET_IDS = Object.keys(SETS) as ReadonlyArray<SetId>

/** A uniform integer in `[0, max)` from the system's random source. Rejection sampling avoids modulo bias. */
export const secureInt = (max: number): number => {
  const limit = Math.floor(0x1_0000_0000 / max) * max
  const buffer = new Uint32Array(1)
  for (;;) {
    crypto.getRandomValues(buffer)
    const value = buffer[0] ?? 0
    if (value < limit) return value % max
  }
}

/** At least one character from every chosen set, then shuffled so the guarantee is not visible. */
export const generatePassword = (
  length: number,
  sets: ReadonlyArray<SetId>,
  randomInt: (max: number) => number,
): string => {
  if (sets.length === 0) throw new Error('Choose at least one kind of character.')
  const pick = (chars: string): string => chars.charAt(randomInt(chars.length))
  const pool = sets.map((id) => SETS[id]).join('')
  const chars = sets.map((id) => pick(SETS[id]))
  while (chars.length < length) chars.push(pick(pool))
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1)
    const swap = chars[i] ?? ''
    chars[i] = chars[j] ?? ''
    chars[j] = swap
  }
  return chars.slice(0, length).join('')
}

export const entropyBits = (length: number, sets: ReadonlyArray<SetId>): number =>
  sets.length === 0 ? 0 : Math.floor(length * Math.log2(sets.map((id) => SETS[id]).join('').length))
