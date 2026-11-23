import { describe, expect, it } from 'vitest'
import { run } from './port-numbers.ts'

describe('port-numbers', () => {
  it('case 1', () => {
    expect(run('443')).toBe('443 HTTPS')
  })
  it('case 2', () => {
    expect(run('22')).toBe('22 SSH')
  })
  it('case 3', () => {
    expect(run('redis')).toBe('6379 Redis')
  })
  it('case 4', () => {
    expect(run('smtp')).toBe('25 SMTP\n465 SMTPS\n587 SMTP submission')
  })
  it('case 5', () => {
    expect(run('80')).toBe('80 HTTP')
  })
  it('case 6', () => {
    expect(() => run('9999')).toThrow('No port matches')
  })
  it('case 7', () => {
    expect(() => run('nothing')).toThrow('No port matches')
  })
})
