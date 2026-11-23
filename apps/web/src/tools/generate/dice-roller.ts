import { secureInt } from './password.logic.ts'
import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const match = /^\s*(\d*)d(\d+)\s*([+-]\s*\d+)?\s*$/iu.exec(text)
  if (match === null) throw new Error('Write a roll like 2d6+3.')
  const count = match[1] === '' || match[1] === undefined ? 1 : Number(match[1])
  const sides = Number(match[2])
  const bonus = Number((match[3] ?? '0').replaceAll(/\s/gu, ''))
  if (count < 1 || count > 100 || sides < 2 || sides > 1000)
    throw new Error('Use 1 to 100 dice with 2 to 1000 sides.')
  const rolls = Array.from({ length: count }, () => secureInt(sides) + 1)
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + bonus
  return `Rolls: ${rolls.join(', ')}\nTotal: ${total}`
}

export const diceRoller = defineTransform({
  meta: {
    id: 'dice-roller',
    name: 'Dice roller',
    category: 'generate',
    description: 'Roll dice written like 2d6+3.',
    keywords: ['dice', 'd20', 'roll', 'rpg', 'tabletop', 'random'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '2d6+3',
  example: '2d6+3',
  run,
})
