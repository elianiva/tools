import { GROUPS } from './units.logic.ts'
import { defineForm, linear, unitConverter, unitStart, type UnitSet } from './ui.ts'

const temperature: UnitSet = {
  id: 'Temperature',
  name: 'Temperature',
  units: [
    { id: '°C', label: '°C', toBase: (v) => v, fromBase: (v) => v },
    { id: '°F', label: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
    { id: 'K', label: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
}

const sets: ReadonlyArray<UnitSet> = [
  ...GROUPS.map((group) => ({
    id: group.name,
    name: group.name,
    units: group.units.map((unit) => linear(unit.label, unit.label, unit.factor)),
  })),
  temperature,
]

export const units = defineForm({
  meta: {
    id: 'units',
    name: 'Unit converter',
    category: 'convert',
    description: 'Length, weight, volume, temperature and data sizes. Type 5 km.',
    keywords: [
      'length',
      'weight',
      'volume',
      'temperature',
      'celsius',
      'fahrenheit',
      'bytes',
      'metric',
      'imperial',
    ],
  },
  init: unitStart(sets, 'km', 'mi', '5'),
  view: (form, h) => unitConverter(h, form, { sets }),
})
