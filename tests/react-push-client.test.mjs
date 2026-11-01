import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {pushSupport,b64uToBytes,deviceLabel,subscriptionRow} from "../apps/rise-react/src/lib/push-client.mjs";

const win=(standalone=false,perm="default")=>({PushManager:function(){},Notification:{permission:perm},matchMedia:()=>({matches:standalone})});
const iphone="Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15";

test("iPhone en Safari: hay que instalar Rise en la pantalla de inicio; instalada, se puede activar",()=>{
 assert.deepEqual(pushSupport({userAgent:iphone,serviceWorker:{}},win(false)),{supported:true,ios:true,standalone:false,needsInstall:true,permission:"default"});
 assert.equal(pushSupport({userAgent:iphone,serviceWorker:{}},win(true,"granted")).needsInstall,false);
 assert.equal(pushSupport({userAgent:"Chrome Windows"},win()).supported,false);
 assert.equal(deviceLabel(iphone),"iPhone");
});

test("clave pública base64url → bytes; suscripción válida o error",()=>{
 assert.deepEqual([...b64uToBytes("AQID_-8")],[1,2,3,255,239]);
 const sub={toJSON:()=>({endpoint:"https://web.push.apple.com/abc",keys:{p256dh:"P",auth:"A"}})};
 assert.deepEqual(subscriptionRow(sub,"iPhone"),{endpoint:"https://web.push.apple.com/abc",p256dh:"P",auth:"A",label:"iPhone"});
 assert.throws(()=>subscriptionRow({endpoint:"http://x",keys:{p256dh:"P",auth:"A"}},""),/válida/);
 assert.throws(()=>subscriptionRow({endpoint:"https://x",keys:{}},""),/válida/);
});

test("service worker: muestra el aviso y al tocarlo abre solo rutas internas",async()=>{
 const src=readFileSync(new URL("../apps/rise-react/public/sw.js",import.meta.url),"utf8");
 const handlers={},shown=[],opened=[];
 const self={location:{origin:"https://renzo-hub.vercel.app"},addEventListener:(t,f)=>{handlers[t]=f;},skipWaiting(){},
  registration:{showNotification:async(t,o)=>shown.push([t,o])},clients:{claim(){},matchAll:async()=>[],openWindow:async u=>opened.push(u)}};
 vm.runInNewContext(src,{self,caches:{},fetch,URL,console});
 const run=async(type,ev)=>{let p;handlers[type]({...ev,waitUntil:x=>{p=x;}});await p;};
 await run("push",{data:{json:()=>({title:"Nómina nueva por revisar",body:"2026-W44",url:"/nominas",tag:"payslip:1"})}});
 await run("push",{data:{json:()=>({title:"x",url:"//evil.example/phish"})}});
 assert.equal(shown[0][0],"Nómina nueva por revisar");assert.equal(shown[0][1].data.url,"/nominas");
 assert.equal(shown[1][1].data.url,"/");
 await run("notificationclick",{notification:{close(){},data:{url:"/nominas"}}});
 assert.deepEqual(opened,["https://renzo-hub.vercel.app/nominas"]);
});

test("migración: suscripciones con RLS y funciones del servidor cerradas a usuarios",()=>{
 const sql=readFileSync(new URL("../supabase/pending/20261102090000_push_notifications.sql",import.meta.url),"utf8");
 assert.match(sql,/alter table public\.push_subscriptions enable row level security/);
 assert.match(sql,/revoke all on function %s from public, anon, authenticated/);
 assert.ok(!/vapid[^\n]*to authenticated/.test(sql));
 const setup=readFileSync(new URL("../supabase/pending/push_notifications_setup.sql",import.meta.url),"utf8");
 assert.ok(!/push_cron_secret','[0-9a-f]{32}/.test(setup),"el secreto no se escribe en el repo");
});
