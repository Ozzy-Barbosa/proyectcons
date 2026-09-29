// Read-only publication check. No forms or WhatsApp messages are submitted.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),context);
const base=new URL(context.window.PROJECTCONS_CONFIG.domain);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.name.startsWith('.')?[]:entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const files=walk(root).filter(file=>file.endsWith('.html'));
const assets=new Set();
let checked=0;
async function inspect(file){
  const relative=path.relative(root,file).replaceAll('\\','/');
  const address=new URL(relative,base);
  const response=await fetch(address,{signal:AbortSignal.timeout(20000)});
  assert.equal(response.status,200,`${address}: status`);
  const html=await response.text();
  assert.equal(html.replaceAll('\r\n','\n'),fs.readFileSync(file,'utf8').replaceAll('\r\n','\n'),`${relative}: published HTML differs from working tree`);
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const target=new URL(match[1].replaceAll('&amp;','&'),address);
    if(target.origin===base.origin&&/\.(?:webp|png|jpeg|svg|css|js|webmanifest)$/.test(target.pathname))assets.add(target.href);
  }
  checked++;
}
async function batches(items,fn){for(let i=0;i<items.length;i+=8)await Promise.all(items.slice(i,i+8).map(fn));}
(async()=>{
  await batches(files,inspect);
  await batches([...assets],async asset=>assert.equal((await fetch(asset,{method:'HEAD',signal:AbortSignal.timeout(20000)})).status,200,asset));
  const missing=await fetch(new URL('ruta-inexistente/verificacion-404/',base),{signal:AbortSignal.timeout(20000)});
  assert.equal(missing.status,404,'Missing route must return 404');
  assert.ok((await missing.text()).includes('FUERA DEL PLANO'),'Custom404 must be served');
  console.log(`PUBLICATION VERIFIED: ${checked} HTML match locally generated pages; ${assets.size} assets HTTP200; deep route custom404 confirmed. No message sent.`);
})().catch(error=>{console.error(error.message,error.cause?.code||'',error.cause?.message||'');process.exitCode=1;});
