import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_MASTER_SUPABASE_URL': JSON.stringify(process.env.VITE_MASTER_SUPABASE_URL),
    'import.meta.env.VITE_MASTER_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_MASTER_SUPABASE_ANON_KEY),
  },
})
