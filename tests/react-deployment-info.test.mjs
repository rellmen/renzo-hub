import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import handler from '../apps/rise-react/api/deployment-info.js';
import classic from '../api/deployment-info.js';
import {serveNodeHandler} from '../apps/rise-react/src/lib/server/node-handler.mjs';
test('React deployment metadata preserves classic response contract and no-store',async()=>{
 const a=await serveNodeHandler(new Request('https://test.invalid/api/deployment-info'),handler);
 const b=await serveNodeHandler(new Request('https://test.invalid/api/deployment-info'),classic);
 assert.equal(a.status,200);assert.deepEqual(await a.json(),await b.json());
 assert.match(a.headers.get('cache-control'),/no-store/);
 const wrong=await serveNodeHandler(new Request('https://test.invalid/api/deployment-info',{method:'DELETE'}),handler);
 assert.equal(wrong.status,405);assert.equal(wrong.headers.get('allow'),'GET');
});
test('React SSR wires metadata and Nocturne release evolves independently of frozen Classic',()=>{
 assert.match(readFileSync('apps/rise-react/src/server.ts','utf8'),/\/api\/deployment-info/);
 const react=JSON.parse(readFileSync('apps/rise-react/public/release.json'));
 const classic=JSON.parse(readFileSync('release.json'));
 assert.match(react.release,/^\d+\.\d+\.\d+$/);
 assert.match(react.updated,/^\d{4}-\d{2}-\d{2}$/);
 assert.ok(react.name.trim());
 for(const key of ['production','preview','source'])assert.equal(react[key],classic[key]);
 assert.equal(classic.release,'2.55.0','Classic backup remains frozen');
});
