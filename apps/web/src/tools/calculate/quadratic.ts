import { column, defineCalc, fmt, hero, num, plot, tiles } from './ui.ts'

export const run = (text: string): string => {
  const [a, b, c] = (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number)
  if (a === undefined || b === undefined || c === undefined)
    throw new Error('Enter a, b, and c, such as 1 -3 2.')
  if (a === 0) throw new Error('a cannot be zero.')
  const clean = (n: number): string => String(Number(n.toFixed(6)) + 0)
  const discriminant = b * b - 4 * a * c
  const head = `Discriminant: ${clean(discriminant)}`
  if (discriminant === 0) return `${head}\nx = ${clean(-b / (2 * a))}`
  if (discriminant > 0) {
    const root = Math.sqrt(discriminant)
    return `${head}\nx1 = ${clean((-b + root) / (2 * a))}\nx2 = ${clean((-b - root) / (2 * a))}`
  }
  const real = clean(-b / (2 * a))
  const imaginary = clean(Math.sqrt(-discriminant) / (2 * Math.abs(a)))
  return `${head}\nx1 = ${real} + ${imaginary}i\nx2 = ${real} - ${imaginary}i`
}

export const quadratic = defineCalc({
  meta: {
    id: 'quadratic',
    name: 'Quadratic solver',
    category: 'calculate',
    description: 'Solve ax² + bx + c = 0, with complex roots.',
    keywords: ['quadratic', 'equation', 'roots', 'discriminant', 'algebra', 'parabola'],
  },
  run,
  fields: [
    { label: 'a', value: '1' },
    { label: 'b', value: '-3' },
    { label: 'c', value: '2' },
  ],
  view: (h, { values, out }) => {
    const [a, b, c] = [num(values[0]), num(values[1]), num(values[2])]
    const f = (x: number): number => a * x * x + b * x + c
    const disc = b * b - 4 * a * c
    const vx = -b / (2 * a)
    const vy = f(vx)
    const roots =
      disc < 0
        ? []
        : disc === 0
          ? [vx]
          : [(-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a)]
    const half = Math.max(2, ...roots.map((root) => Math.abs(root - vx) * 1.6))
    const [x0, x1] = [vx - half, vx + half]
    const ys = [vy, f(x0), f(x1), 0]
    const pad = (Math.max(...ys) - Math.min(...ys)) * 0.1 || 1
    const lines = out.split('\n').slice(1)
    return column(h, [
      plot(h, {
        label: 'The parabola with its roots and vertex marked',
        x: [x0, x1],
        y: [Math.min(...ys) - pad, Math.max(...ys) + pad],
        fns: [f],
        points: [
          ...roots.map((root) => ({ x: root, y: 0, label: `x = ${fmt(root, 3)}` })),
          { x: vx, y: vy },
        ],
      }),
      hero(h, {
        label: disc < 0 ? 'Complex roots' : disc === 0 ? 'Root' : 'Roots',
        value: lines.map((line) => line.replace(/^x\d? = /u, '')).join('  ·  '),
        copy: out,
      }),
      tiles(h, [
        ['Discriminant', fmt(disc, 6)],
        ['Vertex', `(${fmt(vx, 3)}, ${fmt(vy, 3)})`],
      ]),
    ])
  },
})
