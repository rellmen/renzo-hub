import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=x=>readFileSync(new URL('../'+x,import.meta.url),'utf8');
const html=read('index.html'),css=read('assets/nocturne-vnext.css'),sw=read('sw.js');
const release=JSON.parse(read('release.json'));
test('Nocturne vNext bridge overlays correct production DOM, not legacy Home',()=>{
 assert.match(html,/<section id="home" class="page active rx-page rx-home">/);
 assert.ok(css.includes('#home.rx-home .rx-home-top'));
 assert.ok(css.includes('#home .rx-area-link'));
 assert.ok(css.includes('.rx-real-screen-head h1'));
 assert.ok(html.indexOf('/assets/nocturne-vnext.css')>html.indexOf('/assets/rise-vnext.css'));
 assert.equal((html.match(/nocturne-vnext\.css/g)||[]).length,1);
 for(const name of ['body','study','ares-center','money','work','more']){
  assert.ok(html.includes('data-open="'+name+'"'),'Missing actual route '+name);
 }
});
test('Theme remains accessible and independent of business logic',()=>{
 for(const hex of ['#111116','#481d35','#6149a6','#c5c9d4','#c6a16c']){
  assert.ok(css.includes(hex),'Missing identity '+hex);
 }
 assert.match(css,/focus-visible/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.doesNotMatch(css,/@import\b|url\(\s*['"]?https?:\/\//i);
 assert.equal(css.split('{').length,css.split('}').length);
 for(const section of ['#gym','#money','#study','#skin','#food','#ares-center']){
  assert.ok(css.includes(section),'Missing module identity '+section);
 }
});
test('Nocturne vNext has a distinct PWA version and offline CSS',()=>{
 assert.equal(release.release,'2.55.0');
 assert.match(sw,/renzo-hub-cloud-v59-nocturne-vnext/);
 assert.ok(sw.includes("'/assets/nocturne-vnext.css'"));
 assert.equal(JSON.parse(read('manifest.webmanifest')).theme_color,'#111116');
 assert.match(html,/<meta name="theme-color" content="#111116">/);
});
