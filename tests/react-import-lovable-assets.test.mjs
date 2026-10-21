import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,readdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {importLovableAssets,inspectJpeg} from '../tools/import-lovable-assets.mjs';

const names=['ares','gym','hero-eclipse','learn','money','projects','skin'].map(n=>n+'.jpg');
function syntheticJpeg(i){
  // Dummy file ONLY in temporary unit-test directories; never a RISE HUB asset.
  const b=Buffer.alloc(1500+i,0x52);
  b[0]=0xff;b[1]=0xd8;b[2]=0xff;b[3]=0xe0;
  b[b.length-2]=0xff;b[b.length-1]=0xd9;
  return b;
}
async function fixture(){
 const root=await mkdtemp(join(tmpdir(),'lovable-jpg-test-'));
 const src=join(root,'export','src','assets');
 const out=join(root,'repo','apps','rise-react','src','assets');
 await mkdir(src,{recursive:true});
 for(const [i,name] of names.entries())await writeFile(join(src,name),syntheticJpeg(i));
 return {root,src,out};
}
test('Importer checks seven original-file names and SHA-256 without altering source',async t=>{
 const f=await fixture();t.after(()=>rm(f.root,{recursive:true,force:true}));
 const before=await readFile(join(f.src,names[0]));
 const audit=await importLovableAssets(join(f.root,'export'),{dryRun:true,outputDir:f.out});
 assert.equal(audit.manifest.images.length,7);
 assert.equal(audit.manifest.images[0].sha256,inspectJpeg(before,names[0]).sha256);
 await assert.rejects(readdir(f.out),{code:'ENOENT'});
});
test('Importer preserves every input byte and refuses to overwrite a different file',async t=>{
 const f=await fixture();t.after(()=>rm(f.root,{recursive:true,force:true}));
 const saved=await importLovableAssets(join(f.root,'export'),{outputDir:f.out});
 assert.equal(saved.manifest.images.length,7);
 for(const name of names)assert.deepEqual(await readFile(join(f.out,name)),await readFile(join(f.src,name)));
 assert.equal((await importLovableAssets(f.src,{outputDir:f.out})).alreadyIdentical,7);
 const bytes=syntheticJpeg(50);
 await writeFile(join(f.out,names[0]),bytes);
 await assert.rejects(importLovableAssets(f.src,{outputDir:f.out}),/Refusing to overwrite/);
 assert.deepEqual(await readFile(join(f.out,names[0])),bytes);
});
test('All originals must be present and JPG-shaped before writing any destination',async t=>{
 const f=await fixture();t.after(()=>rm(f.root,{recursive:true,force:true}));
 await rm(join(f.src,'skin.jpg'));
 await assert.rejects(importLovableAssets(f.src,{outputDir:f.out}));
 await assert.rejects(readdir(f.out),{code:'ENOENT'});
 await writeFile(join(f.src,'skin.jpg'),Buffer.from('not a jpeg'));
 await assert.rejects(importLovableAssets(f.src,{outputDir:f.out}),/too small|signature/);
 await assert.rejects(readdir(f.out),{code:'ENOENT'});
});
