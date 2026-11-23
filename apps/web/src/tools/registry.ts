import { bmr } from './calculate/bmr.ts'
import { weightedAverage } from './calculate/weighted-average.ts'
import { workHours } from './calculate/work-hours.ts'
import { markupMargin } from './calculate/markup-margin.ts'
import { vatCalculator } from './calculate/vat-calculator.ts'
import { zodiac } from './calculate/zodiac.ts'
import { ordinalNumbers } from './convert/ordinal-numbers.ts'
import { speed } from './convert/speed.ts'
import { angle } from './convert/angle.ts'
import { checksums } from './developer/checksums.ts'
import { charCodes } from './developer/char-codes.ts'
import { semverCompare } from './developer/semver-compare.ts'
import { base32 } from './developer/base32.ts'
import { envJson } from './developer/env-json.ts'
import { jsonl } from './developer/jsonl.ts'
import { titleCase } from './text/title-case.ts'
import { strikethrough } from './text/strikethrough.ts'
import { palindrome } from './text/palindrome.ts'
import { acronym } from './text/acronym.ts'
import { bulletList } from './text/bullet-list.ts'
import { indent } from './text/indent.ts'
import { textWrap } from './text/text-wrap.ts'
import { numberStats } from './calculate/number-stats.ts'
import { numberFormat } from './convert/number-format.ts'
import { passwordStrength } from './developer/password-strength.ts'
import { pigLatin } from './text/pig-latin.ts'
import { caesarCipher } from './text/caesar-cipher.ts'
import { salary } from './calculate/salary.ts'
import { duration } from './convert/duration.ts'
import { timezones } from './convert/timezones.ts'
import { contrastChecker } from './developer/contrast-checker.ts'
import { cssMinifier } from './developer/css-minifier.ts'
import { subnet } from './developer/subnet.ts'
import { chmod } from './developer/chmod.ts'
import { httpStatus } from './developer/http-status.ts'
import { urlParser } from './developer/url-parser.ts'
import { jsonToTypescript } from './developer/json-to-typescript.ts'
import { diceRoller } from './generate/dice-roller.ts'
import { randomPicker } from './generate/random-picker.ts'
import { uuidGenerator } from './generate/uuid-generator.ts'
import { fractionDecimal } from './convert/fraction-decimal.ts'
import { pxRem } from './convert/px-rem.ts'
import { aspectRatio } from './calculate/aspect-ratio.ts'
import { baseConverter } from './convert/base-converter.ts'
import { primeFactors } from './calculate/prime-factors.ts'
import { gcdLcm } from './calculate/gcd-lcm.ts'
import { weekday } from './calculate/weekday.ts'
import { dateDifference } from './calculate/date-difference.ts'
import { compoundInterest } from './calculate/compound-interest.ts'
import { loanCalculator } from './calculate/loan-calculator.ts'
import { discountCalculator } from './calculate/discount-calculator.ts'
import { tipCalculator } from './calculate/tip-calculator.ts'
import { bmiCalculator } from './calculate/bmi-calculator.ts'
import { markdownToc } from './text/markdown-toc.ts'
import { removeLineBreaks } from './text/remove-line-breaks.ts'
import { smartQuotes } from './text/smart-quotes.ts'
import { sentenceSplitter } from './text/sentence-splitter.ts'
import { unicodeInspector } from './developer/unicode-inspector.ts'
import { leetspeak } from './text/leetspeak.ts'
import { natoAlphabet } from './text/nato-alphabet.ts'
import { escapeString } from './developer/escape-string.ts'
import { readability } from './text/readability.ts'
import { wordFrequency } from './text/word-frequency.ts'
import { characterFrequency } from './text/character-frequency.ts'
import { loremIpsum } from './generate/lorem-ipsum.ts'
import { listConverter } from './text/list-converter.ts'
import { csvJson } from './developer/csv-json.ts'
import { htmlToText } from './text/html-to-text.ts'
import { markdownToHtml } from './developer/markdown-to-html.ts'
import { htmlEntities } from './developer/html-entities.ts'
import { romanNumerals } from './convert/roman-numerals.ts'
import { numberToWords } from './convert/number-to-words.ts'
import { cipher } from './text/cipher.ts'
import { hexText } from './text/hex-text.ts'
import { binaryText } from './text/binary-text.ts'
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
  binaryText,
  hexText,
  cipher,
  numberToWords,
  romanNumerals,
  htmlEntities,
  markdownToHtml,
  htmlToText,
  csvJson,
  listConverter,
  loremIpsum,
  characterFrequency,
  wordFrequency,
  readability,
  escapeString,
  natoAlphabet,
  leetspeak,
  unicodeInspector,
  sentenceSplitter,
  smartQuotes,
  removeLineBreaks,
  markdownToc,
  bmiCalculator,
  tipCalculator,
  discountCalculator,
  loanCalculator,
  compoundInterest,
  dateDifference,
  weekday,
  gcdLcm,
  primeFactors,
  baseConverter,
  aspectRatio,
  pxRem,
  fractionDecimal,
  uuidGenerator,
  randomPicker,
  diceRoller,
  jsonToTypescript,
  urlParser,
  httpStatus,
  chmod,
  subnet,
  cssMinifier,
  contrastChecker,
  timezones,
  duration,
  salary,
  caesarCipher,
  pigLatin,
  passwordStrength,
  numberFormat,
  numberStats,
  textWrap,
  indent,
  bulletList,
  acronym,
  palindrome,
  strikethrough,
  titleCase,
  jsonl,
  envJson,
  base32,
  semverCompare,
  charCodes,
  checksums,
  angle,
  speed,
  ordinalNumbers,
  zodiac,
  vatCalculator,
  markupMargin,
  workHours,
  weightedAverage,
  bmr,
]

export const toolOf = (category: string, id: string): Tool | undefined =>
  tools.find((tool) => tool.meta.category === category && tool.meta.id === id)

export const toolsIn = (category: CategoryId): ReadonlyArray<Tool> =>
  tools.filter((tool) => tool.meta.category === category)

export const pathOfTool = (tool: Tool): string => `/${tool.meta.category}/${tool.meta.id}`
