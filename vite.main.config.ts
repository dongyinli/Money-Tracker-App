import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      // Native modules can't be bundled as JS; load them via Node's require at runtime instead.
      external: ['better-sqlite3'],
    },
  },
});
