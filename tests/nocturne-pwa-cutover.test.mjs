import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sw=readFileSync('apps/rise-react/public/sw.js','utf8');
test('Nocturne retires obsolete classic caches, never clears user storage',()=>{
 assert.match(sw,/renzo-hub-/);
 assert.match(sw,/rise-nocturne-static-/);
 assert.match(sw,/caches\.delete/);
 assert.doesNotMatch(sw,/localStorage\.(clear|removeItem)|indexedDB\.deleteDatabase/);
});
test('SW only caches static assets and never API or private navigations',()=>{
 assert.match(sw,/req\.mode === "navigate"/);
 assert.match(sw,/req\.method !== "GET"/);
 assert.match(sw,/\/assets\//);
 assert.doesNotMatch(sw,/cache\.put\(['"]\/api\/supabase-config/);
});
