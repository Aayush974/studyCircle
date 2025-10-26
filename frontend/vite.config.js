import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  // have to send request to backend via a proxy since the cookies are not being set in cross origin
   server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000/api/v1", //  backend server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""), // removes the extra /api
      },
    },
  },
  plugins: [react(),tailwindcss()],
})
