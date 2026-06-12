import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site is served under /<repo-name>/.
// Allow override via BASE_PATH for local/preview flexibility.
const base = process.env.BASE_PATH ?? '/ms-partner-marketplace-configurator/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200
  }
});
