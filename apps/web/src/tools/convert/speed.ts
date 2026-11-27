import { defineForm, linear, unitConverter, unitStart, type UnitSet } from './ui.ts'

export const run = (text: string): string => {
  const match =
    /^\s*(-?\d+(?:\.\d+)?)\s*(kmh|km\/h|kph|mph|ms|m\/s|knots?|kn|fts|ft\/s)\s*$/iu.exec(text)
  if (match === null)
    throw new Error('Write a speed such as 100 kmh, 60 mph, 10 knots, 5 m/s, or 30 ft/s.')
  const toMetresPerSecond: Readonly<Record<string, number>> = {
    kmh: 1 / 3.6,
    mph: 0.44704,
    ms: 1,
    kn: 1852 / 3600,
    fts: 0.3048,
  }
  const key = (match[2] ?? '')
    .toLowerCase()
    .replace('/', '')
    .replace('km h', 'kmh')
    .replace(/^(kph|km)h?$/u, 'kmh')
    .replace(/^knots?$/u, 'kn')
  const source = key === 'kph' ? 'kmh' : key
  const base = Number(match[1]) * (toMetresPerSecond[source] ?? 1)
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['kmh', 'km/h'],
    ['mph', 'mph'],
    ['ms', 'm/s'],
    ['kn', 'knots'],
    ['fts', 'ft/s'],
  ]
  return rows
    .filter(([id]) => id !== source)
    .map(
      ([id, label]) => `${Number((base / (toMetresPerSecond[id] ?? 1)).toPrecision(6))} ${label}`,
    )
    .join('\n')
}

const sets: ReadonlyArray<UnitSet> = [
  {
    id: 'speed',
    name: 'Speed',
    units: [
      linear('km/h', 'km/h', 1 / 3.6),
      linear('mph', 'mph', 0.44704),
      linear('m/s', 'm/s', 1),
      linear('knots', 'knots', 1852 / 3600),
      linear('ft/s', 'ft/s', 0.3048),
    ],
  },
]

export const speed = defineForm({
  meta: {
    id: 'speed',
    name: 'Speed converter',
    category: 'convert',
    description: 'km/h, mph, m/s, knots, and ft/s. Type 100 kmh.',
    keywords: ['speed', 'kmh', 'mph', 'knots', 'velocity', 'm/s'],
  },
  init: unitStart(sets, 'km/h', 'mph', '100'),
  view: (form, h) => unitConverter(h, form, { sets }),
})
