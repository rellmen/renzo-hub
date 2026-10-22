import test from 'node:test';
import assert from 'node:assert/strict';
import {serveNodeHandler} from '../apps/rise-react/src/lib/server/node-handler.mjs';
import handler from '../api/ares-ai.js';
import reactHandler from '../apps/rise-react/api/ares-ai.js';
import sharedHandler from '../apps/rise-react/server/ares-ai.mjs';
test('Classic and React Vercel entries reuse the same ESM server handler',()=>{
 assert.equal(handler,sharedHandler);assert.equal(reactHandler,sharedHandler);
});
test('Same-origin Fetch transport exposes classic GET status and safe POST errors',async()=>{
 const get=await serveNodeHandler(new Request('https://example.test/api/ares-ai'),handler);
 assert.equal(get.status,200);assert.match(get.headers.get('cache-control'),/no-store/);
 assert.equal((await get.json()).provider,'OpenRouter');
 const bad=await serveNodeHandler(new Request('https://example.test/api/ares-ai',{method:'POST',headers:{'content-type':'application/json'},body:'{'}),handler);
 assert.equal(bad.status,400);
 const large=await serveNodeHandler(new Request('https://example.test/api/ares-ai',{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(17000)}),handler);
 assert.equal(large.status,413);
 const put=await serveNodeHandler(new Request('https://example.test/api/ares-ai',{method:'PUT'}),handler);
 assert.equal(put.status,405);assert.equal(put.headers.get('allow'),'GET, POST');
});
