import { cron } from './developer/cron.ts'
import { jwtDecoder } from './developer/jwt-decoder.ts'
import { regexTester } from './developer/regex.ts'
import { semverCompare } from './developer/semver-compare.ts'
import { loremIpsum } from './generate/lorem-ipsum.ts'
import { qrCode } from './generate/qr.ts'
import { imageConverter } from './images/convert.ts'
import { pdfSuites } from './pdf/tools.ts'
import { suites } from './suites.ts'
import type { CategoryId, Tool } from './tool.ts'

/** Every tool on the site. The palette, sidebar, home and routes all read this. */
export const tools: ReadonlyArray<Tool> = [
  imageConverter,
  ...pdfSuites,
  ...suites,
  jwtDecoder,
  regexTester,
  cron,
  semverCompare,
  qrCode,
  loremIpsum,
]

/** The id a tool had before it joined a suite, mapped to the suite that holds it now. */
const suiteOfOldId = new Map(
  suites.flatMap((suite) => suite.variants.map((variant) => [variant.meta.id, suite] as const)),
)

/** The tool a saved or bookmarked id points to, including ids from before a tool joined a suite. */
export const toolById = (id: string): Tool | undefined =>
  tools.find((tool) => tool.meta.id === id) ?? suiteOfOldId.get(id)

export const toolOf = (category: string, id: string): Tool | undefined => {
  const tool = toolById(id)
  const old = suiteOfOldId.get(id)
  // An old URL keeps working under any category, so a link from before the merge still opens.
  return tool !== undefined && (tool.meta.category === category || old !== undefined)
    ? tool
    : undefined
}

export const toolsIn = (category: CategoryId): ReadonlyArray<Tool> =>
  tools.filter((tool) => tool.meta.category === category)

export const pathOfTool = (tool: Tool): string => `/${tool.meta.category}/${tool.meta.id}`
