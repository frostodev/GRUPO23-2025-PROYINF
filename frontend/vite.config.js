import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default ({ mode }) => {
  // Carga las variables de entorno (de .env, .env.local, etc.)
  const env = loadEnv(mode, process.cwd(), '')

  // Define el target del proxy.
  // Usará tu variable VITE_API_PROXY_TARGET o 'http://localhost:3000' como default
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000'

  console.log(`[INFO] El proxy de /api se redirigirá a: ${proxyTarget}`)

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        // Proxy API calls to the backend service
        '/api': {
          target: proxyTarget, // ⬅️ Usamos la variable
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: '',
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  })
}