import { describe, expect, it } from 'vitest'
import { run } from './csv-json.ts'

describe('csv-json', () => {
  it('case 1', () => {
    expect(run('a,b\n1,"x,y"\n2,"say ""hi"""', 'csv-to-json')).toBe(
      JSON.stringify(
        [
          { a: '1', b: 'x,y' },
          { a: '2', b: 'say "hi"' },
        ],
        null,
        2,
      ),
    )
  })
  it('case 2', () => {
    expect(run('a;b\n1;2', 'csv-to-json')).toBe(JSON.stringify([{ a: '1', b: '2' }], null, 2))
  })
  it('case 3', () => {
    expect(run('a\tb\r\n1\t2', 'csv-to-json')).toBe(JSON.stringify([{ a: '1', b: '2' }], null, 2))
  })
  it('case 4', () => {
    expect(run('[{"a":1,"b":"x,y"},{"a":2}]', 'json-to-csv')).toBe('a,b\n1,"x,y"\n2,')
  })
  it('case 5', () => {
    expect(run('a,b\n1,2', 'csv-to-markdown')).toBe('| a | b |\n| --- | --- |\n| 1 | 2 |')
  })
  it('case 6', () => {
    expect(() => run('{"a":1}', 'json-to-csv')).toThrow('array of objects')
  })
})
