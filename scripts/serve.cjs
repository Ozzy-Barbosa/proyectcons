// Preview only the compiled Astro release, including the /proyectcons/ Pages base path.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const projectRoot = path.resolve(__dirname,'..');
const root = path.resolve(projectRoot,process.argv[2]||process.env.SITE_DIR||'dist');
if(!fs.existsSync(path.join(root,'index.html'))||!fs.existsSync(path.join(root,'404.html'))){
  console.error(`Falta la salida compilada en ${root}. Ejecuta npm run build antes de abrir la vista previa.`);
  process.exit(1);
}
const port = Number(process.env.PORT||4173);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('PORT must be an integer between 1024 and 65535.');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.webp':'image/webp','.jpeg':'image/jpeg','.jpg':'image/jpeg','.png':'image/png','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  let pathname;
  try {pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);} catch {res.writeHead(400).end();return;}
  if(pathname==='/proyectcons'){res.writeHead(308,{Location:'/proyectcons/'}).end();return;}
  pathname=pathname.replace(/^\/proyectcons(?=\/)/,'');
  if(pathname.endsWith('/'))pathname+='index.html';
  const filename=path.resolve(root,'.'+pathname);
  if(!filename.startsWith(root+path.sep) || /(^|[\/\\])\./.test(pathname)){res.writeHead(403).end();return;}
  if(!fs.existsSync(filename)||!fs.statSync(filename).isFile()){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(fs.readFileSync(path.join(root,'404.html')));return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(filename).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Astro release preview (${path.relative(projectRoot,root)||'.'}): http://127.0.0.1:${port}/proyectcons/`));
