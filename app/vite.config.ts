import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Cloudflare Tunnel quick tunnels (*.trycloudflare.com) for local OAuth / app testing
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/auth': 'http://localhost:3000',
      '/accounts': 'http://localhost:3000',
      '/join': 'http://localhost:3000',
      '/bonus-buys': 'http://localhost:3000',
      '/prize-spins': 'http://localhost:3000',
      '/chat-rolls': 'http://localhost:3000',
      '/internal': 'http://localhost:3000',
    },
  },
})
