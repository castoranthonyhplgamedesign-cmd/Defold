import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  assetsInclude: ['**/*.fbx'],
  plugins: [viteSingleFile()],
  esbuild: {
    pure: ['console.error'],
  },
  build: {
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});
