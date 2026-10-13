import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {resolve} from "node:path";
const require=createRequire(resolve(process.env.PLAYWRIGHT_ROOT,"package.json"));
const {chromium}=require("playwright");
const browser=await chromium.launch({headless:true});
try {
  for(const [label,width,height] of [["mobile",390,844],["desktop",1440,900]]) {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    await page.route(/\/app\.js(\?|$)/,route=>route.abort());
    await page.goto(process.env.BASE_URL||"http://localhost:4186",{waitUntil:"domcontentloaded",timeout:20000});
    await page.addStyleTag({url:"/microapps/ares-center/ares.css"});
    await page.evaluate(async()=>{
      const {mountAresCenter}=await import("/microapps/ares-center/ares.js");
      const id = n => String(n).repeat(8)+"-"+String(n).repeat(4)+"-4"+String(n).repeat(3)+"-8"+String(n).repeat(3)+"-"+String(n).repeat(12);
      const rows=[
        {id:id(1),owner_id:"test-session",domain:"work",record_type:"renzo_project",title:"RISE HUB",status:"active",payload:{slot:"primary",output:"Demo"},source:"manual",occurred_at:"2026-10-12T01:00:00Z"},
        {id:id(2),owner_id:"test-session",domain:"work",record_type:"renzo_task",title:"<img src=x onerror=alert(1)>",status:"Today",payload:{status:"Today",priority:"High"},source:"manual",occurred_at:"2026-10-13T01:00:00Z"},
        {id:id(3),owner_id:"test-session",domain:"system",record_type:"renzo_inbox",title:"Revisar nómina",status:"needs_review",payload:{status:"needs_review",note:"Pendiente"},source:"automation",occurred_at:"2026-10-13T01:00:00Z"},
        {id:id(4),owner_id:"test-session",domain:"system",record_type:"renzo_event",title:"Jarvis registrado",status:"completed",payload:{source:"jarvis"},source:"automation",occurred_at:"2026-10-13T01:00:00Z"},
        {id:id(5),owner_id:"test-session",domain:"system",record_type:"ares_decision",title:"¿Continuar?",status:"pending",payload:{details:"Decisión"},source:"manual",occurred_at:"2026-10-13T01:00:00Z"}
      ];
      let ownerFilter=null,typesFilter=null;
      const api={from(name){
        if(name!=="hub_records")throw Error("Unexpected table: "+name);
        return {
          select(){return this},
          eq(k,v){if(k==="owner_id")ownerFilter=v;return this},
          in(k,vals){if(k==="record_type")typesFilter=vals;return this},
          order(){return this},
          limit(n){if(n!==450)throw Error("Unexpected limit");return Promise.resolve({data:rows.filter(x=>x.owner_id===ownerFilter&&typesFilter.includes(x.record_type)).slice(0,n),error:null})},
          insert(payload){return {select(){return {single:async()=>{const item={id:crypto.randomUUID(),...payload};rows.unshift(item);return {data:{id:item.id},error:null}}}}}},
          update(patch){const filters={};return {eq(k,v){filters[k]=v;return this},async select(){const found=rows.find(x=>Object.keys(filters).every(k=>x[k]===filters[k]));if(!found)return {data:[],error:null};Object.assign(found,patch);return {data:[{id:found.id}],error:null}}};}
        };
      }};
      document.body.textContent="";
      const root=document.createElement("main");root.id="ares-center";document.body.append(root);
      let user={id:"test-session"};const center=mountAresCenter(root,api,()=>user);
      window.__ares={root,rows,center,setUser:value=>{user=value},get owner(){return ownerFilter}};
      await center.load();
    });
    const metric=key=>page.locator('[data-metric="'+key+'"]');
    await page.waitForFunction(()=>document.querySelector('[data-metric="projects"]')?.textContent==="1");
    assert.equal(await metric("tasks").textContent(),"1");
    assert.equal(await metric("inbox").textContent(),"2");
    assert.equal(await metric("agents").textContent(),"1");
    assert.equal(await page.evaluate(()=>window.__ares.owner),"test-session");
    assert.equal(await page.locator(".ares-item img").count(),0);
    assert.match(await page.locator("[data-ares-status]").textContent(),/actualizados/);
    await page.locator('[data-ares-tab="projects"]').click();
    await page.locator('[data-ares-form="project"] input[name="title"]').fill("Dutch Academy");
    await page.locator('[data-ares-form="project"] input[name="output"]').fill("B1");
    await page.locator('[data-ares-form="project"] button').click();
    await page.waitForFunction(()=>document.querySelector('[data-metric="projects"]')?.textContent==="2");
    await page.locator('[data-ares-form="task"] input[name="title"]').fill("Preparar lección");
    await page.locator('[data-ares-form="task"] button').click();
    await page.waitForFunction(()=>document.querySelector('[data-metric="tasks"]')?.textContent==="2");
    await page.locator('[data-ares-action="complete-task"]').first().click();
    await page.waitForFunction(()=>document.querySelector('[data-metric="tasks"]')?.textContent==="1");
    await page.locator('[data-ares-tab="inbox"]').click();
    await page.locator('[data-ares-action="approve-decision"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-metric="inbox"]')?.textContent==="1");
    assert.equal(await page.evaluate(()=>window.__ares.rows.find(x=>x.record_type==="ares_decision").requires_review),false);
    await page.locator('[data-ares-tab="agents"]').click();
    await page.locator('[data-ares-form="agent"] input[name="title"]').fill("Claude terminó UI");
    await page.locator('[data-ares-form="agent"] button').click();
    await page.waitForFunction(()=>document.querySelector('[data-metric="agents"]')?.textContent==="2");
    assert.equal(await page.evaluate(()=>window.__ares.rows.find(x=>x.record_type==="ares_agent_run").source),"manual");
    // Authorization gate: approval is persisted but never starts Claude, Hermes or Jarvis.
    await page.locator('[data-ares-form="operation"] input[name="title"]').fill("Preparar documentación B1");
    await page.locator('[data-ares-form="operation"] input[name="details"]').fill("Solo diseñar un plan, no desplegar");
    await page.locator('[data-ares-form="operation"] button').click();
    await page.waitForFunction(()=>document.querySelector('[data-metric="inbox"]')?.textContent==="2");
    assert.equal(await page.evaluate(()=>window.__ares.rows.find(x=>x.record_type==="ares_operation").status),"pending_approval");
    await page.locator('[data-ares-tab="inbox"]').click();
    await page.locator('[data-ares-action="approve-operation"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-metric="inbox"]')?.textContent==="1");
    const operation=await page.evaluate(()=>window.__ares.rows.find(x=>x.record_type==="ares_operation"));
    assert.equal(operation.status,"approved");
    assert.equal(operation.payload.executed,false);
    assert.equal(operation.payload.executionStatus,"not_connected");
    assert.equal(operation.requires_review,false);
    await page.locator('[data-ares-tab="overview"]').click();
    const scroll=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(scroll<=0,"no horizontal overflow");
    await page.screenshot({path:"/tmp/ares-center-"+label+".png",fullPage:true});
    await page.evaluate(()=>{window.__ares.setUser(null);window.__ares.center.reset();});
    assert.equal(await metric("tasks").textContent(),"—");
    assert.equal(await page.locator(".ares-item").count(),0);
    console.log("Ares "+label+" · 22 functional checks OK");
    await page.close();
  }
} finally {await browser.close();}
