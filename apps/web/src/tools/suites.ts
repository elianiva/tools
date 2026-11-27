// Related tools grouped onto one page each. A tool listed here keeps its own logic and tests;
// the suite only gives it a place next to its neighbours.
import { acronym } from './text/acronym.ts'
import { ageCalculator } from './calculate/age-calculator.ts'
import { anagramChecker } from './text/anagram-checker.ts'
import { angle } from './convert/angle.ts'
import { aspectRatio } from './calculate/aspect-ratio.ts'
import { base32 } from './developer/base32.ts'
import { base64 } from './developer/base64.ts'
import { baseConverter } from './convert/base-converter.ts'
import { binaryText } from './text/binary-text.ts'
import { bitwise } from './developer/bitwise.ts'
import { bmiCalculator } from './calculate/bmi-calculator.ts'
import { bmr } from './calculate/bmr.ts'
import { breakEven } from './calculate/break-even.ts'
import { bulletList } from './text/bullet-list.ts'
import { caesarCipher } from './text/caesar-cipher.ts'
import { cagr } from './calculate/cagr.ts'
import { caseConverter } from './text/case-converter.ts'
import { charCodes } from './developer/char-codes.ts'
import { characterFrequency } from './text/character-frequency.ts'
import { checksums } from './developer/checksums.ts'
import { chmod } from './developer/chmod.ts'
import { cipher } from './text/cipher.ts'
import { circle } from './calculate/circle.ts'
import { clockFormat } from './convert/clock-format.ts'
import { cmyk } from './convert/cmyk.ts'
import { coinFlip } from './generate/coin-flip.ts'
import { color } from './convert/color.ts'
import { combinatorics } from './calculate/combinatorics.ts'
import { compoundInterest } from './calculate/compound-interest.ts'
import { contrastChecker } from './developer/contrast-checker.ts'
import { cssMinifier } from './developer/css-minifier.ts'
import { csvJson } from './developer/csv-json.ts'
import { dateDifference } from './calculate/date-difference.ts'
import { diceRoller } from './generate/dice-roller.ts'
import { discountCalculator } from './calculate/discount-calculator.ts'
import { duplicateWords } from './text/duplicate-words.ts'
import { duration } from './convert/duration.ts'
import { editDistance } from './text/edit-distance.ts'
import { electricityCost } from './calculate/electricity-cost.ts'
import { emojiRemover } from './text/emoji-remover.ts'
import { envJson } from './developer/env-json.ts'
import { escapeString } from './developer/escape-string.ts'
import { excelColumn } from './convert/excel-column.ts'
import { extractData } from './text/extract-data.ts'
import { factorial } from './calculate/factorial.ts'
import { fancyText } from './text/fancy-text.ts'
import { fibonacci } from './calculate/fibonacci.ts'
import { findReplace } from './text/find-replace.ts'
import { fractionDecimal } from './convert/fraction-decimal.ts'
import { fuelCost } from './calculate/fuel-cost.ts'
import { gcdLcm } from './calculate/gcd-lcm.ts'
import { hash } from './developer/hash.ts'
import { hexText } from './text/hex-text.ts'
import { hoursDecimal } from './convert/hours-decimal.ts'
import { htmlEntities } from './developer/html-entities.ts'
import { htmlToText } from './text/html-to-text.ts'
import { httpStatus } from './developer/http-status.ts'
import { indent } from './text/indent.ts'
import { jsonFormatter } from './developer/json-formatter.ts'
import { jsonToTypescript } from './developer/json-to-typescript.ts'
import { jsonl } from './developer/jsonl.ts'
import { leapYear } from './calculate/leap-year.ts'
import { leetspeak } from './text/leetspeak.ts'
import { lineTools } from './text/line-tools.ts'
import { listConverter } from './text/list-converter.ts'
import { loanCalculator } from './calculate/loan-calculator.ts'
import { logarithm } from './calculate/logarithm.ts'
import { markdownToHtml } from './developer/markdown-to-html.ts'
import { markdownToc } from './text/markdown-toc.ts'
import { markupMargin } from './calculate/markup-margin.ts'
import { mimeTypes } from './developer/mime-types.ts'
import { morseCode } from './text/morse-code.ts'
import { natoAlphabet } from './text/nato-alphabet.ts'
import { numberFormat } from './convert/number-format.ts'
import { numberStats } from './calculate/number-stats.ts'
import { numberToWords } from './convert/number-to-words.ts'
import { ordinalNumbers } from './convert/ordinal-numbers.ts'
import { pace } from './convert/pace.ts'
import { palindrome } from './text/palindrome.ts'
import { passwordGenerator } from './generate/password.ts'
import { passwordStrength } from './developer/password-strength.ts'
import { percentageCalculator } from './calculate/percentage.ts'
import { pigLatin } from './text/pig-latin.ts'
import { portNumbers } from './developer/port-numbers.ts'
import { pph21 } from './calculate/pph21.ts'
import { primeFactors } from './calculate/prime-factors.ts'
import { pxRem } from './convert/px-rem.ts'
import { pythagorean } from './calculate/pythagorean.ts'
import { quadratic } from './calculate/quadratic.ts'
import { randomColor } from './generate/random-color.ts'
import { randomNumber } from './generate/random-number.ts'
import { randomPicker } from './generate/random-picker.ts'
import { randomString } from './generate/random-string.ts'
import { ratioSimplifier } from './calculate/ratio-simplifier.ts'
import { readability } from './text/readability.ts'
import { removeAccents } from './text/remove-accents.ts'
import { removeLineBreaks } from './text/remove-line-breaks.ts'
import { reverseText } from './text/reverse-text.ts'
import { roi } from './calculate/roi.ts'
import { romanNumerals } from './convert/roman-numerals.ts'
import { ruleOf72 } from './calculate/rule-of-72.ts'
import { salary } from './calculate/salary.ts'
import { scientificNotation } from './convert/scientific-notation.ts'
import { sentenceSplitter } from './text/sentence-splitter.ts'
import { simpleInterest } from './calculate/simple-interest.ts'
import { slope } from './calculate/slope.ts'
import { slug } from './text/slug.ts'
import { smartQuotes } from './text/smart-quotes.ts'
import { sortWords } from './text/sort-words.ts'
import { speed } from './convert/speed.ts'
import { sphere } from './calculate/sphere.ts'
import { squareRoot } from './calculate/square-root.ts'
import { strikethrough } from './text/strikethrough.ts'
import { subnet } from './developer/subnet.ts'
import { terbilang } from './convert/terbilang.ts'
import { textDiff } from './text/diff.ts'
import { textRepeater } from './text/text-repeater.ts'
import { textWrap } from './text/text-wrap.ts'
import { timeAdd } from './calculate/time-add.ts'
import { timestamp } from './convert/timestamp.ts'
import { timezones } from './convert/timezones.ts'
import { tipCalculator } from './calculate/tip-calculator.ts'
import { titleCase } from './text/title-case.ts'
import { triangle } from './calculate/triangle.ts'
import { unicodeInspector } from './developer/unicode-inspector.ts'
import { unicodeNormalize } from './text/unicode-normalize.ts'
import { units } from './convert/units.ts'
import { upsideDown } from './text/upside-down.ts'
import { urlEncoder } from './developer/url-encoder.ts'
import { urlParser } from './developer/url-parser.ts'
import { uuidGenerator } from './generate/uuid-generator.ts'
import { vatCalculator } from './calculate/vat-calculator.ts'
import { vowelCounter } from './text/vowel-counter.ts'
import { weekday } from './calculate/weekday.ts'
import { weightedAverage } from './calculate/weighted-average.ts'
import { whitespaceCleaner } from './text/whitespace-cleaner.ts'
import { wordCounter } from './text/word-counter.ts'
import { wordFrequency } from './text/word-frequency.ts'
import { workHours } from './calculate/work-hours.ts'
import { yamlJson } from './developer/yaml-json.ts'
import { zodiac } from './calculate/zodiac.ts'
import { defineSuite, type Suite } from './suite.ts'
import type { CategoryId, Tool } from './tool.ts'

const suite = (
  id: string,
  name: string,
  category: CategoryId,
  description: string,
  tools: ReadonlyArray<Tool>,
) => defineSuite({ meta: { id, name, category, description }, tools })

export const suites: ReadonlyArray<Suite> = [
  suite(
    'text-statistics',
    'Text statistics',
    'text',
    'Count words, letters, vowels, and sentences, and score readability.',
    [
      wordCounter,
      characterFrequency,
      wordFrequency,
      vowelCounter,
      readability,
      sentenceSplitter,
      duplicateWords,
    ],
  ),
  suite(
    'text-case',
    'Case and slugs',
    'text',
    'Change letter case, title-case a heading, or make a URL slug.',
    [caseConverter, titleCase, slug],
  ),
  suite(
    'clean-text',
    'Clean text',
    'text',
    'Remove extra spaces, line breaks, accents, emoji, and markup.',
    [
      whitespaceCleaner,
      removeLineBreaks,
      removeAccents,
      unicodeNormalize,
      emojiRemover,
      smartQuotes,
      htmlToText,
    ],
  ),
  suite(
    'lines-lists',
    'Lines and lists',
    'text',
    'Sort, reverse, repeat, and convert lines and lists.',
    [lineTools, sortWords, listConverter, bulletList, reverseText, textRepeater],
  ),
  suite(
    'format-text',
    'Format text',
    'text',
    'Find and replace, indent, wrap, extract data, and build a contents list.',
    [findReplace, indent, textWrap, extractData, markdownToc],
  ),
  suite(
    'text-encodings',
    'Text encodings',
    'text',
    'Turn text into binary, hex, Morse code, or the NATO alphabet and back.',
    [binaryText, hexText, morseCode, natoAlphabet],
  ),
  suite('ciphers', 'Ciphers', 'text', 'Encode and decode with a Caesar shift or a simple cipher.', [
    caesarCipher,
    cipher,
  ]),
  suite(
    'fun-text',
    'Fun text',
    'text',
    'Fancy fonts, upside-down text, strikethrough, leetspeak, and Pig Latin.',
    [fancyText, upsideDown, strikethrough, leetspeak, pigLatin, acronym],
  ),
  suite(
    'text-compare',
    'Compare text',
    'text',
    'Diff two texts, measure edit distance, and check anagrams and palindromes.',
    [textDiff, editDistance, anagramChecker, palindrome],
  ),
  suite(
    'encode-decode',
    'Encode and decode',
    'developer',
    'Base64, Base32, URL, HTML entities, string escapes, and character codes.',
    [base64, base32, urlEncoder, htmlEntities, escapeString, charCodes, unicodeInspector],
  ),
  suite(
    'data-formats',
    'Data formats',
    'developer',
    'Format and convert JSON, YAML, CSV, .env, and JSON Lines.',
    [jsonFormatter, yamlJson, csvJson, envJson, jsonl, jsonToTypescript],
  ),
  suite(
    'hashing',
    'Hashes and checksums',
    'developer',
    'SHA and MD5 hashes, CRC32, and Adler-32.',
    [hash, checksums],
  ),
  suite(
    'web-reference',
    'Web reference',
    'developer',
    'Parse a URL, and look up HTTP status codes, MIME types, and ports.',
    [urlParser, httpStatus, mimeTypes, portNumbers],
  ),
  suite('markup', 'Markdown and CSS', 'developer', 'Render Markdown as HTML and minify CSS.', [
    markdownToHtml,
    cssMinifier,
  ]),
  suite(
    'bits-networks',
    'Bits and networks',
    'developer',
    'Bitwise operations, file permissions, and subnets.',
    [bitwise, chmod, subnet],
  ),
  suite('units', 'Units', 'convert', 'Length, weight, speed, angle, pace, and CSS pixels to rem.', [
    units,
    speed,
    angle,
    pace,
    pxRem,
  ]),
  suite(
    'numbers-in-words',
    'Numbers in words',
    'convert',
    'Spell out numbers, and write Roman numerals, ordinals, and spreadsheet columns.',
    [numberToWords, terbilang, romanNumerals, ordinalNumbers, excelColumn],
  ),
  suite(
    'number-formats',
    'Number formats',
    'convert',
    'Change base, fraction, scientific notation, or locale format.',
    [baseConverter, fractionDecimal, scientificNotation, numberFormat],
  ),
  suite('colors', 'Colors', 'convert', 'Convert colors, work in CMYK, and check contrast.', [
    color,
    cmyk,
    contrastChecker,
  ]),
  suite('time', 'Time', 'convert', 'Timestamps, time zones, durations, and clock formats.', [
    timestamp,
    timezones,
    duration,
    clockFormat,
    hoursDecimal,
  ]),
  suite(
    'geometry',
    'Geometry',
    'calculate',
    'Circles, spheres, triangles, slopes, and aspect ratios.',
    [circle, sphere, triangle, pythagorean, slope, aspectRatio],
  ),
  suite('algebra', 'Algebra', 'calculate', 'Roots, logarithms, and quadratic equations.', [
    squareRoot,
    logarithm,
    quadratic,
  ]),
  suite(
    'number-theory',
    'Number theory',
    'calculate',
    'Factorials, Fibonacci, primes, GCD, LCM, and combinations.',
    [factorial, fibonacci, combinatorics, primeFactors, gcdLcm, ratioSimplifier],
  ),
  suite(
    'statistics',
    'Statistics and percentages',
    'calculate',
    'Averages, spread, weighted means, and percentages.',
    [numberStats, weightedAverage, percentageCalculator],
  ),
  suite(
    'growth',
    'Interest and growth',
    'calculate',
    'Simple and compound interest, CAGR, ROI, and the rule of 72.',
    [simpleInterest, compoundInterest, cagr, roi, ruleOf72],
  ),
  suite(
    'pricing',
    'Prices and costs',
    'calculate',
    'Discounts, VAT, tips, margins, break-even, and running costs.',
    [
      discountCalculator,
      vatCalculator,
      tipCalculator,
      markupMargin,
      breakEven,
      electricityCost,
      fuelCost,
    ],
  ),
  suite(
    'pay-loans',
    'Loans and pay',
    'calculate',
    'Loan payments, salary conversion, and Indonesian income tax.',
    [loanCalculator, salary, pph21],
  ),
  suite('health', 'Body metrics', 'calculate', 'BMI and daily calorie needs.', [
    bmiCalculator,
    bmr,
  ]),
  suite(
    'dates',
    'Dates and time math',
    'calculate',
    'Date differences, ages, weekdays, leap years, signs, and time sums.',
    [dateDifference, ageCalculator, weekday, leapYear, zodiac, timeAdd, workHours],
  ),
  suite('random', 'Random picks', 'generate', 'Numbers, coins, dice, picks, and colors.', [
    randomNumber,
    coinFlip,
    diceRoller,
    randomPicker,
    randomColor,
  ]),
  suite(
    'secrets',
    'Passwords and IDs',
    'generate',
    'Passwords, strength checks, random strings, and UUIDs.',
    [passwordGenerator, passwordStrength, randomString, uuidGenerator],
  ),
]
