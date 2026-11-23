/** `Crème brûlée & más!` becomes `creme-brulee-mas`. One slug per line. */
export const slugify = (text: string): string =>
  text
    .split('\n')
    .map((line) =>
      line
        .normalize('NFKD')
        .replaceAll(/\p{M}/gu, '')
        .toLowerCase()
        .replaceAll(/[^\p{L}\p{N}]+/gu, '-')
        .replaceAll(/^-+|-+$/gu, ''),
    )
    .join('\n')
