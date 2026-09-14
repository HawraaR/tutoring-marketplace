// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy standard API requests if you use them (e.g., /api)
      '/api': {
        target: 'http://localhost:5000', // Change to your backend port
        changeOrigin: true,
      },
      // Proxy Socket.io requests and enable WebSocket upgrading
      '/socket.io': {
        target: 'http://localhost:5000', // Change to your backend port
        ws: true,
        changeOrigin: true,
      },
    },
  },
})