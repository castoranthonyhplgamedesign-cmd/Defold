import { build } from 'esbuild';
await build({ entryPoints: ['web/physics.js'], outfile: 'web/physics.bundle.js', bundle: true, format: 'iife', minify: true, legalComments: 'eof' });
