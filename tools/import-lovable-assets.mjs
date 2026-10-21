#!/usr/bin/env node
/**
 * Import the EXACT JPEG assets already stored in Lovable. Does not generate,
 * convert, recompress, resample, replace, or download any media.
 * Usage:
 *   node tools/import-lovable-assets.mjs /path/to/lovable-project
 *   node tools/import-lovable-assets.mjs /path/to/export/src/assets --dry-run
 * The input may be an exported project root or the src/assets folder.
 */
import {createHash} from 'node:crypto';
import {readFile, lstat, mkdir, writeFile, rename, stat, unlink} from 'node:fs/promises';
import {resolve,join,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const NAMES=Object.freeze([
  'ares.jpg','gym.jpg','hero-eclipse.jpg','learn.jpg','money.jpg','projects.jpg','skin.jpg'
]);
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const dest=join(root,'apps/rise-react/src/assets');

export function inspectJpeg(buffer,name){
  if(!Buffer.isBuffer(buffer)||buffer.length<1024)throw Error(name+': file too small or not a valid JPEG');
  if(buffer[0]!==0xff||buffer[1]!==0xd8||buffer[2]!==0xff)
    throw Error(name+': JPEG signature mismatch');
  if(buffer[buffer.length-2]!==0xff||buffer[buffer.length-1]!==0xd9)
    throw Error(name+': JPEG end-of-image marker missing or trailing bytes present');
  return {name,bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')};
}
async function chooseInput(p){
  const direct=resolve(p);
  for(const candidate of [join(direct,'src/assets'),direct]){
    try{const x=await stat(join(candidate,NAMES[0]));if(x.isFile())return candidate;}catch{}
  }
  throw Error('Lovable export must contain src/assets/ares.jpg (or pass src/assets as source).');
}
export async function importLovableAssets(source,{dryRun=false,outputDir=dest}={}){
  const input=await chooseInput(source);
  const checked=[];
  // Validate all seven files before writing even one destination file.
  for(const name of NAMES){
    const path=join(input,name);
    const info=await lstat(path);
    if(!info.isFile()||info.isSymbolicLink())throw Error(name+': symlinks and non-files are forbidden');
    const bytes=await readFile(path);
    checked.push({path,buffer:bytes,...inspectJpeg(bytes,name)});
  }
  // Do not replace another person's artwork silently, even in a feature branch.
  const output=resolve(outputDir);
  const existing=[];
  for(const entry of checked){
    const target=join(output,entry.name);
    let data=null;
    try{data=await readFile(target);}catch(e){if(e?.code!=='ENOENT')throw e;}
    if(data&&!data.equals(entry.buffer))throw Error('Refusing to overwrite a different image: '+entry.name);
    existing.push({name:entry.name,identical:!!data});
  }
  const manifest={
    source:'Lovable project ca43e152-f7c7-4c8e-b925-01476b9053da',
    sourceCommit:'c68f0b618b59c16930bf1f6ad0e1b44e0bf81deb',
    importedAt:new Date().toISOString(),
    images:checked.map(({name,bytes,sha256})=>({name,bytes,sha256}))
  };
  if(!dryRun){
    await mkdir(output,{recursive:true});
    for(const e of checked){
      if(existing.find(x=>x.name===e.name)?.identical)continue;
      const tmp=join(output,'.'+e.name+'.tmp-'+process.pid);
      try{await writeFile(tmp,e.buffer,{flag:'wx',mode:0o644});await rename(tmp,join(output,e.name));}
      finally{try{await unlink(tmp);}catch{}}
    }
    await writeFile(join(output,'lovable-originals.manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  }
  return {dryRun,input,output,alreadyIdentical:existing.filter(e=>e.identical).length,manifest};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const input=process.argv.find((v,i)=>i>=2&&!v.startsWith('-'));
  if(!input){console.error('Usage: node tools/import-lovable-assets.mjs <export-project-root|src/assets> [--dry-run]');process.exitCode=2;}
  else{
    try{const result=await importLovableAssets(input,{dryRun:process.argv.includes('--dry-run')});
      console.log(JSON.stringify(result,null,2));}
    catch(e){console.error(String(e?.message||e));process.exitCode=1;}
  }
}
