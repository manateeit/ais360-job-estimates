import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ['all', '5173-i3ta90nglgvnxlyvkbmbx-07a53a4d.manusvm.computer', '5173-ix3eo15nho73k6foqvuf8-07a53a4d.manusvm.computer']
  }
})
