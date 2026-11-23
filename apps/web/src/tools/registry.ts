import { morseCode } from './text/morse-code.ts'
import { upsideDown } from './text/upside-down.ts'
import { fancyText } from './text/fancy-text.ts'
import { removeAccents } from './text/remove-accents.ts'
import { extractData } from './text/extract-data.ts'
import { sortWords } from './text/sort-words.ts'
import { textRepeater } from './text/text-repeater.ts'
import { whitespaceCleaner } from './text/whitespace-cleaner.ts'
import { reverseText } from './text/reverse-text.ts'
import { passwordGenerator } from './generate/password.ts'
import { qrCode } from './generate/qr.ts'
import { textDiff } from './text/diff.ts'
import { regexTester } from './developer/regex.ts'
import { percentageCalculator } from './calculate/percentage.ts'
import { units } from './convert/units.ts'
import { slug } from './text/slug.ts'
import { cron } from './developer/cron.ts'
import { timestamp } from './convert/timestamp.ts'
import { color } from './convert/color.ts'
import { yamlJson } from './developer/yaml-json.ts'
import { hash } from './developer/hash.ts'
import { jwtDecoder } from './developer/jwt-decoder.ts'
import { lineTools } from './text/line-tools.ts'
import { caseConverter } from './text/case-converter.ts'
import { urlEncoder } from './developer/url-encoder.ts'
import { base64 } from './developer/base64.ts'
import { jsonFormatter } from './developer/json-formatter.ts'
import { imageConverter } from './images/convert.ts'
import { wordCounter } from './text/word-counter.ts'
import type { CategoryId, Tool } from './tool.ts'

/** Every tool on the site. One line per tool; the palette, sidebar, home and routes all read this. */
export const tools: ReadonlyArray<Tool> = [
  imageConverter,
  wordCounter,
  jsonFormatter,
  base64,
  urlEncoder,
  caseConverter,
  lineTools,
  jwtDecoder,
  hash,
  yamlJson,
  color,
  timestamp,
  cron,
  slug,
  units,
  percentageCalculator,
  regexTester,
  textDiff,
  qrCode,
  passwordGenerator,
  reverseText,
  whitespaceCleaner,
  textRepeater,
  sortWords,
  extractData,
  removeAccents,
  fancyText,
  upsideDown,
  morseCode,
]

export const toolOf = (category: string, id: string): Tool | undefined =>
  tools.find((tool) => tool.meta.category === category && tool.meta.id === id)

export const toolsIn = (category: CategoryId): ReadonlyArray<Tool> =>
  tools.filter((tool) => tool.meta.category === category)

export const pathOfTool = (tool: Tool): string => `/${tool.meta.category}/${tool.meta.id}`
