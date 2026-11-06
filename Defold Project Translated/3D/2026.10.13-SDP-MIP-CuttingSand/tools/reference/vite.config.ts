import { defineConfig, type Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Built playables load every asset from inline data: URIs, which Phaser decodes without a request
 * (XHRLoader's base64 branch). Its network branch is therefore dead code in production; replacing
 * it with an explicit error keeps XMLHttpRequest out of the output (Moloco rejects any use of it).
 * Dev builds keep the original loader so /Assets/Runtime files load from the dev server.
 */
function inlineOnlyLoader(): Plugin {
  const target = 'var xhr = new XMLHttpRequest();';
  return {
    name: 'inline-only-loader',
    apply: 'build',
    transform(code, id) {
      if (!/phaser\/dist\/phaser(\.esm)?\.js$/.test(id.replace(/\\/g, '/'))) {
        return null;
      }
      if (!code.includes(target)) {
        this.error('Phaser XHRLoader changed; update the inline-only-loader transform.');
      }
      return code.replace(target, "throw new Error('External asset loading is disabled: ' + file.src);");
    }
  };
}

export default defineConfig({
  plugins: [inlineOnlyLoader(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true
      }
    }
  },
  esbuild: {
    pure: ['console.error']
  }
});
