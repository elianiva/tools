type Unit = Readonly<{ names: ReadonlyArray<string>; label: string; factor: number }>
type Group = Readonly<{ name: string; units: ReadonlyArray<Unit> }>

export const GROUPS: ReadonlyArray<Group> = [
  {
    name: 'Length',
    units: [
      { names: ['mm'], label: 'mm', factor: 0.001 },
      { names: ['cm'], label: 'cm', factor: 0.01 },
      { names: ['m'], label: 'm', factor: 1 },
      { names: ['km'], label: 'km', factor: 1000 },
      { names: ['in', 'inch', 'inches'], label: 'in', factor: 0.0254 },
      { names: ['ft', 'foot', 'feet'], label: 'ft', factor: 0.3048 },
      { names: ['yd', 'yard', 'yards'], label: 'yd', factor: 0.9144 },
      { names: ['mi', 'mile', 'miles'], label: 'mi', factor: 1609.344 },
    ],
  },
  {
    name: 'Weight',
    units: [
      { names: ['mg'], label: 'mg', factor: 0.000001 },
      { names: ['g'], label: 'g', factor: 0.001 },
      { names: ['kg'], label: 'kg', factor: 1 },
      { names: ['oz', 'ounce', 'ounces'], label: 'oz', factor: 0.028349523125 },
      { names: ['lb', 'lbs', 'pound', 'pounds'], label: 'lb', factor: 0.45359237 },
    ],
  },
  {
    name: 'Volume',
    units: [
      { names: ['ml'], label: 'ml', factor: 0.001 },
      { names: ['l', 'liter', 'litre'], label: 'l', factor: 1 },
      { names: ['tsp'], label: 'tsp', factor: 0.00492892159375 },
      { names: ['tbsp'], label: 'tbsp', factor: 0.01478676478125 },
      { names: ['cup', 'cups'], label: 'cup', factor: 0.2365882365 },
      { names: ['floz'], label: 'fl oz', factor: 0.0295735295625 },
      { names: ['gal', 'gallon'], label: 'gal', factor: 3.785411784 },
    ],
  },
  {
    name: 'Data',
    units: [
      { names: ['b', 'byte', 'bytes'], label: 'B', factor: 1 },
      { names: ['kb'], label: 'KB', factor: 1000 },
      { names: ['mb'], label: 'MB', factor: 1e6 },
      { names: ['gb'], label: 'GB', factor: 1e9 },
      { names: ['tb'], label: 'TB', factor: 1e12 },
      { names: ['kib'], label: 'KiB', factor: 1024 },
      { names: ['mib'], label: 'MiB', factor: 1024 ** 2 },
      { names: ['gib'], label: 'GiB', factor: 1024 ** 3 },
    ],
  },
]

const number = (value: number): string =>
  Number.isInteger(value) && Math.abs(value) < 1e15
    ? String(value)
    : Number(value.toPrecision(7)).toLocaleString('en', {
        maximumFractionDigits: 10,
        useGrouping: false,
      })

const temperatures = (value: number, from: string): string => {
  const celsius = from === 'c' ? value : from === 'f' ? ((value - 32) * 5) / 9 : value - 273.15
  return [
    `${number(celsius)} °C`,
    `${number((celsius * 9) / 5 + 32)} °F`,
    `${number(celsius + 273.15)} K`,
  ].join('\n')
}

/** `5 km`, `12 lb`, `98.6 f`: the unit says which family; every unit of it is shown. */
export const convertUnits = (text: string): string => {
  const match = /^\s*(-?\d+(?:[.,]\d+)?)\s*°?\s*([a-zA-Z]+)\s*$/u.exec(text)
  if (match === null)
    throw new Error('Write a number and a unit, such as 5 km, 12 lb, 98.6 F or 3 GiB.')
  const value = Number((match[1] ?? '').replace(',', '.'))
  const unit = (match[2] ?? '').toLowerCase()
  if (unit === 'c' || unit === 'f' || unit === 'k') {
    if (unit === 'k' && value < 0) throw new Error('Kelvin cannot be negative.')
    return temperatures(value, unit)
  }
  const group = GROUPS.find((entry) =>
    entry.units.some((candidate) => candidate.names.includes(unit)),
  )
  const source = group?.units.find((candidate) => candidate.names.includes(unit))
  if (group === undefined || source === undefined)
    throw new Error(`I do not know the unit "${match[2]}".`)
  return group.units
    .filter((target) => target !== source)
    .map((target) => `${number((value * source.factor) / target.factor)} ${target.label}`)
    .join('\n')
}
