import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import profiles from './src/networkProfiles.json';
import overloadDocument from './levels/overload-level.arrow-flow.json';
import { parseFlowDocument, flowRuntime } from './src/layout/arrowFlow';
import { overloadShooters, overloadHintOrder } from './src/data/overloadCannons';

export default defineConfig(({mode})=>{
  const profile=profiles.find(p=>p.tag===mode);
  // Every build ships the conveyor-overload level; build-level.mjs overrides __CUSTOM_LEVEL__ for other levels.
  const doc=parseFlowDocument(overloadDocument),runtime=flowRuntime(doc);
  const level={...runtime,shooters:overloadShooters(runtime.shooters),whitePreloadSize:doc.board.grid?.size??1,hintOrder:overloadHintOrder};
  if(!profile && mode!=='development' && mode!=='production' && mode!=='90seconds')throw new Error('Unknown network build');
  return {
  define: { __NETWORK__: JSON.stringify(profile?.tag ?? 'preview'), __DURATION__: mode==='90seconds'?'90':'undefined', __TAPS__: 'Infinity', __CUSTOM_LEVEL__: JSON.stringify(level) },
  plugins: [viteSingleFile(),{name:'network-head',transformIndexHtml(html:string){
    html=html.replace(/<meta name="network" content="[^"]*"\s*\/>/,`<meta name="network" content="${profile?.name ?? 'preview'}" />`);
    const bridge=profile?.bridge==='mraid'?'<script src="mraid.js"></script>':profile?.bridge==='exitapi'?'<script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>':'';
    const flag=profile?.tag==='vu'?'<script>window.__VUNGLE__=true</script>':'';
    if(profile?.tag==='mtg')html=html.replace('<body>','<body onload="gameReady()">');
    return html.replace('</head>',`<meta name="ad.orientation" content="portrait,landscape" />${bridge}${flag}</head>`);
  }}],
  assetsInclude: ['**/*.bin'],
  esbuild: { pure: ['console.error'] },
  build: {
    target: 'es2022',
    modulePreload: false,
    assetsInlineLimit: 10_000_000,
    cssCodeSplit: false,
    rollupOptions: { output: { format: 'iife' } },
  },
};});
