export const FORMATS = [
  { id: 'png', label: 'PNG', mime: 'image/png', ext: 'png', lossy: false },
  { id: 'jpeg', label: 'JPG', mime: 'image/jpeg', ext: 'jpg', lossy: true },
  { id: 'webp', label: 'WebP', mime: 'image/webp', ext: 'webp', lossy: true },
  { id: 'avif', label: 'AVIF', mime: 'image/avif', ext: 'avif', lossy: true },
] as const

export type FormatId = (typeof FORMATS)[number]['id']

export const formatOf = (id: string) => FORMATS.find((format) => format.id === id) ?? FORMATS[0]

/** `holiday.HEIC` converted to JPG becomes `holiday.jpg`. */
export const outputName = (name: string, ext: string): string => {
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  return `${base}.${ext}`
}

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`
}

/** Positive when the output is smaller, negative when it grew. */
export const savedPercent = (before: number, after: number): number =>
  before === 0 ? 0 : Math.round(((before - after) / before) * 100)

export type Sniffed = 'png' | 'jpeg' | 'webp' | 'gif' | 'bmp' | 'avif' | 'heic' | 'unknown'

const ascii = (bytes: Uint8Array, from: number, to: number): string =>
  String.fromCharCode(...bytes.slice(from, to))

/** The format a file really is, read from its first bytes. A name can lie. */
export const sniff = (bytes: Uint8Array): Sniffed => {
  if (bytes[0] === 0x89 && ascii(bytes, 1, 4) === 'PNG') return 'png'
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpeg'
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'webp'
  if (ascii(bytes, 0, 3) === 'GIF') return 'gif'
  if (ascii(bytes, 0, 2) === 'BM') return 'bmp'
  if (ascii(bytes, 4, 8) === 'ftyp') {
    // AVIF and HEIC share the container. An AVIF file can also list `mif1`, so check it first.
    const brands = [
      ascii(bytes, 8, 12),
      ascii(bytes, 16, 20),
      ascii(bytes, 20, 24),
      ascii(bytes, 24, 28),
    ]
    if (brands.some((brand) => brand === 'avif' || brand === 'avis')) return 'avif'
    const heic = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1']
    if (brands.some((brand) => heic.includes(brand))) return 'heic'
  }
  return 'unknown'
}

/** Scales `width × height` down so neither side passes `maxSide` and the area stays under `maxPixels`. */
export const fitSize = (
  width: number,
  height: number,
  maxWidth: number,
  maxPixels: number,
): Readonly<{ width: number; height: number; scaled: boolean }> => {
  let factor = 1
  if (maxWidth > 0 && width > maxWidth) factor = maxWidth / width
  if (width * height * factor * factor > maxPixels) {
    factor = Math.sqrt(maxPixels / (width * height))
  }
  return factor === 1
    ? { width, height, scaled: false }
    : {
        width: Math.max(1, Math.floor(width * factor)),
        height: Math.max(1, Math.floor(height * factor)),
        scaled: true,
      }
}
