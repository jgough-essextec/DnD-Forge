import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Bundle visualizer: generates stats.html when ANALYZE=true
    ...(process.env.ANALYZE === 'true'
      ? [
          visualizer({
            filename: 'dist/stats.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap',
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor: React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Vendor: Data management
          'vendor-data': ['@tanstack/react-query', 'zustand', 'axios'],
          // Vendor: Animation
          'vendor-animation': ['framer-motion'],
          // SRD reference data
          'srd-reference': ['./src/data/reference.ts'],
          'srd-spells': ['./src/data/spells.ts'],
          'srd-classes': ['./src/data/classes.ts'],
          'srd-races': ['./src/data/races.ts'],
          'srd-equipment': ['./src/data/equipment.ts'],
          'srd-backgrounds': ['./src/data/backgrounds.ts'],
          'srd-feats': ['./src/data/feats.ts'],
        },
      },
    },
  },
})
