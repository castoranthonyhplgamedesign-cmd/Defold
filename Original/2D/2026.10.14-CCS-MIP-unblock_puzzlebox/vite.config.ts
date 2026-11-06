import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [viteSingleFile()],
  // build-all.mjs overrides this per variant; `npm run dev` uses VARIANT env or 60sec.
  define: { __VARIANT__: JSON.stringify(process.env.VARIANT ?? '60sec'), __PERF__: JSON.stringify(process.env.PERF === '1'), __HUD__: JSON.stringify(process.env.HUD !== '0') },
  esbuild: { pure: ['console.error'] },
  build: {
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    rollupOptions: { output: { format: 'iife' } },
  },
})
