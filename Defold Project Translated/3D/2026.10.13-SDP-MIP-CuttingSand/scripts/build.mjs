import {spawnSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';
process.chdir(path.resolve(import.meta.dirname,'..'));
const brand=JSON.parse(fs.readFileSync('branding.json','utf8'));
await import('./template.mjs');
const java=process.env.DEFOLD_JAVA||'C:/Users/Anthony Castor/Documents/Defold/packages/jdk-25.0.4.1+1/bin/java.exe';
const bob=process.env.DEFOLD_BOB||path.resolve('../../../.tools/bob.jar');
const log=fs.openSync('qa/build.log','w');
const r=spawnSync(java,['-jar',bob,'--platform','wasm-web','--architectures','wasm-web','--variant',process.env.DEFOLD_VARIANT||'debug','--archive','--bundle-output','bundle','resolve','build','bundle'],{stdio:['ignore',log,log],windowsHide:true});fs.closeSync(log);
if(r.status!==0){console.log(fs.readFileSync('qa/build.log','utf8').slice(-5000));throw Error('Defold build failed: '+(r.error||r.status));}
fs.cpSync('web/audio',path.join('bundle',brand.name,'audio'),{recursive:true});console.log('Built bundle/'+brand.name);
