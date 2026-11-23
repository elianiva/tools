import { defineTransform } from '../transform.ts'
import { describeTime } from './timestamp.logic.ts'

export const timestamp = defineTransform({
  meta: {
    id: 'timestamp',
    name: 'Timestamp converter',
    category: 'convert',
    description: 'Unix time and dates, in UTC and your time zone.',
    keywords: ['unix', 'epoch', 'date', 'time', 'iso 8601', 'utc', 'time zone'],
  },
  modes: [{ id: 'all', label: 'All' }],
  placeholder: '1700000000 or 2024-05-01T12:00:00Z',
  present: 'pairs',
  run: (text) => describeTime(text),
})
