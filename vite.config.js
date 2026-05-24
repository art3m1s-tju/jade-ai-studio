import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { env } from 'node:process'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': env.VITE_API_TARGET || 'http://127.0.0.1:8000',
    },
  },
})
