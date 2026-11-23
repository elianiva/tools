import cronstrue from 'cronstrue'
import { defineTransform } from '../transform.ts'

export const cron = defineTransform({
  meta: {
    id: 'cron',
    name: 'Cron explainer',
    category: 'developer',
    description: 'Say in plain English when a cron expression runs.',
    keywords: ['cron', 'crontab', 'schedule', 'expression'],
  },
  modes: [{ id: 'explain', label: 'Explain' }],
  placeholder: '*/15 9-17 * * 1-5',
  example: '*/15 9-17 * * 1-5',
  run: (text) => {
    try {
      return cronstrue.toString(text.trim(), { use24HourTimeFormat: true })
    } catch {
      throw new Error(
        'This is not a valid cron expression. Use five fields: minute hour day month weekday.',
      )
    }
  },
})
