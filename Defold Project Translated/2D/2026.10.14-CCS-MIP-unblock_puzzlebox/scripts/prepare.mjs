import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {transform} from 'esbuild';
const source=await readFile('tools/reference/src/constants.ts','utf8');
const js=(await transform(source,{loader:'ts',format:'esm'})).code;
const mod=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
function lua(x){if(x===null)return 'nil';if(typeof x==='string')return JSON.stringify(x);if(typeof x!=='object')return String(x);return '{'+Object.entries(x).map(([k,v])=>(Array.isArray(x)?'':'['+JSON.stringify(k)+']=')+lua(v)).join(',')+'}';}
await writeFile('modules/constants.lua','-- Generated from the unchanged source constants.ts by scripts/prepare.mjs.\nreturn '+lua({...mod.GAME,FIT:mod.FIT,DIM:mod.DIM,STORE_URL_IOS:mod.STORE_URL_IOS,STORE_URL_ANDROID:mod.STORE_URL_ANDROID})+'\n');
await writeFile('docs/source-constants.json',JSON.stringify(mod,null,2)+'\n');
let pile=await readFile('tools/reference/src/game/pile.ts','utf8');
pile=pile.replace(/^import .*$/gm,'');
const rng=await readFile('tools/reference/src/game/rng.ts','utf8');
await writeFile('web/pile.ts','// Derived from baseline pile.ts and rng.ts; see docs/WORK_LOG.md.\nconst GAME='+JSON.stringify(mod.GAME)+';\nconst RING_COLORS=[0xff2026,0x1469e4,0x18c908,0xffec16];\nconst ballRadius=(n:number)=>GAME.RING_HOLE+GAME.RING_PITCH*Math.max(n,1);\n'+rng.replace('export type Rng = ReturnType<typeof makeRng>','type Rng = ReturnType<typeof makeRng>')+'\n'+pile);
await mkdir('web/audio',{recursive:true});
for(const f of ['bgm_loop','sfx_touch','sfx_merge','sfx_pop','sfx_gift','sfx_win','sfx_warn'])await writeFile(`web/audio/${f}.mp3`,await readFile(`tools/reference/Assets/audio/${f}.mp3`));
