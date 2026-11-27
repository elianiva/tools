import { convertYaml } from './yaml-json.logic.ts'
import { codecView, defineWorkbench } from './ui.ts'

export const yamlJson = defineWorkbench({
  meta: {
    id: 'yaml-json',
    name: 'YAML ↔ JSON',
    category: 'developer',
    description: 'Convert between YAML and JSON.',
    keywords: ['yaml', 'yml', 'json', 'convert', 'config'],
  },
  mode: 'yaml-to-json',
  example: 'name: Ada\ntags:\n  - math\n  - code\n',
  acceptsFiles: true,
  view: (h, ctx) =>
    codecView(h, ctx, {
      id: 'yaml-json',
      modes: [
        { value: 'yaml-to-json', label: 'YAML to JSON' },
        { value: 'json-to-yaml', label: 'JSON to YAML' },
      ],
      inverse: { 'yaml-to-json': 'json-to-yaml', 'json-to-yaml': 'yaml-to-json' },
      run: convertYaml,
      labels: (mode) => (mode === 'yaml-to-json' ? ['YAML', 'JSON'] : ['JSON', 'YAML']),
      placeholder: ctx.mode === 'yaml-to-json' ? 'key: value' : '{"key":"value"}',
    }),
})
