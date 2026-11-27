import { columns, hint, panel, range, stack, stats } from '../kit.ts'
import { codeBlock, defineTextTool, sourcePanel, useAsInput } from './ui.ts'

export const run = (text: string, mode: string): string => {
  return Array.from({ length: Number(mode) }, () => text).join('\n')
}

export const textRepeater = defineTextTool({
  meta: {
    id: 'text-repeater',
    name: 'Text repeater',
    category: 'text',
    description: 'Repeat a line of text 2, 5, 10, or 50 times.',
    keywords: ['repeat', 'duplicate', 'multiply'],
  },
  example: 'hi',
  opts: { times: '5' },
  render: (c) => {
    const { h } = c
    const times = Number(c.opt('times', '5'))
    const value = c.input === '' ? '' : run(c.input, String(times))
    return h.div(
      [h.Class(stack)],
      [
        columns(h, [
          sourcePanel(c, { label: 'Text', rows: 4 }),
          panel(h, `Repeat ${times} times`, [
            range(h, {
              id: 'text-repeater-times',
              min: 1,
              max: 100,
              value: times,
              onInput: (next) => c.setOpt('times')(String(next)),
            }),
            value === '' ? hint(h, 'Enter text to repeat.') : codeBlock(h, 'Result', value),
            value === ''
              ? null
              : stats(h, [
                  ['Lines', String(times * c.input.split('\n').length)],
                  ['Characters', String([...value].length)],
                ]),
            useAsInput(c, value),
          ]),
        ]),
      ],
    )
  },
})
