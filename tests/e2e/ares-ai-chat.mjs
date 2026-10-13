import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {resolve} from "node:path";
const require=createRequire(resolve(process.env.PLAYWRIGHT_ROOT,"package.json"));
const {chromium}=require("playwright");
const browser=await chromium.launch({headless:true});
try{
 for(const [label,width,height] of [["mobile",390,844],["desktop",1440,900]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  await page.route("**/app.js",r=>r.abort());
  await page.route("**/api/ares-ai",r=>r.fulfill({status:200,contentType:"application/json",body:'{"enabled":false}'}));
  await page.route("**/api/ares-sources",r=>{
    assert.equal(r.request().headers().authorization,"Bearer test-token");
    return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
      github:{repository:"rellmen/renzo-hub",commits:[{sha:"abcd1234",title:"fix: Ares status"}],
        pullRequests:[{number:42,title:"Ares status API",base:"staging"}],issues:[],available:{commits:true,pullRequests:true,issues:true}},
      vercel:{project:"renzo-hub-2-1-staging",environment:"preview",deploymentBranch:"staging",deploymentCommit:"abcd12345678"}
    })});
  });
  await page.goto(process.env.BASE_URL||"http://localhost:4198",{waitUntil:"domcontentloaded"});
  await page.addStyleTag({url:"/assets/ares-chat.css"});
  await page.evaluate(async()=>{
   const {mountAresAI}=await import("/microapps/ares-ai.js");
   const rows=[
    {id:"11111111-1111-4111-8111-111111111111",owner_id:"sample",record_type:"renzo_project",title:"Dutch Academy",status:"active",payload:{output:"B1"}},
    {id:"22222222-2222-4222-8222-222222222222",owner_id:"sample",record_type:"renzo_task",title:"Repasar verbos",status:"Today",payload:{project:"Dutch Academy"}}
   ];
   let user={id:"sample"},lastFilter="";
   const supabase={
    from(name){if(name!=="hub_records")throw Error("bad table");return{
     select(){return this},eq(k,v){if(k==="owner_id")lastFilter=v;return this},in(){return this},order(){return this},
     limit(){return Promise.resolve({data:rows.filter(x=>x.owner_id===lastFilter),error:null})},
     insert(payload){rows.unshift({id:crypto.randomUUID(),...payload});return Promise.resolve({error:null});},
     update(patch){const filters={};return{eq(k,v){filters[k]=v;return this},select(){const r=rows.find(x=>Object.entries(filters).every(([k,v])=>x[k]===v));if(!r)return Promise.resolve({data:[],error:null});Object.assign(r,patch);return Promise.resolve({data:[{id:r.id}],error:null})}};}
    }},
    auth:{getSession:async()=>({data:{session:{access_token:"test-token"}}})}
   };
   const app=mountAresAI({supabase,getUser:()=>user,navigate:()=>{}});
   app.setSession();
   window.__aresTest={app,rows,setUser:v=>{user=v},get lastFilter(){return lastFilter}};
  });
  assert.equal(await page.locator(".ares-fab").isVisible(),true);
  await page.locator(".ares-fab").click();
  assert.equal(await page.locator(".ares-chat").isVisible(),true);
  await page.locator('[data-suggest="¿Cómo van mis proyectos?"]').click();
  await page.waitForFunction(()=>document.querySelector(".ares-chat-stream").textContent.includes("Dutch Academy"));
  assert.equal(await page.evaluate(()=>window.__aresTest.lastFilter),"sample");
  await page.locator('[data-suggest="¿En qué fase de desarrollo está RISE HUB?"]').click();
  await page.waitForFunction(()=>document.querySelector(".ares-chat-stream").textContent.includes("Estado técnico de RISE HUB"));
  assert.equal(await page.locator(".ares-chat-stream").textContent().then(t=>t.includes("Ares status API")),true);

  await page.locator("#aresQuestion").fill("Pide a Claude que prepare una lección de neerlandés");
  await page.locator('.ares-chat-form button[type="submit"]').click();
  await page.getByRole("button",{name:"Crear solicitud pendiente"}).click();
  await page.waitForFunction(()=>window.__aresTest.rows.some(r=>r.record_type==="ares_operation"));
  assert.equal(await page.evaluate(()=>window.__aresTest.rows.find(r=>r.record_type==="ares_operation").status),"pending_approval");
  await page.locator("#aresQuestion").fill("¿Qué debo aprobar?");
  await page.locator('.ares-chat-form button[type="submit"]').click();
  await page.getByRole("button",{name:/Revisar: /}).click();
  page.once("dialog",d=>d.accept());
  await page.getByRole("button",{name:"Aprobar solicitud"}).click();
  await page.waitForFunction(()=>window.__aresTest.rows.find(r=>r.record_type==="ares_operation").status==="approved");
  assert.equal(await page.evaluate(()=>window.__aresTest.rows.find(r=>r.record_type==="ares_operation").payload.executed),false);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=0,"no horizontal overflow");
  await page.screenshot({path:"/tmp/ares-ai-chat-"+label+".png",fullPage:false});
  await page.evaluate(()=>{window.__aresTest.setUser(null);window.__aresTest.app.reset();});
  assert.equal(await page.locator(".ares-fab").isVisible(),false);
  assert.equal(await page.locator(".ares-chat").isVisible(),false);
  assert.equal(await page.locator(".ares-msg").count(),0);
  console.log("Ares AI "+label+" · chat, RLS fixture, approvals, logout, responsive: OK");
  await page.close();
 }
}finally{await browser.close();}
