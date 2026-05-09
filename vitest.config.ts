import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node',
    envFiles: ['.env.test'],
    globalSetup: './src/__tests__/setup/globalSetup.ts',
    setupFiles: ['./src/__tests__/setup/mocks.ts'],
    testTimeout: 15000,
  },
})
