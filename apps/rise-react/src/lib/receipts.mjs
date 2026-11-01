// Tickets de compra (01-11-2026, opción C+A de Renzo).
// 1) La foto se lee en el propio móvil (tesseract.js servido desde /vendor/tesseract): tienda, fecha y total.
// 2) Opcional y bajo demanda: "Leer productos" envía la foto a /api/receipt-items (OpenRouter gratuito).
// 3) Nada se guarda sin que Renzo revise y pulse "Guardar ticket" (registro financiero = revisión humana).
// Registro: hub_records domain money, record_type money_receipt. Foto en hub-private/<uid>/receipts/<id>/.
// No cambia movimientos bancarios: solo guarda en el ticket el id del movimiento enlazado.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO=/^\d{4}-\d{2}-\d{2}$/;
const COLUMNS="id,title,status,payload,occurred_at,updated_at";
export const RECEIPT_TYPE="money_receipt";

// Cadenas habituales en NL y España. Si el texto contiene una, es la tienda (el logo suele leerse mal).
export const KNOWN_STORES=Object.freeze([
 ["albert heijn","Albert Heijn"],["ah to go","Albert Heijn"],["jumbo","Jumbo"],["lidl","Lidl"],["aldi","Aldi"],
 ["plus ","Plus"],["dirk","Dirk"],["coop","Coop"],["spar","Spar"],["vomar","Vomar"],["hoogvliet","Hoogvliet"],
 ["ekoplaza","Ekoplaza"],["action","Action"],["kruidvat","Kruidvat"],["etos","Etos"],["hema","HEMA"],
 ["gamma","Gamma"],["praxis","Praxis"],["ikea","IKEA"],["mediamarkt","MediaMarkt"],["decathlon","Decathlon"],
 ["primark","Primark"],["shell","Shell"],["tinq","Tinq"],["tango","Tango"],["esso","Esso"],["bp ","BP"],
 ["mercadona","Mercadona"],["carrefour","Carrefour"],["dia ","Dia"],["eroski","Eroski"],["consum","Consum"],
 ["bonpreu","Bonpreu"],["caprabo","Caprabo"],["el corte ingl","El Corte Inglés"],["mcdonald","McDonald's"],
 ["burger king","Burger King"],["subway","Subway"],["starbucks","Starbucks"]
]);

const round2=n=>Math.round(n*100)/100;
// "1.234,56" · "1,234.56" · "12,30" · "12.30" → número. Sin decimales no se acepta (evita leer cantidades o códigos).
export function parseAmount(s){
 // Miles con punto, coma o espacio; el último separador seguido de 2 cifras es el decimal.
 const m=/(-?)(\d{1,3}(?:[.,\s]\d{3})+|\d+)[.,](\d{2})(?!\d)/.exec(String(s||"").replace(/[€$]/g,""));
 if(!m)return null;
 const n=Number(m[2].replace(/[.,\s]/g,"")+"."+m[3])*(m[1]?-1:1);
 return Number.isFinite(n)?round2(n):null;
}
const amountsIn=line=>[...String(line).replace(/[€$]/g,"").matchAll(/-?(?:\d{1,3}(?:[.,]\d{3})+|\d+)[.,]\d{2}(?!\d)/g)].map(m=>parseAmount(m[0])).filter(n=>n!==null);

const pad=n=>String(n).padStart(2,"0");
function validDate(y,m,d){
 const t=new Date(Date.UTC(y,m-1,d));
 return t.getUTCFullYear()===y&&t.getUTCMonth()===m-1&&t.getUTCDate()===d?`${y}-${pad(m)}-${pad(d)}`:null;
}
// Fechas de ticket: 01-11-2026, 1/11/26, 01.11.2026, 2026-11-01. Se descartan fechas futuras o de hace más de 2 años.
export function parseReceiptDate(text,today=new Date()){
 const s=String(text||"");
 const max=today.toISOString().slice(0,10);
 const min=new Date(today.getTime()-730*864e5).toISOString().slice(0,10);
 const found=[];
 for(const m of s.matchAll(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/g))found.push(validDate(+m[1],+m[2],+m[3]));
 for(const m of s.matchAll(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})\b/g)){
  const y=m[3].length===2?2000+Number(m[3]):Number(m[3]);
  found.push(validDate(y,+m[2],+m[1]));
 }
 return found.find(d=>d&&d>=min&&d<=max)||null;
}

const TOTAL_STRONG=/\b(te betalen|totaal|total(?:e)?|importe|a pagar|bedrag|betaald|pin(?:nen)?|contactloos|tarjeta)\b/i;
const TOTAL_SKIP=/\b(sub ?tota|btw|iva|korting|descuento|statiegeld|spaar|bespaard|ahorro|wisselgeld|cambio|retour|terug)\b/i;
export function parseReceiptTotal(text){
 const lines=String(text||"").split(/\r?\n/);
 const strong=[];
 lines.forEach((line,i)=>{
  if(!TOTAL_STRONG.test(line)||TOTAL_SKIP.test(line))return;
  // El importe a veces cae en la línea siguiente.
  const a=amountsIn(line).concat(amountsIn(lines[i+1]||"").slice(0,1)).filter(n=>n>0&&n<=10000);
  if(a.length)strong.push({n:a[a.length-1],rank:/te betalen|totaal|^\s*total/i.test(line)?0:1});
 });
 strong.sort((x,y)=>x.rank-y.rank);
 return strong.length?strong[0].n:null;
}

export function parseReceiptStore(text){
 const s=String(text||"");
 const low=(" "+s.toLowerCase().replace(/\s+/g," ")+" ");
 for(const [needle,name] of KNOWN_STORES)if(low.includes(needle.startsWith(" ")?needle:needle.trimEnd()))return name;
 const line=s.split(/\r?\n/).map(l=>l.replace(/[^\p{L}\p{N}&'. -]/gu,"").trim()).find(l=>(l.match(/\p{L}/gu)||[]).length>=3);
 return line?line.slice(0,60):"";
}

// Resultado de la lectura en el móvil. Siempre editable: es una propuesta, no un dato confirmado.
export function parseReceiptText(text,today=new Date()){
 return {store:parseReceiptStore(text),date:parseReceiptDate(text,today),total:parseReceiptTotal(text)};
}

const days=(a,b)=>Math.round((Date.parse(b+"T00:00:00Z")-Date.parse(a+"T00:00:00Z"))/864e5);
const words=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").match(/[a-z0-9]{3,}/g)||[];
// Candidatos del extracto: gasto del mismo importe, cargado entre 1 día antes y 5 días después del ticket.
// Se excluyen movimientos ya enlazados a otro ticket. Mejor primero: menos días y comercio parecido.
export function matchBankTx(receipt,items,linked=new Set()){
 const total=Number(receipt?.total),date=receipt?.date;
 if(!(total>0)||!ISO.test(date||""))return [];
 const store=new Set(words(receipt.store));
 return (items||[]).filter(i=>i&&i.id&&!linked.has(i.id)&&ISO.test(i.date||"")&&Math.abs(Number(i.amount)+total)<0.005)
  .map(i=>{const d=days(date,i.date);const name=words(i.merchant||i.name);
   return {id:i.id,date:i.date,amount:Number(i.amount),name:i.merchant||i.name||"Movimiento",bank:i.bank||"",lag:d,sameStore:name.some(w=>store.has(w))};})
  .filter(c=>c.lag>=-1&&c.lag<=5)
  .sort((a,b)=>Number(b.sameStore)-Number(a.sameStore)||Math.abs(a.lag)-Math.abs(b.lag)||a.id.localeCompare(b.id));
}
// Solo se preselecciona si no hay duda: un único candidato, o uno del mismo comercio y sin empate.
export function autoMatch(cands){
 if(cands.length===1)return cands[0].id;
 if(cands.length>1&&cands[0].sameStore&&!(cands[1].sameStore&&Math.abs(cands[1].lag)===Math.abs(cands[0].lag)))return cands[0].id;
 return "";
}

export function cleanItems(list){
 if(!Array.isArray(list))return [];
 return list.slice(0,80).map(x=>{
  const name=String(x?.name??"").replace(/[\u0000-\u001f]/g," ").trim().slice(0,80);
  const qty=Number(x?.qty??1),price=Number(x?.price);
  return {name,qty:Number.isFinite(qty)&&qty>0&&qty<=1000?round2(qty):1,price:Number.isFinite(price)&&Math.abs(price)<=10000?round2(price):null};
 }).filter(x=>x.name&&x.price!==null);
}
export const itemsSum=items=>round2((items||[]).reduce((s,x)=>s+(Number(x.price)||0),0));

export function receiptRow(uid,input,at=new Date()){
 if(!UUID.test(uid||""))throw Error("Inicia sesión para guardar tickets.");
 const {id,store,date,total,items=[],bankTxId="",photo=null,ai=null}=input||{};
 if(!UUID.test(id||""))throw Error("Identificador de ticket inválido.");
 const name=String(store||"").trim().slice(0,80);
 if(!name)throw Error("Escribe la tienda.");
 if(!ISO.test(date||"")||!validDate(+date.slice(0,4),+date.slice(5,7),+date.slice(8,10)))throw Error("Revisa la fecha del ticket.");
 const amount=Number(total);
 if(!Number.isFinite(amount)||amount<=0||amount>10000)throw Error("Revisa el total del ticket.");
 if(bankTxId&&!UUID.test(bankTxId)&&!/^[A-Za-z0-9_-]{1,80}$/.test(bankTxId))throw Error("Movimiento bancario no válido.");
 if(photo&&(typeof photo.path!=="string"||!photo.path.startsWith(uid+"/receipts/"+id+"/")))throw Error("La foto no pertenece a este ticket.");
 const lines=cleanItems(items);
 return {id,owner_id:uid,domain:"money",record_type:RECEIPT_TYPE,title:`${name} · ${round2(amount).toFixed(2)} €`,
  status:"reviewed",occurred_at:date+"T12:00:00Z",source:"receipt",requires_review:false,
  payload:{store:name,date,total:round2(amount),currency:"EUR",items:lines,items_sum:lines.length?itemsSum(lines):null,
   bank_tx_id:bankTxId||null,photo:photo?{path:photo.path,mime:photo.mime,size:photo.size}:null,
   read:{device_ocr:true,ai_items:Boolean(ai),model:ai?String(ai).slice(0,80):null},reviewed_at:at.toISOString()}};
}

export async function loadReceipts(client,uid){
 if(!client?.from||!UUID.test(uid||""))throw Error("Sesión necesaria.");
 const {data,error}=await client.from("hub_records").select(COLUMNS).eq("owner_id",uid).eq("domain","money")
  .eq("record_type",RECEIPT_TYPE).order("occurred_at",{ascending:false}).limit(500);
 if(error)throw Error("No se pudieron cargar los tickets.");
 return data||[];
}
export function photoPath(uid,id,hash){
 if(!UUID.test(uid||"")||!UUID.test(id||"")||!/^[0-9a-f]{64}$/.test(hash||""))throw Error("Ruta de foto no válida.");
 return `${uid}/receipts/${id}/${hash}.jpg`;
}
export async function uploadReceiptPhoto(client,uid,id,blob){
 if(!blob||blob.type!=="image/jpeg"||blob.size<1||blob.size>10*1024*1024)throw Error("Foto no válida (JPEG de hasta 10 MB).");
 const bytes=new Uint8Array(await crypto.subtle.digest("SHA-256",await blob.arrayBuffer()));
 const path=photoPath(uid,id,[...bytes].map(n=>n.toString(16).padStart(2,"0")).join(""));
 const {error}=await client.storage.from("hub-private").upload(path,blob,{contentType:"image/jpeg",upsert:false});
 // Un reintento sube la misma foto a la misma ruta (hash): 409 significa que ya está.
 if(error&&!/409|already exists|Duplicate/i.test(String(error.statusCode||error.status||"")+" "+String(error.message||"")))
  throw Error("No se pudo subir la foto privada. No se ha guardado nada; puedes reintentarlo.");
 return {path,mime:"image/jpeg",size:blob.size};
}
export async function saveReceipt(client,uid,input){
 const row=receiptRow(uid,input);
 // El id se crea al abrir el ticket: reintentar no duplica.
 const {error}=await client.from("hub_records").upsert(row,{onConflict:"id",ignoreDuplicates:true});
 if(error)throw Error("No se pudo guardar el ticket.");
 const {data,error:e2}=await client.from("hub_records").select(COLUMNS).eq("id",row.id).eq("owner_id",uid).eq("record_type",RECEIPT_TYPE).maybeSingle();
 if(e2||!data)throw Error("No se ha confirmado el guardado. Reintenta sin cambiar nada.");
 return data;
}
export async function receiptPhotoUrl(client,uid,row){
 const path=row?.payload?.photo?.path;
 if(typeof path!=="string"||!path.startsWith(uid+"/receipts/"))throw Error("Este ticket no tiene foto.");
 const {data,error}=await client.storage.from("hub-private").download(path);
 if(error||!data)throw Error("No se pudo abrir la foto.");
 return URL.createObjectURL(data);
}
