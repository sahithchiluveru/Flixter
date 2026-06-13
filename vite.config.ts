import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.config'

// During `vitest` we don't want the CRX/React build plugins loaded — the tests
// run in a Node environment against the pure modules, not the bundled extension.
const isTest = !!process.env.VITEST

export default defineConfig({
  plugins: isTest ? [] : [react(), crx({ manifest })],
})
