import type { CannonData, LaneData } from '../core/cannons.ts';

// Authored for the 60-second overload level; validate with scripts/plan-cannons.mjs.
// Lanes are left, center, right; front cannon first. "blue" is cyan.
export const overloadQueues:CannonData[][]=[
  [{color:'blue',ammo:4}, {color:'white',ammo:16}, {color:'blue',ammo:20}, {color:'white',ammo:17}, {color:'purple',ammo:17}, {color:'pink',ammo:30}, {color:'green',ammo:4}],
  [{color:'purple',ammo:5}, {color:'white',ammo:14}, {color:'black',ammo:19}, {color:'white',ammo:12}, {color:'green',ammo:8}, {color:'blue',ammo:19}],
  [{color:'purple',ammo:9}, {color:'white',ammo:19}, {color:'purple',ammo:20}, {color:'white',ammo:19}, {color:'yellow',ammo:18}, {color:'black',ammo:22}],
];

// A stable suggested route, not automatic launches. IDs belong only to levels/overload-level.arrow-flow.json.
export const overloadHintOrder=[19,51,57,15,2,52,0,43,42,20,12,58,13,54,39,3,53,31,32,21,56,55,16,47,23,37,22,40,41,11,35,34,38,36,10,6,59,46,50,30,45,4,14,17,18,8,7,24,5,29,28,48,26,25,49,1,9,27,33,44];

export function overloadShooters(lanes:LaneData[]):LaneData[]{
  if(lanes.length!==3)throw new Error('Conveyor overload requires three cannon containers');
  return [...lanes].sort((a,b)=>a.position[0]-b.position[0]).map((lane,i)=>({...lane,queue:overloadQueues[i].map(c=>({...c}))}));
}
