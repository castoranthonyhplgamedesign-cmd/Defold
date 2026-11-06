import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
const lua=process.env.DEFOLD_LUA||path.resolve('../../../.tools/libexec/x86_64-win32/luajit-64.exe');
const r=spawnSync(lua,['qa/run.lua'],{encoding:'utf8',windowsHide:true,maxBuffer:2e6});fs.writeFileSync('qa/unit-results.txt',r.stdout+r.stderr);if(r.status!==0)throw Error(r.stdout+r.stderr);
const actual=r.stdout.trim().split(/\r?\n/).filter(x=>/^(tap|cut),/.test(x));const expected=JSON.parse(fs.readFileSync('qa/oracle.json'));
let compared=0;
for(const row of expected)for(const v of row.trace){const line=actual.find(x=>x.startsWith(`${row.mechanic},${v.frame},`));assert(line,'missing oracle frame');const a=line.split(',').slice(1).map(Number);assert.deepEqual(a,[v.frame,v.remaining,v.loose,v.exited,v.staticChecksum,v.looseChecksum],`${row.mechanic} frame ${v.frame}`);compared++;}
console.log(`PASS ${compared} original SandGrid oracle snapshots.`);console.log(r.stdout.split(/\r?\n/).find(x=>x.startsWith('PASS')));
