import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
  extend: {
    // animation: {
    //   'fade-in': 'fadeIn 0.5s ease-out',
    // },
    // keyframes: {
    //   fadeIn: {
    //     '0%': { opacity: 0 },
    //     '100%': { opacity: 1 },
    //   },
    // },
  },
},
  plugins: [react(),tailwindcss()],
})
