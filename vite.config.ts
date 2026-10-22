/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: false },
  build: {
    rollupOptions: {
      output: { manualChunks: { pixi: ['pixi.js'], markdown: ['react-markdown', 'remark-gfm'] } },
    },
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    // Node 25+ ships its own global `localStorage` that shadows jsdom's and is unusable without
    // --localstorage-file, so turn it off in test workers.
    pool: 'forks',
    poolOptions: { forks: { execArgv: ['--no-experimental-webstorage'] } },
  },
});
