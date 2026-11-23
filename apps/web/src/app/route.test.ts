import { describe, expect, it } from 'vitest'
import { AppRoute, pathOf, urlOf, urlToRoute } from './route.ts'

describe('routes', () => {
  it('parses the home page, a category, and a tool', () => {
    expect(urlToRoute(urlOf('/'))).toEqual(AppRoute.Home())
    expect(urlToRoute(urlOf('/images'))).toEqual(AppRoute.Category({ category: 'images' }))
    expect(urlToRoute(urlOf('/text/word-counter'))).toEqual(
      AppRoute.Tool({ category: 'text', id: 'word-counter' }),
    )
  })

  it('keeps an unknown deep path as NotFound', () => {
    expect(urlToRoute(urlOf('/a/b/c'))._tag).toBe('NotFound')
  })

  it('builds the same path it parsed', () => {
    for (const path of ['/', '/images', '/text/word-counter']) {
      expect(pathOf(urlToRoute(urlOf(path)))).toBe(path)
    }
  })
})
