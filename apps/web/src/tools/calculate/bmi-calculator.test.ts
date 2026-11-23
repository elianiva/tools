import { describe, expect, it } from 'vitest'
import { run } from './bmi-calculator.ts'

describe('bmi-calculator', () => {
  it('case 1', () => {
    expect(run('70 175', 'metric')).toBe('BMI: 22.9 (Normal)')
  })
  it('case 2', () => {
    expect(run('154 69', 'imperial')).toBe('BMI: 22.7 (Normal)')
  })
  it('case 3', () => {
    expect(run('50 180', 'metric')).toBe('BMI: 15.4 (Underweight)')
  })
  it('case 4', () => {
    expect(run('100 170', 'metric')).toBe('BMI: 34.6 (Obesity)')
  })
  it('case 5', () => {
    expect(() => run('70', 'metric')).toThrow('Enter weight')
  })
})
