import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        // Standalone module, not yet linked from the main app -- see src/galaxy.
        galaxy: resolve(import.meta.dirname, 'galaxy.html'),
      },
    },
  },
})
