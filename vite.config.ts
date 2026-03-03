import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/solvedac': {
        target: 'https://solved.ac',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/solvedac/, '/api/v3'),
      },
    },
  },
})
