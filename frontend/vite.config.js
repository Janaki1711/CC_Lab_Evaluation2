import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/bms': {
        target: 'http://localhost:8004',
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true
      }
    }
  }
})
