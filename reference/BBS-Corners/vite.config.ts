import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const network = process.env.AD_NETWORK ?? 'dev';
const iteration = process.env.AD_ITERATION ?? '4clicks';
const headerVariant = process.env.AD_VARIANT ?? 'v1';

export default defineConfig({
  base: './',
  plugins: [playableCompliancePlugin(), viteSingleFile()],
  define: {
    __NETWORK__: JSON.stringify(network),
    __ITERATION__: JSON.stringify(iteration),
    __HEADER_VARIANT__: JSON.stringify(headerVariant),
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    legalComments: 'none',
    pure: ['console.error'],
  },
});

function playableCompliancePlugin() {
  return {
    name: 'playable-compliance',
    renderChunk(code: string) {
      return {
        code: code.replace(/\bconsole\.error\b/g, '(() => {})'),
        map: null,
      };
    },
  };
}
