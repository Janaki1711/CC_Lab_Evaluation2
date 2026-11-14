import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8001',
        changeOrigin: true
      },
      '/api/files': {
        target: 'http://localhost:8002',
        changeOrigin: true
      },
      '/api/documents': {
        target: 'http://localhost:8003',
        changeOrigin: true
      },
      '/api/cluster': {
        target: 'http://localhost:8003',
        changeOrigin: true
      }
    }
  }
})
