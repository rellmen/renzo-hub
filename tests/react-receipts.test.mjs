import test from "node:test";
import assert from "node:assert/strict";
import {parseAmount,parseReceiptText,parseReceiptDate,matchBankTx,autoMatch,cleanItems,itemsSum,receiptRow,photoPath} from "../apps/rise-react/src/lib/receipts.mjs";

const today=new Date("2026-11-01T20:00:00Z");
const UID="11111111-1111-4111-8111-111111111111",RID="22222222-2222-4222-8222-222222222222";

test("importes: coma y punto decimales, miles; sin decimales no cuenta",()=>{
 assert.equal(parseAmount("12,30"),12.3);
 assert.equal(parseAmount("€ 1.234,56"),1234.56);
 assert.equal(parseAmount("1,234.56"),1234.56);
 assert.equal(parseAmount("-0,99"),-0.99);
 assert.equal(parseAmount("8710398"),null);
});

test("ticket de Albert Heijn (OCR con ruido): tienda, fecha y total a pagar",()=>{
 const t=`albert heijn
Velden 12 Weert
HALFVOLLE MELK   1,29
BANANEN          2,19
KORTING         -0,50
SUBTOTAAL        2,98
BONUS BOX
TOTAAL           2,98
PINNEN           2,98
BTW 9%  0,25
31-10-2026 18:42 kassa 3`;
 assert.deepEqual(parseReceiptText(t,today),{store:"Albert Heijn",date:"2026-10-31",total:2.98});
});

test("ticket español: TOTAL con euro e importe en la línea siguiente; tienda desconocida = primera línea",()=>{
 const t=`Forn de Pa Sant Jordi
C/ Major 3, Barcelona
Fecha: 28/10/26
TOTAL €
14,60
IVA 10% 1,33`;
 assert.deepEqual(parseReceiptText(t,today),{store:"Forn de Pa Sant Jordi",date:"2026-10-28",total:14.6});
});

test("fechas: rechaza futuras, imposibles y de hace más de dos años",()=>{
 assert.equal(parseReceiptDate("05-11-2026",today),null);
 assert.equal(parseReceiptDate("31-02-2026",today),null);
 assert.equal(parseReceiptDate("01-01-2020",today),null);
 assert.equal(parseReceiptDate("2026-10-15 kassa 3",today),"2026-10-15");
});

test("sin línea de total no se inventa uno",()=>{
 assert.equal(parseReceiptText("Jumbo\nKAAS 4,99\nBROOD 2,49",today).total,null);
});

const items=[
 {id:"a1",date:"2026-10-31",amount:-2.98,name:"Albert Heijn 1234 WEERT",bank:"ING"},
 {id:"a2",date:"2026-11-02",amount:-2.98,name:"Jumbo Weert",bank:"Revolut"},
 {id:"a3",date:"2026-10-31",amount:-29.8,name:"Albert Heijn",bank:"ING"},
 {id:"a4",date:"2026-10-20",amount:-2.98,name:"Albert Heijn",bank:"ING"},
 {id:"a5",date:"2026-10-31",amount:2.98,name:"Tikkie",bank:"ING"}
];

test("enlace con el banco: mismo importe en negativo, ventana −1..+5 días, mismo comercio primero",()=>{
 const c=matchBankTx({store:"Albert Heijn",date:"2026-10-31",total:2.98},items);
 assert.deepEqual(c.map(x=>x.id),["a1","a2"]);
 assert.equal(autoMatch(c),"a1");
 assert.deepEqual(matchBankTx({store:"Albert Heijn",date:"2026-10-31",total:2.98},items,new Set(["a1"])).map(x=>x.id),["a2"]);
});

test("sin seguridad no se preselecciona",()=>{
 const c=matchBankTx({store:"Kiosco",date:"2026-10-31",total:2.98},items);
 assert.equal(c.length,2);
 assert.equal(autoMatch(c),"");
 assert.deepEqual(matchBankTx({store:"x",date:null,total:2.98},items),[]);
});

test("productos: se limpian, se limitan y descuentos negativos permitidos",()=>{
 const l=cleanItems([{name:" Melk\n",qty:"2",price:"2.58"},{name:"Korting",price:-0.5},{name:"",price:1},{name:"x",price:"abc"},{name:"y",qty:-3,price:1}]);
 assert.deepEqual(l,[{name:"Melk",qty:2,price:2.58},{name:"Korting",qty:1,price:-0.5},{name:"y",qty:1,price:1}]);
 assert.equal(itemsSum(l),3.08);
 assert.equal(cleanItems("no").length,0);
});

test("registro: validado, revisado, en Money, sin tocar el banco",()=>{
 const photo={path:photoPath(UID,RID,"a".repeat(64)),mime:"image/jpeg",size:1000};
 const r=receiptRow(UID,{id:RID,store:" Albert Heijn ",date:"2026-10-31",total:2.98,bankTxId:"a1",photo,items:[{name:"Melk",qty:1,price:1.29}],ai:"openrouter/free"},today);
 assert.equal(r.domain,"money");assert.equal(r.record_type,"money_receipt");assert.equal(r.status,"reviewed");
 assert.equal(r.title,"Albert Heijn · 2.98 €");
 assert.equal(r.payload.bank_tx_id,"a1");assert.equal(r.payload.items_sum,1.29);assert.equal(r.payload.read.ai_items,true);
 assert.throws(()=>receiptRow(UID,{id:RID,store:"",date:"2026-10-31",total:1}),/tienda/);
 assert.throws(()=>receiptRow(UID,{id:RID,store:"x",date:"2026-02-30",total:1}),/fecha/);
 assert.throws(()=>receiptRow(UID,{id:RID,store:"x",date:"2026-10-30",total:0}),/total/);
 assert.throws(()=>receiptRow(UID,{id:RID,store:"x",date:"2026-10-30",total:1,photo:{path:"otro/receipts/x.jpg"}}),/foto/);
 assert.throws(()=>photoPath(UID,RID,"../x"),/Ruta/);
});
