// Compare the Lua replay with actual original class methods, without a browser.
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {transformSync} from '../tools/reference/node_modules/esbuild/lib/main.js';
const constants=JSON.parse(fs.readFileSync('docs/source-constants.json','utf8'));
const source=fs.readFileSync('tools/reference/src/game/CoinCylinderLevel.ts','utf8');
const bare=source.replace(/^import[\s\S]*?;\s*/gm,'').replace('export class CoinCylinderLevel','class CoinCylinderLevel');
const js=transformSync(bare,{loader:'ts',target:'es2022',format:'cjs'}).code;
const context={...constants,Phaser:{Math:{Clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),Linear:(a,b,t)=>a+(b-a)*t}},console};
vm.createContext(context);vm.runInContext(js+'\nglobalThis.SourceLevel=CoinCylinderLevel;',context);
const levels=[0,1].map(index=>{
  const level=Object.create(context.SourceLevel.prototype);
  level.config=constants.LEVEL_CONFIGS[index];
  level.rowSegmentLaneOffsets=[...level.config.initialRowSegmentOffsets];
  level.rowSegmentRotations=new Array(level.config.rowSegmentCount).fill(0);
  level.clearedOuterSourceLanes=Array.from({length:level.config.rowSegmentCount},()=>new Set());
  level.outerRowSegmentLaneVisuals=constants.LEVEL_EDITOR_CONFIG.levels[index].outerCylinder.rowSegmentColors.map(row=>row.map(colorType=>({colorType})));
  return level;
});
const counts=[0,0];
const replay=JSON.parse(fs.readFileSync('qa/rotation-replay.json','utf8'));
for(const [index,row,step,expected] of replay){
  const level=levels[index-1];
  level.rowSegmentLaneOffsets[row-1]=(level.rowSegmentLaneOffsets[row-1]+step+12)%12;
  const actual=[];
  for(let lane=0;lane<12;lane++){
    const color=level.getOuterLaneColorType(0,lane);
    if(level.isOuterDisplayLaneEmpty(0,lane))continue;
    if(level.rowSegmentLaneOffsets.every((_,r)=>!level.isOuterDisplayLaneEmpty(r,lane)&&level.getOuterLaneColorType(r,lane)===color))actual.push(lane);
  }
  assert.deepEqual([...actual].sort((a,b)=>a-b),[...expected].sort((a,b)=>a-b),`source matching diverged at level ${index}, row ${row}, step ${step}`);
  for(const lane of actual)level.clearOuterDisplayLane(lane);
  counts[index-1]+=actual.length;
}
assert.ok(counts[0]>=2&&counts[1]>=3);
for(const value of [-2.5,-1.5,-.5,-.4,0,.4,.5,1.5,2.5])assert.equal(levels[0].getRowSegmentStep(value),Math.abs(value)>=.38?Math.round(value):0);
const report={status:'PASS',source_sha256:crypto.createHash('sha256').update(source).digest('hex'),moves:replay.length,matched_columns:counts,method:'Original CoinCylinderLevel methods executed on its real constants; Lua-generated legal rotation replay compared after every move.'};
fs.writeFileSync('qa/rules-comparison.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
