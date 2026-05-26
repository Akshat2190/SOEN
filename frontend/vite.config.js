import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    proxy: {
      '/cdn': {
        target: 'https://cdnjs.cloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, '')
      },
      '/wikimedia': {
        target: 'https://upload.wikimedia.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wikimedia/, '')
      },
    },
  }
})
