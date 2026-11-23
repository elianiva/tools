import { defineTransform } from '../transform.ts'
import { convertYaml } from './yaml-json.logic.ts'

export const yamlJson = defineTransform({
  meta: {
    id: 'yaml-json',
    name: 'YAML ↔ JSON',
    category: 'developer',
    description: 'Convert between YAML and JSON.',
    keywords: ['yaml', 'yml', 'json', 'convert', 'config'],
  },
  modes: [
    { id: 'yaml-to-json', label: 'YAML to JSON' },
    { id: 'json-to-yaml', label: 'JSON to YAML' },
  ],
  placeholder: 'key: value',
  run: convertYaml,
  acceptsFiles: true,
})
