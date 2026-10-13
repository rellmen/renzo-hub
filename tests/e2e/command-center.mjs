import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {resolve} from "node:path";
const require=createRequire(resolve(process.env.PLAYWRIGHT_ROOT,"package.json"));
const {chromium}=require("playwright");
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:390,height:844}});
try {
  await page.goto(process.env.BASE_URL||"http://localhost:4182",{waitUntil:"networkidle"});
  const result=await page.evaluate(async()=>{
    const {mountCommandCenter}=await import("/microapps/command-center/command-center.js");
    const root=document.createElement("main");
    root.id="commandTest";
    document.body.append(root);
    const rows=[
      {id:"1",title:"Tarea real",domain:"work",record_type:"renzo_portfolio",requires_review:true,occurred_at:"2026-10-13T01:00:00Z"},
      {id:"2",title:"<img src=x onerror=alert(1)>",domain:"system",record_type:"app_error",requires_review:false,occurred_at:"2026-10-12T01:00:00Z"}
    ];
    let requestedOwner="", requestedDomains="";
    const query={
      select(){return this},
      eq(key,value){if(key==="owner_id")requestedOwner=value; return this},
      in(key,value){if(key==="domain")requestedDomains=value.join(",");return this},
      order(){return this},
      limit(value){if(value!==75)throw Error("Unexpected limit"); return Promise.resolve({data:rows,error:null})}
    };
    const supabase={from(table){if(table!=="hub_records") throw Error("Wrong table");return query;}};
    let user={id:"test-session-user"};
    const mounted=mountCommandCenter(root,supabase,()=>user);
    await mounted.load();
    const state={
      owner:requestedOwner,domains:requestedDomains,
      total:root.querySelector("#ccTotal").textContent,
      work:root.querySelector("#ccWork").textContent,
      pending:root.querySelector("#ccPending").textContent,
      deployed:root.querySelector("#ccDeploy").textContent,
      imgTags:root.querySelectorAll(".cc-feed img").length,
      feedCount:root.querySelectorAll(".cc-feed li").length
    };
    user=null;
    mounted.reset();
    state.resetTotal=root.querySelector("#ccTotal").textContent;
    state.resetFeed=root.querySelector("#ccActivity").textContent;
    return state;
  });
  assert.equal(result.owner,"test-session-user");
  assert.equal(result.domains,"work,system");
  assert.equal(result.total,"2");
  assert.equal(result.work,"1");
  assert.equal(result.pending,"1");
  assert.match(result.deployed,/local-dev.*preview/);
  assert.equal(result.imgTags,0,"record titles must not execute HTML");
  assert.equal(result.feedCount,2);
  assert.equal(result.resetTotal,"—");
  assert.match(result.resetFeed,/Inicia sesión/);
  console.log("Command Center authenticated mock + XSS + logout: 9/9 OK");
} finally {await browser.close();}
