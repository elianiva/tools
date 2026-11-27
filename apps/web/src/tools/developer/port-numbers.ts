import { referenceView, defineWorkbench } from './ui.ts'

export const PORT_TABLE = [
  '20|FTP data',
  '21|FTP',
  '22|SSH',
  '23|Telnet',
  '25|SMTP',
  '53|DNS',
  '67|DHCP',
  '80|HTTP',
  '110|POP3',
  '123|NTP',
  '143|IMAP',
  '161|SNMP',
  '389|LDAP',
  '443|HTTPS',
  '465|SMTPS',
  '587|SMTP submission',
  '993|IMAPS',
  '995|POP3S',
  '1433|SQL Server',
  '3306|MySQL',
  '3389|RDP',
  '5432|PostgreSQL',
  '5672|AMQP',
  '6379|Redis',
  '8080|HTTP alternate',
  '9200|Elasticsearch',
  '27017|MongoDB',
]

export const run = (text: string): string => {
  const query = text.trim().toLowerCase()
  const found = PORT_TABLE.filter((row) => {
    const [port = '', name = ''] = row.split('|')
    return /^\d+$/u.test(query) ? port === query : name.toLowerCase().includes(query)
  })
  if (found.length === 0) throw new Error('No port matches that.')
  return found.map((row) => row.replace('|', ' ')).join('\n')
}

const GROUPS: Readonly<Record<string, ReadonlyArray<string>>> = {
  Web: ['80', '443', '8080'],
  Mail: ['25', '110', '143', '465', '587', '993', '995'],
  Database: ['1433', '3306', '5432', '6379', '9200', '27017'],
  'Remote access': ['22', '23', '3389'],
  'File transfer': ['20', '21'],
  Infrastructure: ['53', '67', '123', '161', '389', '5672'],
}

const groupOf = (port: string): string =>
  Object.entries(GROUPS).find(([, ports]) => ports.includes(port))?.[0] ?? 'Other'

export const portNumbers = defineWorkbench({
  meta: {
    id: 'port-numbers',
    name: 'Port numbers',
    category: 'developer',
    description: 'Look up the service behind a TCP or UDP port, or the port of a service.',
    keywords: ['port', 'tcp', 'udp', '443', 'ssh', 'network', 'service'],
  },
  view: (h, ctx) =>
    referenceView(h, ctx, {
      id: 'port-numbers',
      label: 'Search',
      placeholder: '443 or redis',
      categories: [...Object.keys(GROUPS)],
      headers: ['Port', 'Service', 'Category'],
      kinds: ['num', 'text', 'text'],
      copyColumn: 0,
      empty: 'No port matches.',
      rows: PORT_TABLE.map((row) => {
        const [port = '', name = ''] = row.split('|')
        const category = groupOf(port)
        return {
          category,
          search: `${port} ${name} ${category}`.toLowerCase(),
          cells: [port, name, category],
        }
      }),
    }),
})
