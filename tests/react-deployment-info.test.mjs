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
test('React SSR wires metadata endpoint and release manifest matches root',()=>{
 assert.match(readFileSync('apps/rise-react/src/server.ts','utf8'),/\/api\/deployment-info/);
 assert.deepEqual(JSON.parse(readFileSync('apps/rise-react/public/release.json')),JSON.parse(readFileSync('release.json')));
});
