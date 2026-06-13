import { defineManifest } from '@crxjs/vite-plugin'
import pkg from '../package.json'

export default defineManifest({
  manifest_version: 3,
  name: 'Flixter',
  version: pkg.version,
  description: pkg.description,
  action: {
    default_title: 'Toggle Flixter comment rail',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://www.netflix.com/watch/*'],
      js: ['src/content/index.tsx'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['storage'],
  host_permissions: ['https://*.netflix.com/*'],
})
