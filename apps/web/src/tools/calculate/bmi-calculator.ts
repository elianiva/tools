import { column, defineCalc, draw, fact, figure, fmt, hero, num, tiles } from './ui.ts'

export const run = (text: string, mode: string): string => {
  const nums = (text.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number)
  const [weight, height] = nums
  if (weight === undefined || height === undefined || weight <= 0 || height <= 0) {
    throw new Error('Enter weight then height, such as 70 175.')
  }
  const bmi = mode === 'imperial' ? (703 * weight) / height ** 2 : weight / (height / 100) ** 2
  const label =
    bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obesity'
  return `BMI: ${bmi.toFixed(1)} (${label})`
}

const BANDS = [
  [10, 18.5, 'var(--info)', 'Under'],
  [18.5, 25, 'var(--ok)', 'Normal'],
  [25, 30, 'var(--warn)', 'Over'],
  [30, 40, 'var(--danger)', 'Obese'],
] as const

export const bmiCalculator = defineCalc({
  meta: {
    id: 'bmi-calculator',
    name: 'BMI calculator',
    category: 'calculate',
    description: 'Body mass index from weight and height.',
    keywords: ['bmi', 'weight', 'health', 'body mass'],
  },
  run,
  modes: [
    {
      id: 'metric',
      label: 'Metric',
      fields: [
        { label: 'Weight', value: '70', suffix: 'kg' },
        { label: 'Height', value: '175', suffix: 'cm' },
      ],
    },
    {
      id: 'imperial',
      label: 'Imperial',
      fields: [
        { label: 'Weight', value: '154', suffix: 'lb' },
        { label: 'Height', value: '69', suffix: 'in' },
      ],
    },
  ],
  view: (h, { values, mode, out }) => {
    const d = draw(h)
    const bmi = Number(fact(out, 'BMI').split(' ')[0])
    const label = /\((.+)\)/u.exec(out)?.[1] ?? ''
    const metric = mode === 'metric'
    const height = num(values[1])
    const weightAt = (target: number): number =>
      metric ? target * (height / 100) ** 2 : (target * height ** 2) / 703
    const x = (v: number): number => 10 + ((Math.min(40, Math.max(10, v)) - 10) / 30) * 280
    const marker = x(bmi)
    return column(h, [
      figure(h, { width: 300, height: 110, label: `BMI ${fmt(bmi, 1)}, ${label}` }, [
        ...BANDS.flatMap(([from, to, color, name]) => [
          d.rect({
            x: x(from),
            y: 44,
            width: x(to) - x(from),
            height: 18,
            fill: color,
            opacity: name === label ? 1 : 0.4,
          }),
          d.text({ class: 'lbl mid', x: (x(from) + x(to)) / 2, y: 86 }, name),
        ]),
        d.polygon({ class: 'fill', points: `${marker},42 ${marker - 6},30 ${marker + 6},30` }),
        d.text({ class: 'val mid', x: marker, y: 22 }, fmt(bmi, 1)),
      ]),
      hero(h, { label: 'BMI', value: fmt(bmi, 1), sub: label, copy: out }),
      tiles(h, [
        [
          'Healthy weight',
          `${fmt(weightAt(18.5), 1)}–${fmt(weightAt(24.9), 1)} ${metric ? 'kg' : 'lb'}`,
        ],
      ]),
    ])
  },
})
