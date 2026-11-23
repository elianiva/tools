import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const clean = text.trim().replaceAll(/[,_\s]/gu, '')
  const value = Number(clean)
  if (clean === '' || !Number.isFinite(value))
    throw new Error('Enter a number such as 1234567.891.')
  const locales: Readonly<Record<string, string>> = {
    en: 'en-US',
    de: 'de-DE',
    in: 'en-IN',
    id: 'id-ID',
  }
  return new Intl.NumberFormat(locales[mode] ?? 'en-US', { maximumFractionDigits: 20 }).format(
    value,
  )
}

export const numberFormat = defineTransform({
  meta: {
    id: 'number-format',
    name: 'Number formatter',
    category: 'convert',
    description: 'Group digits the way English, German, Indian, or Indonesian readers expect.',
    keywords: ['thousands separator', 'locale', 'format number', 'comma', 'lakh'],
  },
  modes: [
    { id: 'en', label: 'English' },
    { id: 'de', label: 'German' },
    { id: 'in', label: 'Indian' },
    { id: 'id', label: 'Indonesian' },
  ],
  placeholder: '1234567.891',
  example: '1234567.891',
  run,
})
