import type { Tool } from './tool.ts'
import { categoryName } from './tool.ts'

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
