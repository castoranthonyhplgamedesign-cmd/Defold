import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  esbuild: { pure: ['console.error'] },
  assetsInclude: ['**/*.glb'],
  build: {
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    target: 'es2022',
    rollupOptions: { output: { format: 'iife' } },
  },
});
