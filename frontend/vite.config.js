import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: rootDir,
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Binds directly to IPv4 localhost to prevent network change drops
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8082',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      // Keep HTML entry stable on Windows paths.
      input: 'index.html'
    }
  }
});
