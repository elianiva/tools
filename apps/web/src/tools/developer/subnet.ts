import { css } from '../../../styled-system/css'
import { columns, panel, range, stack } from '../kit.ts'
import {
  attempt,
  bitRow,
  defineWorkbench,
  errorNote,
  facts,
  sectionLabel,
  textField,
} from './ui.ts'

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

const legendCls = css({
  display: 'flex',
  gap: '1rem',
  fontSize: '0.75rem',
  color: 'var(--muted-foreground)',
})

const toNumber = (dotted: string): bigint =>
  dotted.split('.').reduce((sum, octet) => sum * 256n + BigInt(octet), 0n)

export const subnet = defineWorkbench({
  meta: {
    id: 'subnet',
    name: 'Subnet calculator',
    category: 'developer',
    description: 'Network, broadcast, and host range of an IPv4 CIDR block.',
    keywords: ['cidr', 'ip', 'subnet', 'netmask', 'network', 'ipv4'],
  },
  example: '192.168.1.10/24',
  view: (h, ctx) => {
    const result =
      ctx.input.trim() === '' ? { value: '', error: '' } : attempt(() => run(ctx.input))
    const ok = ctx.input.trim() !== '' && result.error === ''
    const lines = ok
      ? result.value
          .split('\n')
          .map((line) => [line.split(': ')[0] ?? '', line.split(': ')[1] ?? ''] as const)
      : []
    const [address = '', prefixText = '0'] = ctx.input.trim().split('/')
    const prefix = Number(prefixText)
    const mask = lines.find(([name]) => name === 'Netmask')?.[1] ?? '0.0.0.0'
    return h.div(
      [h.Class(stack)],
      [
        panel(h, null, [
          textField(h, {
            id: 'subnet-input',
            label: 'Address and prefix',
            value: ctx.input,
            placeholder: '192.168.1.10/24',
            onInput: ctx.on.input,
          }),
          errorNote(h, result.error),
          ok
            ? range(h, {
                id: 'subnet-prefix',
                min: 0,
                max: 32,
                value: prefix,
                onInput: (n) => ctx.on.input(`${address}/${n}`),
              })
            : null,
        ]),
        ok
          ? columns(h, [
              panel(h, null, [
                sectionLabel(h, 'Address bits'),
                bitRow(h, {
                  label: 'Address',
                  value: toNumber(address),
                  width: 32,
                  dimFrom: prefix,
                }),
                sectionLabel(h, 'Mask bits'),
                bitRow(h, { label: 'Netmask', value: toNumber(mask), width: 32, dimFrom: prefix }),
                h.div(
                  [h.Class(legendCls)],
                  [
                    h.span([], [`Network: ${prefix} bits`]),
                    h.span([], [`Host: ${32 - prefix} bits (dimmed)`]),
                  ],
                ),
              ]),
              panel(h, null, [sectionLabel(h, 'Block'), facts(h, lines)]),
            ])
          : null,
      ],
    )
  },
})
