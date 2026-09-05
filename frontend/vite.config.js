import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://127.0.0.1:8000',
      '/patients': 'http://127.0.0.1:8000',
      '/reports': 'http://127.0.0.1:8000',
      '/observations': 'http://127.0.0.1:8000',
      '/demo': 'http://127.0.0.1:8000',
      '/conflicts': 'http://127.0.0.1:8000',
    }
  }
});

