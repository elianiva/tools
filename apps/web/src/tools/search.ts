import type { Tool } from './tool.ts'
import { CATEGORIES, categoryName } from './tool.ts'

const words = (text: string): ReadonlyArray<string> =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word !== '')

// How well one query word fits a tool. Higher is better; zero means no match.
const scoreWord = (word: string, tool: Tool): number => {
  const name = tool.meta.name.toLowerCase()
  const nameWords = words(name)
  if (name.startsWith(word)) return 100
  if (nameWords.some((candidate) => candidate.startsWith(word))) return 80
  if (name.includes(word)) return 60
  if (tool.meta.keywords.some((keyword) => keyword.toLowerCase().includes(word))) return 40
  if (categoryName(tool.meta.category).toLowerCase().startsWith(word)) return 30
  if (tool.meta.description.toLowerCase().includes(word)) return 15
  return 0
}

/** Every query word must match something. Tools come back best first, then in registry order. */
export const searchTools = (tools: ReadonlyArray<Tool>, query: string): ReadonlyArray<Tool> => {
  const queryWords = words(query)
  if (queryWords.length === 0) return tools
  return tools
    .map((tool, index) => {
      const scores = queryWords.map((word) => scoreWord(word, tool))
      return {
        tool,
        index,
        score: scores.includes(0) ? 0 : scores.reduce((sum, score) => sum + score, 0),
      }
    })
    .filter(({ score }) => score > 0)
    .toSorted((a, b) => b.score - a.score || a.index - b.index)
    .map(({ tool }) => tool)
}

/** Tools kept in registry order, grouped by category for the palette. */
export const groupTools = (
  tools: ReadonlyArray<Tool>,
): ReadonlyArray<Readonly<{ name: string; tools: ReadonlyArray<Tool> }>> =>
  CATEGORIES.flatMap((category) => {
    const matching = tools.filter((tool) => tool.meta.category === category.id)
    return matching.length === 0 ? [] : [{ name: category.name, tools: matching }]
  })

/**
 * Search hits grouped by category, with the category of the best hit first.
 * The ranks inside a group stay as the search ranked them, so the top result
 * of the whole search is the first row the palette shows.
 */
export const groupByBestMatch = (
  tools: ReadonlyArray<Tool>,
): ReadonlyArray<Readonly<{ name: string; tools: ReadonlyArray<Tool> }>> => {
  const groups = new Map<string, { name: string; tools: Array<Tool> }>()
  for (const tool of tools) {
    const name = categoryName(tool.meta.category)
    const group = groups.get(name)
    if (group === undefined) groups.set(name, { name, tools: [tool] })
    else group.tools.push(tool)
  }
  return [...groups.values()]
}

export type Highlight = Readonly<{ text: string; match: boolean }>

const merge = (ranges: ReadonlyArray<readonly [number, number]>): ReadonlyArray<[number, number]> =>
  ranges
    .toSorted((a, b) => a[0] - b[0])
    .reduce<Array<[number, number]>>((merged, [start, end]) => {
      const last = merged.at(-1)
      if (last !== undefined && start <= last[1]) last[1] = Math.max(last[1], end)
      else merged.push([start, end])
      return merged
    }, [])

/**
 * The parts of `text` that the query matched, so the palette can mark them.
 * Only the first place each query word appears is marked: enough to show why a
 * result is in the list, and never a scatter of single letters.
 */
export const highlight = (text: string, query: string): ReadonlyArray<Highlight> => {
  const lower = text.toLowerCase()
  // A lowercase that changes length makes every index wrong. Show the text plain.
  if (lower.length !== text.length) return [{ text, match: false }]
  const ranges = words(query).flatMap((word): ReadonlyArray<[number, number]> => {
    const start = lower.indexOf(word)
    return start === -1 ? [] : [[start, start + word.length]]
  })
  const pieces: Array<Highlight> = []
  let at = 0
  for (const [start, end] of merge(ranges)) {
    if (start > at) pieces.push({ text: text.slice(at, start), match: false })
    pieces.push({ text: text.slice(start, end), match: true })
    at = end
  }
  if (at < text.length) pieces.push({ text: text.slice(at), match: false })
  return pieces.length === 0 ? [{ text, match: false }] : pieces
}
