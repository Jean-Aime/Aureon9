import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // This repo uses `frontend/Public` (capital P) for static assets.
  // Tell Vite to serve/copy that directory so `/images/...` URLs resolve.
  publicDir: 'Public',
  server: {
    port: 5173,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
