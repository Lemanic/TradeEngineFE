import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Trzeci argument '' wyłącza filtr prefiksu, więc czytamy też zmienne bez VITE_.
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8081'

  return {
    base: env.VITE_BASE || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        // Backend TradeEngine (Spring Boot) jest osobnym repo; w dev omijamy CORS.
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      // CSS nie jest przetwarzany: testy nie sprawdzają stylów, a jsdom
      // nie parsuje nowoczesnego CSS-a Tailwinda i zasypuje wyjście ostrzeżeniami.
      css: false,
    },
  }
})
