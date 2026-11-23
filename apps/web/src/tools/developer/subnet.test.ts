import { describe, expect, it } from 'vitest'
import { run } from './subnet.ts'

describe('subnet', () => {
  it('case 1', () => {
    expect(run('192.168.1.10/24')).toBe(
      'Network: 192.168.1.0\nNetmask: 255.255.255.0\nBroadcast: 192.168.1.255\nFirst host: 192.168.1.1\nLast host: 192.168.1.254\nHosts: 254',
    )
  })
  it('case 2', () => {
    expect(run('10.0.0.1/30')).toBe(
      'Network: 10.0.0.0\nNetmask: 255.255.255.252\nBroadcast: 10.0.0.3\nFirst host: 10.0.0.1\nLast host: 10.0.0.2\nHosts: 2',
    )
  })
  it('case 3', () => {
    expect(run('10.1.2.3/32')).toContain('Hosts: 1')
  })
  it('case 4', () => {
    expect(run('1.2.3.4/0')).toContain('Netmask: 0.0.0.0')
  })
  it('case 5', () => {
    expect(run('1.2.3.4/0')).toContain('Broadcast: 255.255.255.255')
  })
  it('case 6', () => {
    expect(run('172.16.5.4/12')).toContain('Network: 172.16.0.0')
  })
  it('case 7', () => {
    expect(() => run('300.1.1.1/24')).toThrow('valid IPv4')
  })
  it('case 8', () => {
    expect(() => run('10.0.0.1')).toThrow('Write an address')
  })
})
