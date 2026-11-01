// Copy the repository's audited, self-hosted pdf.js distribution into Nocturne.
// No public CDN or external PDF processing; the file remains on the user's device.
import {copyFileSync,existsSync,mkdirSync,statSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,dirname,resolve} from 'node:path';
const appDir=dirname(fileURLToPath(import.meta.url));
const repoRoot=resolve(appDir,'../..');
const input=join(repoRoot,'vendor/pdfjs');
const output=join(appDir,'public/vendor/pdfjs');
mkdirSync(output,{recursive:true});
for(const name of ['pdf.min.js','pdf.worker.min.js','LICENSE']){
 const from=join(input,name),to=join(output,name);
 if(!existsSync(from)||statSync(from).size===0)throw Error('Missing audited pdf.js asset: '+name);
 copyFileSync(from,to);
}
console.log('Nocturne payroll PDF assets prepared (self-hosted).');

// Lector de tickets en el móvil (01-11-2026): tesseract.js 7 auditado en vendor/tesseract, servido desde /vendor/tesseract.
// Cada archivo se comprueba por SHA-256: si cambia sin actualizar esta lista, la compilación falla.
const TESSERACT=[
 ["tesseract.min.js","000c27d9cd0def655f77b36c72a389c0ab13793aa31cb4d7aab56d09c0afbc7e"],
 ["worker.min.js","576b7df7e3393e137e51849357c9adb53fe7ac1bb69bfa06cf3d61520f182c6d"],
 ["core/tesseract-core-lstm.wasm.js","eef5f8b2f8e20e150680b20adaec4a60babafee3adbe8a94583c81fee46e8680"],
 ["core/tesseract-core-relaxedsimd-lstm.wasm.js","861a536cf9ef8e63cb644d57bab39c388f37f7d6b6f60024b741c5f6b39a59b3"],
 ["core/tesseract-core-simd-lstm.wasm.js","c58b46a4c796c0b8afccf77591d5b875b6896b45d402bbce8caa6f5362447b38"],
 ["lang/nld.traineddata.gz","a2d904b6ddc4feb0d31ecfcd7361a554102e7aa2e278c54f4fc029e0d0815571"],
 ["LICENSE","b40930bbcf80744c86c46a12bc9da056641d722716c378f5659b9e555ef833e1"]
];
for(const [name,sha] of TESSERACT){
 const from=join(repoRoot,'vendor/tesseract',name),to=join(appDir,'public/vendor/tesseract',name);
 if(!existsSync(from))throw Error('Missing audited tesseract asset: '+name);
 if(createHash('sha256').update(readFileSync(from)).digest('hex')!==sha)throw Error('Tesseract asset hash mismatch: '+name);
 mkdirSync(dirname(to),{recursive:true});
 copyFileSync(from,to);
}
console.log('Nocturne receipt OCR assets prepared (self-hosted, SHA-256 verified).');
