import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    // 프로덕션 빌드 시 console.log 제거
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
