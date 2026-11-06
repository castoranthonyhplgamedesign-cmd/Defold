import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const brand=JSON.parse(fs.readFileSync(new URL('../branding.json',import.meta.url),'utf8'));
const root=path.resolve(import.meta.dirname,'../publish',brand.name);
const port=Number(process.env.PORT||8188);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.wasm':'application/wasm','.json':'application/json','.png':'image/png','.wav':'audio/wav'};
http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
  if(pathname==='/')pathname='/index.html';
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404).end('Not found');return}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-store'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  });
}).listen(port,'127.0.0.1',()=>console.log(`${brand.name} local preview: http://127.0.0.1:${port}/`));
