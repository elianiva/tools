import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const rate = Number(text.trim())
  if (text.trim() === '' || !Number.isFinite(rate) || rate <= 0)
    throw new Error('Enter a yearly rate above zero, such as 8.')
  return [
    `Rule of 72: ${(72 / rate).toFixed(2)} years`,
    `Exact: ${(Math.log(2) / Math.log(1 + rate / 100)).toFixed(2)} years`,
  ].join('\n')
}

export const ruleOf72 = defineTransform({
  meta: {
    id: 'rule-of-72',
    name: 'Rule of 72',
    category: 'calculate',
    description: 'Years to double your money at a yearly rate.',
    keywords: ['rule of 72', 'doubling time', 'compound', 'interest', 'investment'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: 'yearly rate %: 8',
  example: '8',
  fields: [{ label: 'Yearly rate', suffix: '%' }],
  run,
})
