export const runLines = (text: string, mode: string): string => {
  const lines = text.split('\n')
  switch (mode) {
    case 'sort':
      return lines.toSorted((a, b) => a.localeCompare(b, undefined, { numeric: true })).join('\n')
    case 'sort-desc':
      return lines.toSorted((a, b) => b.localeCompare(a, undefined, { numeric: true })).join('\n')
    case 'reverse':
      return lines.toReversed().join('\n')
    case 'dedupe':
      return [...new Set(lines)].join('\n')
    case 'trim':
      return lines.map((line) => line.trim()).join('\n')
    case 'remove-empty':
      return lines.filter((line) => line.trim() !== '').join('\n')
    default: {
      const width = String(lines.length).length
      return lines
        .map((line, index) => `${String(index + 1).padStart(width, ' ')}  ${line}`)
        .join('\n')
    }
  }
}
