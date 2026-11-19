import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/space-visualizer/",
  plugins: [vue()],
  server: {
    proxy: {
      '/api/horizons': {
        target: 'https://ssd.jpl.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/horizons/, '/api/horizons.api'),
      },
    },
  },
})
