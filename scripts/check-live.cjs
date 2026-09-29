// Read-only publication check against the Astro build. No forms or messages are submitted.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const projectRoot=path.resolve(__dirname,'..');
const root=path.resolve(projectRoot,process.argv[2]||process.env.SITE_DIR||'dist');
assert.ok(fs.existsSync(root)&&fs.statSync(root).isDirectory(),`Build missing at ${root}; run npm run build first.`);
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),context);
const base=new URL(context.window.PROJECTCONS_CONFIG.domain);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.name.startsWith('.')||['node_modules','public','src','test-results','tmp'].includes(entry.name)?[]:entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const files=walk(root).filter(file=>file.endsWith('.html'));
assert.equal(files.length,64,'Audit the complete 64-page Astro build, not source files or an older release.');
const assets=new Set();
let checked=0;
const normalized=value=>value.replaceAll('\r\n','\n');
async function request(address,options={}) {
  // One retry for transient transport errors, not for HTTP failures or mismatched output.
  try{return await fetch(address,{...options,signal:AbortSignal.timeout(20000)});}
  catch{return await fetch(address,{...options,signal:AbortSignal.timeout(20000)});}
}
function addAsset(value,address){
  const target=new URL(value.replaceAll('&amp;','&'),address);
  if(target.origin===base.origin&&target.pathname.startsWith(base.pathname)&&/\.(?:webp|png|jpeg|jpg|svg|css|js|webmanifest|woff2?)$/.test(target.pathname))assets.add(target.href);
}
async function inspect(file){
  const relative=path.relative(root,file).replaceAll('\\','/');
  const address=new URL(relative,base);
  const response=await request(address);
  assert.equal(response.status,200,`${address}: status`);
  const html=await response.text();
  assert.equal(normalized(html),normalized(fs.readFileSync(file,'utf8')),`${relative}: published HTML differs from the Astro build`);
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    addAsset(match[1],address);
  }
  for(const match of html.matchAll(/srcset="([^"]+)"/g))for(const candidate of match[1].split(','))addAsset(candidate.trim().split(/\s+/)[0],address);
  checked++;
}
async function batches(items,fn){for(let i=0;i<items.length;i+=8)await Promise.all(items.slice(i,i+8).map(fn));}
(async()=>{
  await batches(files,inspect);
  await batches([...assets],async asset=>{
    const address=new URL(asset);
    const isCode=/\.(?:css|js)$/.test(address.pathname);
    const response=await request(address,{method:isCode?'GET':'HEAD'});
    assert.equal(response.status,200,asset);
    if(isCode){
      const local=path.resolve(root,decodeURIComponent(address.pathname.slice(base.pathname.length)));
      assert.ok(local.startsWith(root+path.sep),'Asset must be inside the compiled output.');
      assert.equal(normalized(await response.text()),normalized(fs.readFileSync(local,'utf8')),`${asset}: published code differs from the Astro build`);
    }
  });
  const home=await request(base);
  assert.equal(home.status,200,'Public root must return 200');
  assert.equal(normalized(await home.text()),normalized(fs.readFileSync(path.join(root,'index.html'),'utf8')),'Public root must serve the new Astro home page');
  const missing=await request(new URL('ruta-inexistente/verificacion-404/',base));
  assert.equal(missing.status,404,'Missing route must return 404');
  assert.ok((await missing.text()).includes('FUERA DEL PLANO'),'Custom404 must be served');
  console.log(`PUBLICATION VERIFIED: ${checked} HTML match the Astro build; public home and CSS/JS match; ${assets.size} assets HTTP200 (including srcset variants); deep route custom404 confirmed. No message sent.`);
})().catch(error=>{console.error(error.message,error.cause?.code||'',error.cause?.message||'');process.exitCode=1;});
