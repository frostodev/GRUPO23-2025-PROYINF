import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to the backend service name defined in docker-compose
      '/api': {
        target: 'http://app:3000',
        changeOrigin: true,
        secure: false,
        // Ensure backend Set-Cookie domain is rewritten so browser accepts cookie for localhost
        cookieDomainRewrite: '',
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
