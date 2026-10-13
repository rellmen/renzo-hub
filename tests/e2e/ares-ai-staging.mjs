// E2E real Supabase staging: no records mutated, no production credentials.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const { BASE_URL='http://localhost:43477', SUPABASE_URL, E2E_EMAIL, E2E_PASSWORD } = process.env;
if (!SUPABASE_URL?.includes('zpueziugbezqxompwsol') || !E2E_EMAIL || !E2E_PASSWORD) throw Error('Requires existing staging-only test user');
const browser = await chromium.launch();
try {
 const p=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(BASE_URL,{waitUntil:'networkidle'});
 await p.fill('#email',E2E_EMAIL);await p.fill('#password',E2E_PASSWORD);
 await p.click('#loginForm button[type=submit]');await p.waitForSelector('#appShell:not(.hidden)',{timeout:15000});
 await p.waitForFunction(()=>document.querySelector('#worldSyncStatus')?.textContent==='Sincronizado con Supabase',null,{timeout:15000});
 await p.locator('.ares-fab').waitFor({state:'visible'});
 await p.locator('.ares-fab').click();await p.locator('.ares-chat:visible').waitFor();
 await p.locator('[data-suggest="¿Cómo van mis proyectos?"]').click();
 await p.waitForFunction(()=>/Proyectos registrados activos|Proyecto:/.test(document.querySelector('.ares-chat-stream')?.textContent||''),null,{timeout:15000});
 assert(!(await p.locator('.ares-chat-stream').textContent()).includes('No he podido responder con datos verificados'));
 await p.locator('#aresQuestion').fill('¿Qué debo aprobar?');await p.locator('.ares-chat-form button[type=submit]').click();
 await p.waitForFunction(()=>/Revisiones pendientes:/.test(document.querySelector('.ares-chat-stream')?.textContent||''),null,{timeout:15000});
 assert.deepEqual(errors,[]);
 console.log('PASS Ares AI staging: login real, chat global, private RLS query and approvals read-only');
 await p.reload({waitUntil:'networkidle'});await p.waitForSelector('#appShell:not(.hidden)',{timeout:15000});
 await p.locator('.ares-fab').waitFor({state:'visible'});
 assert.equal(await p.locator('.ares-chat .ares-msg').count(),0,'Chat must not be persisted across reloads');
 console.log('PASS Ares AI: chat history not retained after reload');
 await p.close();
}finally{await browser.close();}
