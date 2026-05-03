import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
  server: {
    proxy: {
      '/ask': 'http://localhost:8000',
      '/index': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/translate': 'http://localhost:8000',
      '/tts': 'http://localhost:8000',
      '/youtube': 'http://localhost:8000',
    },
  },
});
