import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/u.exec(text.trim())
  if (match === null) throw new Error('Write an address and prefix, such as 192.168.1.10/24.')
  const octets = [match[1], match[2], match[3], match[4]].map(Number)
  const prefix = Number(match[5])
  if (octets.some((octet) => octet > 255) || prefix > 32)
    throw new Error('This is not a valid IPv4 address and prefix.')
  const address = octets.reduce((sum, octet) => sum * 256 + octet, 0)
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const network = (address & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const dotted = (value: number): string =>
    [value >>> 24, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.')
  const small = prefix >= 31
  const hosts = prefix === 32 ? 1 : prefix === 31 ? 2 : 2 ** (32 - prefix) - 2
  return [
    `Network: ${dotted(network)}`,
    `Netmask: ${dotted(mask)}`,
    `Broadcast: ${dotted(broadcast)}`,
    `First host: ${dotted(small ? network : network + 1)}`,
    `Last host: ${dotted(small ? broadcast : broadcast - 1)}`,
    `Hosts: ${hosts}`,
  ].join('\n')
}

export const subnet = defineTransform({
  meta: {
    id: 'subnet',
    name: 'Subnet calculator',
    category: 'developer',
    description: 'Network, broadcast, and host range of an IPv4 CIDR block.',
    keywords: ['cidr', 'ip', 'subnet', 'netmask', 'network', 'ipv4'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '192.168.1.10/24',
  example: '192.168.1.10/24',
  fields: [{ label: 'IP address with prefix', kind: 'text' }],
  run,
})
