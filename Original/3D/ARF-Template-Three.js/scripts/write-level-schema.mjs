import fs from 'node:fs';
const number={type:'number',minimum:-1000,maximum:1000};
const pair={type:'array',items:number,minItems:2,maxItems:2};
const cell={...pair,items:{...number,type:'integer'}};
const color={enum:['green','blue','orange','black','pink','purple','yellow']};
const id={type:'string',minLength:1,maxLength:128};
const obj=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
const array=(items,minItems,maxItems)=>({type:'array',items,minItems,maxItems});
const buffer={type:'string',maxLength:1600000,pattern:'^[A-Za-z0-9+/]*={0,2}$'};
const mesh=obj({parts:array(obj({position:buffer,normal:buffer,index:buffer}),2,2),surface:array(array(pair,3,1024),2,2)});
const conveyor={points:array(pair,3,64),width:{type:'number',minimum:1.1,maximum:3},direction:{enum:[1,-1]}};
const drawnConveyor=obj({...conveyor});drawnConveyor.properties.cornerRadius={type:'number',minimum:0,maximum:10};
const importedConveyor=obj({...conveyor,points:array(pair,3,1024),mesh});importedConveyor.properties.cornerRadius={const:0};
const cannon=obj({id,progress:{type:'number',minimum:0,exclusiveMaximum:1},offset:{type:'number',minimum:4,maximum:7},angle:{anyOf:[{type:'null'},{type:'number',minimum:-180,maximum:180}]},queue:array(obj({color,ammo:{type:'integer',minimum:1,maximum:500}}),1,32)});
cannon.properties.position=pair;
const schema={
 $schema:'http://json-schema.org/draft-07/schema#',title:'Arrow Flow level v1',
 description:'Structural contract. Runtime validation additionally enforces cell uniqueness, contiguity, simple loop geometry, belt clearance and cannon placement. Inward bends are supported.',
 ...obj({kind:{const:'arrow-flow'},version:{const:1},name:id,origin:pair,
  board:obj({bounds:obj({minX:{...number,type:'integer'},minY:{...number,type:'integer'},width:{type:'integer',minimum:1,maximum:100},height:{type:'integer',minimum:1,maximum:100}}),
   arrows:array(obj({id,color,head:cell,body:array(cell,0,500),facing:{enum:['Top','Right','Bottom','Left']}}),1,500)}),
  conveyor:{oneOf:[drawnConveyor,importedConveyor]},
  cannons:array(cannon,0,16)
 })
};
schema.properties.board.properties.grid=obj({size:{type:'number',minimum:.5,maximum:1.5},offset:pair});
fs.mkdirSync('schemas',{recursive:true});fs.writeFileSync('schemas/arrow-flow-v1.schema.json',JSON.stringify(schema,null,2)+'\n');
