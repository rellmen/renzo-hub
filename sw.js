const CACHE='renzo-hub-cloud-v6.2-nominas-faltan';
const CORE=['/payroll.js','/payroll.css','/payroll-demo.js','/','/app.js','/profile.js','/phase1.js','/gym.js','/news.js','/world.js','/world-extensions.js','/jarvis-ui.js','/manifest.webmanifest','/release.json','/assets/renzo-hub-icon.svg','/assets/icon-180.png','/assets/icon-192.png','/assets/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>fetch('/api/supabase-config',{cache:'no-store'}).then(r=>r.ok?caches.open(CACHE).then(c=>c.put('/api/supabase-config',r)):null).catch(()=>null))));
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('renzo-hub-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 if(new URL(e.request.url).pathname==='/api/supabase-config'){
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put('/api/supabase-config',copy)));}return r;}).catch(()=>caches.match('/api/supabase-config')));return;
 }
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put('/',copy)));}return r;}).catch(()=>caches.match('/')));
 }else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));}
});
