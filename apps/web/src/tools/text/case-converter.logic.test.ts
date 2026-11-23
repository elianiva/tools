import { describe, expect, it } from 'vitest'
import { convertCase, wordsOf } from './case-converter.logic.ts'

describe('wordsOf', () => {
  it('splits every common style', () => {
    expect(wordsOf('fooBarBaz')).toEqual(['foo', 'Bar', 'Baz'])
    expect(wordsOf('foo_bar-baz qux')).toEqual(['foo', 'bar', 'baz', 'qux'])
    expect(wordsOf('HTTPServer2Go')).toEqual(['HTTP', 'Server2', 'Go'])
  })
})

describe('convertCase', () => {
  it('converts identifiers line by line', () => {
    expect(convertCase('Hello big world\nsome_other-thing', 'camel')).toBe(
      'helloBigWorld\nsomeOtherThing',
    )
    expect(convertCase('helloWorld', 'snake')).toBe('hello_world')
    expect(convertCase('hello world', 'pascal')).toBe('HelloWorld')
    expect(convertCase('hello world', 'kebab')).toBe('hello-world')
    expect(convertCase('helloWorld', 'constant')).toBe('HELLO_WORLD')
  })

  it('capitalises sentences and titles without touching apostrophes', () => {
    expect(convertCase('hello there. how ARE you? fine!', 'sentence')).toBe(
      'Hello there. How are you? Fine!',
    )
    expect(convertCase("don't STOP me now", 'title')).toBe("Don't Stop Me Now")
  })

  it('keeps accented letters whole', () => {
    expect(convertCase('élan vital', 'title')).toBe('Élan Vital')
  })
})
