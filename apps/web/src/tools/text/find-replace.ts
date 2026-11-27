import { columns, field, hint, panel, stack, stats, textInput } from '../kit.ts'
import {
  attempt,
  changePieces,
  defineTextTool,
  errorLine,
  marked,
  modePicker,
  sourcePanel,
  useAsInput,
  type Piece,
} from './ui.ts'

export const run = (text: string, mode: string): string => {
  const [first = '', ...rest] = text.split('\n')
  const arrow = first.indexOf(' => ')
  if (arrow === -1) throw new Error('Put find => replace on the first line, then the text below.')
  const find = first.slice(0, arrow)
  const replacement = first.slice(arrow + 4)
  if (find === '') throw new Error('The find part is empty.')
  const body = rest.join('\n')
  if (mode === 'regex') {
    let pattern: RegExp
    try {
      pattern = new RegExp(find, 'gu')
    } catch {
      throw new Error('This is not a valid pattern.')
    }
    return body.replace(pattern, replacement)
  }
  return body.replaceAll(find, () => replacement)
}

const matchesOf = (
  body: string,
  find: string,
  mode: string,
): ReadonlyArray<readonly [number, number]> => {
  if (find === '') return []
  if (mode === 'regex') {
    try {
      return [...body.matchAll(new RegExp(find, 'gu'))]
        .filter((match) => match[0] !== '')
        .map((match) => [match.index, match.index + match[0].length] as const)
    } catch {
      return []
    }
  }
  const found: Array<readonly [number, number]> = []
  for (let at = body.indexOf(find); at !== -1; at = body.indexOf(find, at + find.length))
    found.push([at, at + find.length])
  return found
}

const pieces = (
  body: string,
  found: ReadonlyArray<readonly [number, number]>,
): ReadonlyArray<Piece> => {
  const out: Array<Piece> = []
  let at = 0
  for (const [start, end] of found) {
    out.push({ text: body.slice(at, start) }, { text: body.slice(start, end), kind: 'hit' })
    at = end
  }
  out.push({ text: body.slice(at) })
  return out
}

export const findReplace = defineTextTool({
  meta: {
    id: 'find-replace',
    name: 'Find and replace',
    category: 'text',
    description: 'Put find => replace on the first line, then the text below.',
    keywords: ['find', 'replace', 'substitute', 'regex', 'search'],
  },
  mode: 'plain',
  example: 'the cat sat on a cat',
  opts: { find: 'cat', replace: 'dog' },
  files: true,
  render: (c) => {
    const { h } = c
    const find = c.opt('find', '')
    const replace = c.opt('replace', '')
    const found = matchesOf(c.input, find, c.mode)
    const result = attempt(() =>
      find === '' ? '' : run(`${find} => ${replace}\n${c.input}`, c.mode),
    )
    return h.div(
      [h.Class(stack)],
      [
        modePicker(c, [
          { value: 'plain', label: 'Plain text' },
          { value: 'regex', label: 'Regular expression' },
        ]),
        columns(h, [
          panel(h, null, [
            field(
              h,
              { label: 'Find', for: 'find-replace-find' },
              textInput(h, { id: 'find-replace-find', value: find, onInput: c.setOpt('find') }),
            ),
            field(
              h,
              { label: 'Replace with', for: 'find-replace-with' },
              textInput(h, {
                id: 'find-replace-with',
                value: replace,
                onInput: c.setOpt('replace'),
              }),
            ),
          ]),
          sourcePanel(c, { label: 'Text' }),
        ]),
        panel(h, 'Matches', [
          find === ''
            ? hint(h, 'Enter text to find.')
            : h.div(
                [h.Class(stack)],
                [
                  stats(h, [['Matches', String(found.length)]]),
                  marked(h, 'Text with matches highlighted', pieces(c.input, found)),
                ],
              ),
        ]),
        result.value === '' && result.error === ''
          ? null
          : panel(h, 'Result', [
              errorLine(c, result.error),
              result.value === ''
                ? null
                : marked(h, 'Result', changePieces(c.input, result.value), result.value),
              useAsInput(c, result.value),
            ]),
      ],
    )
  },
})
