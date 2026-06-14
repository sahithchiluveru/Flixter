import { defineWorkspace } from 'vitest/config'

// Two projects so unit tests (no external deps) and integration tests (require a
// running local Supabase) can be run independently.
export default defineWorkspace([
  {
    extends: './vite.config.ts',
    test: {
      name: 'unit',
      include: ['src/**/*.test.ts'],
      exclude: ['src/**/*.integration.test.ts'],
      environment: 'node',
    },
  },
  {
    extends: './vite.config.ts',
    test: {
      name: 'integration',
      include: ['src/**/*.integration.test.ts'],
      environment: 'node',
    },
  },
])
