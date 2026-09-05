import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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

