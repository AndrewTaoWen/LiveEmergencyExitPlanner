import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['mapbox-gl', 'react-map-gl'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  resolve: {
    dedupe: ['mapbox-gl']
  },
  worker: {
    format: 'es'
  }
})

