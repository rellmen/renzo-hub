import test from "node:test";
import assert from "node:assert/strict";
import {newItemNotices,digestNotice,amsterdamDate} from "../supabase/functions/push-notify/logic.mjs";

const inbox=(id,status,category,title="Ticket AH")=>({id,status,title,payload:{status,category}});
const slip=(id,st,label="2026-W44",net=640.5)=>({id,review_status:st,period_label:label,net_payment:net});

test("nuevo: cada captura pendiente y cada nómina pendiente, una sola vez",()=>{
 const n=newItemNotices({inbox:[inbox("a","needs_review","Expense"),inbox("b","archived","Note"),inbox("c","needs_review","Note","Idea")],payslips:[slip("p","pending"),slip("q","approved")]},new Set(["inbox:c"]));
 assert.deepEqual(n.map(x=>x.title),["Nuevo gasto por revisar","Nómina nueva por revisar"]);
 assert.equal(n[1].body,"2026-W44 · neto 640,50 €");
 assert.deepEqual(n[0].keys,["inbox:a"]);assert.equal(n[1].url,"/nominas");
});

test("muchas a la vez: un aviso agrupado que marca todas",()=>{
 const n=newItemNotices({inbox:["a","b","c","d","e"].map(i=>inbox(i,"needs_review","Note","Nota "+i))});
 assert.equal(n.length,1);assert.equal(n[0].title,"5 cosas nuevas por revisar");assert.equal(n[0].keys.length,5);
});

test("resumen diario: solo si hay pendientes, una vez al día",()=>{
 const d=digestNotice({inbox:[inbox("a","needs_review")],payslips:[slip("p","pending"),slip("q","pending")],bankLast:{ING:"2026-10-31",Revolut:"2026-10-20"}},"2026-11-02");
 assert.equal(d.title,"Pendiente en Rise");
 assert.equal(d.body,"1 en la bandeja · 2 nóminas sin revisar · extracto de Revolut hasta 31/10");
 assert.equal(d.url,"/inbox");
 assert.equal(digestNotice({inbox:[inbox("a","needs_review")]},"2026-11-02",new Set(["digest:2026-11-02"])),null);
 assert.equal(digestNotice({bankLast:{ING:"2026-10-31",Revolut:"2026-10-31"}},"2026-11-02"),null);
 // Después del día 10 ya no recuerda el extracto.
 assert.equal(digestNotice({bankLast:{}},"2026-11-15"),null);
 // Enero mira diciembre del año anterior.
 assert.match(digestNotice({bankLast:{ING:"2026-12-31"}},"2027-01-03").body,/Revolut hasta 31\/12/);
});

test("fecha de Ámsterdam",()=>{
 assert.equal(amsterdamDate(new Date("2026-11-01T23:30:00Z")),"2026-11-02");
});
