import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {transformSync} from 'esbuild';

const file=new URL('../apps/rise-react/src/routes/ajustes.tsx',import.meta.url);
const src=readFileSync(file,'utf8');
test('Private Settings parses and uses real Supabase authentication',()=>{
 const result=transformSync(src,{loader:'tsx',format:'esm',jsx:'automatic',target:'es2022'});
 assert(result.code.length>100);
 assert.match(src,/useAuth/);
 assert.match(src,/signOut\(/);
 assert.match(src,/user\?\.email/);
});
test('Settings contains no fictitious personal data or demo reset controls',()=>{
 assert.doesNotMatch(src,/clearDemoStorage|DemoDataBadge|useLocalStorage|Restablecer datos de ejemplo/);
 assert.doesNotMatch(src,/sin cuentas, servidores|todas las cifras son ficticias|guiones locales/);
 assert.match(src,/no ha hecho ninguna migración destructiva/);
 assert.match(src,/PWA|progresiva/i);
});
