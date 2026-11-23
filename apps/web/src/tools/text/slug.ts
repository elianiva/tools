import { defineTransform } from '../transform.ts'
import { slugify } from './slug.logic.ts'

export const slug = defineTransform({
  meta: {
    id: 'slug',
    name: 'Slug generator',
    category: 'text',
    description: 'Turn titles into clean, URL-friendly slugs.',
    keywords: ['url', 'permalink', 'kebab', 'seo'],
  },
  modes: [{ id: 'slug', label: 'Slug' }],
  placeholder: 'My Blog Post Title',
  present: 'display',
  run: (text) => slugify(text),
})
