import { defineTransform } from '../transform.ts'

export const run = (text: string): string => {
  const table = [
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
  const query = text.trim().toLowerCase()
  const found = table.filter((row) => {
    const [port = '', name = ''] = row.split('|')
    return /^\d+$/u.test(query) ? port === query : name.toLowerCase().includes(query)
  })
  if (found.length === 0) throw new Error('No port matches that.')
  return found.map((row) => row.replace('|', ' ')).join('\n')
}

export const portNumbers = defineTransform({
  meta: {
    id: 'port-numbers',
    name: 'Port numbers',
    category: 'developer',
    description: 'Look up the service behind a TCP or UDP port, or the port of a service.',
    keywords: ['port', 'tcp', 'udp', '443', 'ssh', 'network', 'service'],
  },
  modes: [{ id: 'run', label: 'Run' }],
  placeholder: '443 or redis',
  run,
})
