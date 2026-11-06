// Reuse already-installed versions and registry integrity records when registry access is unavailable.
const fs=require('fs'),assert=require('assert/strict');
const roots=['D:/Projects/_Other/Arr_LayoutEditor','D:/Projects/Phaser/WAT_SolitaireNextGen'];
const locks=roots.map(r=>JSON.parse(fs.readFileSync(r+'/package-lock.json')).packages);
const pkg=JSON.parse(fs.readFileSync('package.json')),packages={'':{name:pkg.name,version:pkg.version,dependencies:pkg.dependencies,devDependencies:pkg.devDependencies}};
function add(index,key){const entry=locks[index][key];assert(entry,key);if(packages[key]){assert.equal(packages[key].version,entry.version);return;}packages[key]={...entry};for(const name of Object.keys({...entry.dependencies,...entry.optionalDependencies})){let current=key,found;while(current){const candidate=current+'/node_modules/'+name;if(locks[index][candidate]){found=candidate;break;}const i=current.lastIndexOf('/node_modules/');current=i<0?'':current.slice(0,i);}found??='node_modules/'+name;add(index,found);}for(const name of Object.keys(entry.peerDependencies||{})){if(!entry.peerDependenciesMeta?.[name]?.optional && locks[index]['node_modules/'+name])add(index,'node_modules/'+name);}}
for(const [name,version]of Object.entries({...pkg.dependencies,...pkg.devDependencies})){const index=['three','@types/three'].includes(name)?1:0;assert.equal(locks[index]['node_modules/'+name].version,version);add(index,'node_modules/'+name);}
fs.writeFileSync('package-lock.json',JSON.stringify({name:pkg.name,version:pkg.version,lockfileVersion:3,requires:true,packages},null,2)+'\n');
console.log('Pinned '+Object.keys(packages).length+' dependency entries from existing registry lock records.');
