import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const match=sw.match(/const CORE=\[([^\]]*)\];/);
test('PWA precache has no duplicate URLs, so Cache.addAll never rejects duplicate requests',()=>{
 assert(match,'CORE must remain a static audited list');
 const names=[...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
 assert(names.length>=10,'Precache list unexpectedly empty');
 assert.deepEqual(names.filter((name,i)=>names.indexOf(name)!==i),[],'Duplicate precache request causes InvalidStateError');
 assert(names.every(path=>path.startsWith('/')&&!path.includes('?')));
});
test('PWA precache resources exist on disk',()=>{
 const names=[...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
 for(const pathname of names){if(pathname==='/')continue;assert(existsSync(new URL('..'+pathname,import.meta.url)),`Missing asset ${pathname}`);}
});
test('PWA cache version is advanced after fixing broken install',()=>{
 const version=sw.match(/const CACHE='renzo-hub-cloud-v(\d+)-[a-z0-9-]+';/);
 assert(version,'Cache must use a versioned release key');
 assert(Number(version[1])>=45,'Cache version must not regress below the fixed v45 install');
 assert.match(sw,/cache[s]?\.open\(CACHE\)/);
});