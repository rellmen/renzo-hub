import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Producción (renzo-hub.vercel.app) sirve Nocturne con apps/rise-react/vercel.json desde el 24-10-2026.
// La auditoría del 31-10-2026 detectó que faltaba la CSP: esta prueba impide que vuelva a desaparecer.
const cfg=JSON.parse(readFileSync(new URL('../apps/rise-react/vercel.json',import.meta.url),'utf8'));
const all=cfg.headers.find(h=>h.source==='/(.*)').headers;
const get=k=>all.find(h=>h.key===k)?.value||'';
const csp=get('Content-Security-Policy');
const directive=name=>csp.split(';').map(s=>s.trim()).find(s=>s.startsWith(name+' '))||'';

test('Nocturne publica CSP, nosniff, DENY y Referrer-Policy en todas las rutas',()=>{
 assert.ok(csp,'falta Content-Security-Policy');
 assert.equal(get('X-Content-Type-Options'),'nosniff');
 assert.equal(get('X-Frame-Options'),'DENY');
 assert.equal(get('Referrer-Policy'),'strict-origin-when-cross-origin');
});

test('CSP: sin orígenes de script externos, sin eval, sin iframes ni plugins',()=>{
 assert.equal(directive('default-src'),"default-src 'self'");
 const script=directive('script-src');
 assert.ok(!/https?:|\*|'unsafe-eval'/.test(script),script); // inline necesario para la hidratación SSR de TanStack
 for(const d of ["object-src 'none'","frame-ancestors 'none'","frame-src 'none'","base-uri 'self'","form-action 'self'"])
  assert.ok(csp.includes(d),d);
});

test('CSP: red solo hacia la app y Supabase; fuentes solo Google Fonts',()=>{
 assert.equal(directive('connect-src'),"connect-src 'self' https://*.supabase.co wss://*.supabase.co");
 assert.ok(directive('font-src').includes('https://fonts.gstatic.com'));
 assert.ok(directive('style-src').includes('https://fonts.googleapis.com'));
 assert.ok(directive('worker-src').startsWith("worker-src 'self'"),'pdf.js y el service worker se sirven desde la propia app');
});
