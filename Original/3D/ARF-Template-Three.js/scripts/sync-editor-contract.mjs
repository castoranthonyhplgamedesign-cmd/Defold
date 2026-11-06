import fs from 'node:fs';
import path from 'node:path';
const editor=path.resolve(process.argv[2]??'D:/Projects/_Other/Arr_LayoutEditor');
if(!fs.existsSync(path.join(editor,'src/core.ts')))throw new Error('Expected the Point Out editor checkout');
fs.copyFileSync('src/layout/arrowFlow.ts',path.join(editor,'src/arrowFlowContract.ts'));
fs.copyFileSync('schemas/arrow-flow-v1.schema.json',path.join(editor,'arrow-flow-v1.schema.json'));
for(const name of ['reference','four-sides','inward-bend'])fs.copyFileSync(`examples/levels/${name}.arrow-flow.json`,path.join(editor,`public/examples/${name}.arrow-flow.json`));
console.log('Synced the data-only Arrow Flow contract to the editor.');
