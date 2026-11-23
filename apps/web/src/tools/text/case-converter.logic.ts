/** Words of an identifier or sentence: `fooBar`, `foo_bar`, `Foo bar` and `HTTPServer` all split. */
export const wordsOf = (text: string): ReadonlyArray<string> =>
  text
    .replaceAll(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2')
    .replaceAll(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word !== '')

const capital = (word: string): string =>
  word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()

const title = (text: string): string =>
  text.toLocaleLowerCase().replaceAll(/\p{L}[\p{L}\p{N}']*/gu, (word) => capital(word))

const sentence = (text: string): string =>
  text
    .toLocaleLowerCase()
    .replaceAll(
      /(^|[.!?]\s+)(\p{L})/gu,
      (_, lead: string, letter: string) => lead + letter.toLocaleUpperCase(),
    )

const identifier = (line: string, mode: string): string => {
  const words = wordsOf(line)
  switch (mode) {
    case 'camel':
      return words.map((word, i) => (i === 0 ? word.toLocaleLowerCase() : capital(word))).join('')
    case 'pascal':
      return words.map(capital).join('')
    case 'snake':
      return words.map((word) => word.toLocaleLowerCase()).join('_')
    case 'kebab':
      return words.map((word) => word.toLocaleLowerCase()).join('-')
    default:
      return words.map((word) => word.toLocaleUpperCase()).join('_')
  }
}

export const convertCase = (text: string, mode: string): string => {
  switch (mode) {
    case 'upper':
      return text.toLocaleUpperCase()
    case 'lower':
      return text.toLocaleLowerCase()
    case 'title':
      return title(text)
    case 'sentence':
      return sentence(text)
    default:
      // One identifier per line, so a list of names converts in one go.
      return text
        .split('\n')
        .map((line) => identifier(line, mode))
        .join('\n')
  }
}
