import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // VITE_BASE_PATH is injected by the GitHub Actions workflow.
  // Locally it defaults to '/' so dev mode works unchanged.
  base: process.env.VITE_BASE_PATH ?? '/',
  server: {
    port: 5173,
  },
});
