// Copy the repository's audited, self-hosted pdf.js distribution into Nocturne.
// No public CDN or external PDF processing; the file remains on the user's device.
import {copyFileSync,existsSync,mkdirSync,statSync} from 'node:fs';
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
