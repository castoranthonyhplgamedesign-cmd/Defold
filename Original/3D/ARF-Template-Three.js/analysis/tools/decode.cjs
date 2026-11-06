const fs=require('fs'),path=require('path'),assert=require('assert');
const ts=require('D:/Projects/Phaser/Bubble-Cash--Template/node_modules/typescript');
const base='analysis/extracted/bundle';
for(const [name,value] of Object.entries(JSON.parse(fs.readFileSync(base+'/__res','utf8')))){
 const dest=path.resolve(base,name);assert(dest.startsWith(path.resolve(base)+path.sep));fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.writeFileSync(dest,value.startsWith('data:')?Buffer.from(value.slice(value.indexOf(',')+1),'base64'):value);
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of walk(base).filter(x=>/\.(js|json)$/.test(x))){
 let s=fs.readFileSync(file,'utf8');
 if(file.endsWith('.json')){try{fs.writeFileSync(file+'.pretty.json',JSON.stringify(JSON.parse(s),null,2));}catch{}continue;}
 const tableMatch=s.match(/var a=(\[[\s\S]*?\]);/), offsetMatch=s.match(/function b\(\w+,\w+\)\{\w+=\w+-(0x[0-9a-f]+);/),exprMatch=s.match(/try\{var \w+=(.*?);if\(\w+===\w+\)/),targetMatch=s.match(/\}\}\}\(a,(0x[0-9a-f]+)\)/);
 if(tableMatch&&offsetMatch&&exprMatch&&targetMatch){
  const arr=ts.createSourceFile('a.js','const a='+tableMatch[1],ts.ScriptTarget.Latest,true).statements[0].declarationList.declarations[0].initializer.elements.map(n=>{assert(ts.isStringLiteral(n));return n.text;});
  const offset=Number(offsetMatch[1]),target=Number(targetMatch[1]);
  const exp=ts.createSourceFile('a.js','const a='+exprMatch[1],ts.ScriptTarget.Latest,true).statements[0].declarationList.declarations[0].initializer;
  function calc(n){if(ts.isNumericLiteral(n))return Number(n.text);if(ts.isPrefixUnaryExpression(n))return n.operator===ts.SyntaxKind.MinusToken?-calc(n.operand):calc(n.operand);if(ts.isCallExpression(n)){if(n.expression.getText()==='parseInt')return parseInt(calc(n.arguments[0]));assert.equal(n.arguments.length,1);return arr[calc(n.arguments[0])-offset];}if(ts.isBinaryExpression(n)){let a=calc(n.left),b=calc(n.right);switch(n.operatorToken.kind){case ts.SyntaxKind.PlusToken:return a+b;case ts.SyntaxKind.MinusToken:return a-b;case ts.SyntaxKind.AsteriskToken:return a*b;case ts.SyntaxKind.SlashToken:return a/b;}}throw Error('Unsupported expression '+n.getText());}
  let rotation=0;while(rotation<arr.length&&calc(exp)!==target){arr.push(arr.shift());rotation++;}assert(rotation<arr.length);
  s=s.replace(/\b\w+\((0x[0-9a-f]+)\)/g,(m,n)=>Number(n)>=offset&&Number(n)<offset+arr.length?JSON.stringify(arr[Number(n)-offset]):m);
  fs.writeFileSync(file+'.strings.json',JSON.stringify({offset,rotation,strings:arr},null,2));
 }
 const ast=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);fs.writeFileSync(file+'.pretty.js',ts.createPrinter().printFile(ast));
}
console.log('Decoded data URI resources and printed JS/JSON.');
