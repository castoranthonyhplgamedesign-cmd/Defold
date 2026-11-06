import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  assetsInclude: ['**/*.ttf', '**/*.webp'],
  esbuild: { pure: ['console.error'] },
  build: {
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
  },
});
