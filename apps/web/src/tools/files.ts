/** Whether a file fits one `accepts` pattern: `image/*`, `image/png`, or `.heic`. */
const fits = (file: File, pattern: string): boolean => {
  const name = file.name.toLowerCase()
  if (pattern.startsWith('.')) return name.endsWith(pattern.toLowerCase())
  if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1))
  return file.type === pattern
}

export const acceptsFile = (accepts: ReadonlyArray<string>, file: File): boolean =>
  accepts.some((pattern) => fits(file, pattern))
