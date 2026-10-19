import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
// El puerto del dev server se toma de VITE_PORT (apps/front/.env) y por defecto es 5173.
// Debe coincidir con CORS_ALLOWED_ORIGINS del backend: tools/db-setup genera ambos a la vez.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT ?? 5173),
      // Si el puerto está ocupado, fallar en vez de saltar a otro que no esté en CORS.
      strictPort: true,
    },
  }
})
