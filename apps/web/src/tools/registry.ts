import type { CategoryId, Tool } from './tool.ts'

/** Every tool on the site. One line per tool; the palette, sidebar, home and routes all read this. */
export const tools: ReadonlyArray<Tool> = []

export const toolOf = (category: string, id: string): Tool | undefined =>
  tools.find((tool) => tool.meta.category === category && tool.meta.id === id)

export const toolsIn = (category: CategoryId): ReadonlyArray<Tool> =>
  tools.filter((tool) => tool.meta.category === category)

export const pathOfTool = (tool: Tool): string => `/${tool.meta.category}/${tool.meta.id}`
