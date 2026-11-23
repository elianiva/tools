import { defineConfig } from '@pandacss/dev'
import { tools } from '@tools/ui/preset'

export default defineConfig({
  presets: [tools],
  preflight: true,
  include: ['./src/**/*.ts', '../../packages/ui/src/**/*.ts'],
  exclude: [],
  outdir: 'styled-system',
})
