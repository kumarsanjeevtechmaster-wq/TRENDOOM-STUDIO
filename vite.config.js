import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Uses relative base './' so the built dist/ bundle works cleanly
// both standalone and mounted inside Viralytics at /trendoom/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    }
  }
});
