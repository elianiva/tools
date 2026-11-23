import { defineTransform } from '../transform.ts'

export const run = (text: string, mode: string): string => {
  const status = /\b(TK|K)\s*\/\s*([0-3])\b/iu.exec(text)
  if (status === null) throw new Error('Add a PTKP status such as TK/0 or K/2.')
  const married = (status[1] ?? '').toUpperCase() === 'K'
  const dependents = Number(status[2])
  const numbers = [...text.replace(status[0], ' ').matchAll(/\d[\d.,_]*/gu)].map((match) =>
    Number(match[0].replaceAll(/[.,_]/gu, '')),
  )
  const [gross, contribution = 0] = numbers
  if (gross === undefined || gross <= 0)
    throw new Error('Enter the monthly gross salary, such as 15.000.000.')
  const label = `${married ? 'K' : 'TK'}/${dependents}`

  // Monthly effective rates (TER) in hundredths of a percent, by upper bound of gross pay.
  // Source: PMK 168/2023, Lampiran, tables for TER A, B and C.
  const ter: Readonly<Record<string, ReadonlyArray<readonly [number, number]>>> = {
    A: [
      [5_400_000, 0],
      [5_650_000, 25],
      [5_950_000, 50],
      [6_300_000, 75],
      [6_750_000, 100],
      [7_500_000, 125],
      [8_550_000, 150],
      [9_650_000, 175],
      [10_050_000, 200],
      [10_350_000, 225],
      [10_700_000, 250],
      [11_050_000, 300],
      [11_600_000, 350],
      [12_500_000, 400],
      [13_750_000, 500],
      [15_100_000, 600],
      [16_950_000, 700],
      [19_750_000, 800],
      [24_150_000, 900],
      [26_450_000, 1000],
      [28_000_000, 1100],
      [30_050_000, 1200],
      [32_400_000, 1300],
      [35_400_000, 1400],
      [39_100_000, 1500],
      [43_850_000, 1600],
      [47_800_000, 1700],
      [51_400_000, 1800],
      [56_300_000, 1900],
      [62_200_000, 2000],
      [68_600_000, 2100],
      [77_500_000, 2200],
      [89_000_000, 2300],
      [103_000_000, 2400],
      [125_000_000, 2500],
      [157_000_000, 2600],
      [206_000_000, 2700],
      [337_000_000, 2800],
      [454_000_000, 2900],
      [550_000_000, 3000],
      [695_000_000, 3100],
      [910_000_000, 3200],
      [1_400_000_000, 3300],
      [Infinity, 3400],
    ],
    B: [
      [6_200_000, 0],
      [6_500_000, 25],
      [6_850_000, 50],
      [7_300_000, 75],
      [9_200_000, 100],
      [10_750_000, 150],
      [11_250_000, 200],
      [11_600_000, 250],
      [12_600_000, 300],
      [13_600_000, 400],
      [14_950_000, 500],
      [16_400_000, 600],
      [18_450_000, 700],
      [21_850_000, 800],
      [26_000_000, 900],
      [27_700_000, 1000],
      [29_350_000, 1100],
      [31_450_000, 1200],
      [33_950_000, 1300],
      [37_100_000, 1400],
      [41_100_000, 1500],
      [45_800_000, 1600],
      [49_500_000, 1700],
      [53_800_000, 1800],
      [58_500_000, 1900],
      [64_000_000, 2000],
      [71_000_000, 2100],
      [80_000_000, 2200],
      [93_000_000, 2300],
      [109_000_000, 2400],
      [129_000_000, 2500],
      [163_000_000, 2600],
      [211_000_000, 2700],
      [374_000_000, 2800],
      [459_000_000, 2900],
      [555_000_000, 3000],
      [704_000_000, 3100],
      [957_000_000, 3200],
      [1_405_000_000, 3300],
      [Infinity, 3400],
    ],
    C: [
      [6_600_000, 0],
      [6_950_000, 25],
      [7_350_000, 50],
      [7_800_000, 75],
      [8_850_000, 100],
      [9_800_000, 125],
      [10_950_000, 150],
      [11_200_000, 175],
      [12_050_000, 200],
      [12_950_000, 300],
      [14_150_000, 400],
      [15_550_000, 500],
      [17_050_000, 600],
      [19_500_000, 700],
      [22_700_000, 800],
      [26_600_000, 900],
      [28_100_000, 1000],
      [30_100_000, 1100],
      [32_600_000, 1200],
      [35_400_000, 1300],
      [38_900_000, 1400],
      [43_000_000, 1500],
      [47_400_000, 1600],
      [51_200_000, 1700],
      [55_800_000, 1800],
      [60_400_000, 1900],
      [66_700_000, 2000],
      [74_500_000, 2100],
      [83_200_000, 2200],
      [95_600_000, 2300],
      [110_000_000, 2400],
      [134_000_000, 2500],
      [169_000_000, 2600],
      [221_000_000, 2700],
      [390_000_000, 2800],
      [463_000_000, 2900],
      [561_000_000, 3000],
      [709_000_000, 3100],
      [965_000_000, 3200],
      [1_419_000_000, 3300],
      [Infinity, 3400],
    ],
  }
  // TER A: TK/0, TK/1, K/0. TER B: TK/2, TK/3, K/1, K/2. TER C: K/3.
  const table = married
    ? dependents === 0
      ? 'A'
      : dependents === 3
        ? 'C'
        : 'B'
    : dependents <= 1
      ? 'A'
      : 'B'
  const hundredths = (ter[table] ?? []).find(([upper]) => gross <= upper)?.[1] ?? 3400

  // Whole rupiah: a fraction above .50 rounds up, .50 or less rounds down (PER-11/PJ/2025 Art. 129(3)).
  const divide = (n: number, d: number): number => {
    const quotient = (n - (n % d)) / d
    return (n % d) * 2 > d ? quotient + 1 : quotient
  }
  const idr = (n: number): string =>
    `Rp ${n < 0 ? '-' : ''}${String(Math.abs(n)).replaceAll(/\B(?=(\d{3})+(?!\d))/gu, '.')}`
  const monthly = divide(gross * hundredths, 10_000)

  const basis = [
    '',
    'Basis',
    'PMK 168/2023 (TER tables, December true-up, rounding of PKP in Art. 8(4)): https://peraturan.bpk.go.id/Download/346093/2023pmkeuangan168.pdf',
    'PP 58/2023: withholding rates for PPh 21',
    'UU PPh Art. 17(1)a as amended by UU HPP (UU 7/2021): progressive brackets',
    'PMK 101/PMK.010/2016: PTKP. DJP guide with worked examples: https://www.pajak.go.id/sites/default/files/2024-01/Buku%20Cermat%20Pemotongan%20PPh%20Pasal%2021.pdf',
    'PER-11/PJ/2025 Art. 129(3): amounts in whole rupiah',
  ]

  if (mode !== 'year') {
    return [
      `Category: TER ${table} (${label})`,
      `Rate: ${hundredths / 100}%`,
      `PPh 21: ${idr(monthly)}`,
      ...basis,
    ].join('\n')
  }

  const annualGross = gross * 12
  const allowance = Math.min(divide(annualGross * 5, 100), 6_000_000)
  const contributions = contribution * 12
  const net = annualGross - allowance - contributions
  const ptkp = 54_000_000 + (married ? 4_500_000 : 0) + dependents * 4_500_000
  const taxable = Math.max(0, net - ptkp)
  const pkp = taxable - (taxable % 1000)
  const layers: ReadonlyArray<readonly [number, number]> = [
    [60_000_000, 5],
    [250_000_000, 15],
    [500_000_000, 25],
    [5_000_000_000, 30],
    [Infinity, 35],
  ]
  let tax = 0
  let lower = 0
  for (const [upper, rate] of layers) {
    if (pkp > lower) tax += Math.round(((Math.min(pkp, upper) - lower) * rate) / 100)
    lower = upper
  }
  const withheld = monthly * 11
  return [
    `Category: TER ${table} (${label})`,
    `Rate Jan-Nov: ${hundredths / 100}%`,
    `Withheld Jan-Nov: ${idr(monthly)} × 11 = ${idr(withheld)}`,
    `Annual gross: ${idr(annualGross)}`,
    `Position allowance (biaya jabatan): ${idr(allowance)}`,
    `Pension and old-age contributions: ${idr(contributions)}`,
    `Net income: ${idr(net)}`,
    `PTKP: ${idr(ptkp)}`,
    `Taxable income (PKP): ${idr(pkp)}`,
    `PPh 21 for the year: ${idr(tax)}`,
    `Withheld in December: ${idr(tax - withheld)}`,
    'Assumes the same gross every month, with no bonus, THR, or zakat.',
    ...basis,
  ].join('\n')
}

export const pph21 = defineTransform({
  meta: {
    id: 'pph21',
    name: 'PPh 21 calculator',
    category: 'calculate',
    description:
      'Indonesian employee income tax: monthly TER withholding and the full-year December true-up, by PMK 168/2023.',
    keywords: [
      'pph 21',
      'pajak penghasilan',
      'ter',
      'ptkp',
      'indonesia',
      'gaji',
      'salary tax',
      'december',
    ],
  },
  modes: [
    { id: 'monthly', label: 'Monthly withholding (TER)' },
    { id: 'year', label: 'Full year and December' },
  ],
  placeholder: 'monthly gross, PTKP status, optional monthly pension contribution: 15.000.000 TK/0',
  example: '15.000.000 TK/0',
  run,
})
