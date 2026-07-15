import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'c21c9708c1f639ca-38-49-153-118.serveousercontent.com',
      'serveousercontent.com',
      '.serveousercontent.com'
    ]
  }
})
