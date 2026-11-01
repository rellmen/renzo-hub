// Notificaciones de Rise · qué avisar. Puro (sin red ni base de datos) para poder probarlo en Node y usarlo en Deno.
// "Nuevo": cada captura de la bandeja pendiente de revisar y cada nómina pendiente, una sola vez (clave en push_private.sent).
// "Pendiente": un resumen al día con lo que siga sin resolver; sin pendientes no se manda nada.

const CAT={expense:"gasto",receipt:"ticket",payslip:"nómina",income:"ingreso",invoice:"factura",money:"dinero"};
const short=(s,n=90)=>{const t=String(s??"").replace(/\s+/g," ").trim();return t.length>n?t.slice(0,n-1)+"…":t;};
export const inboxPending=r=>!["reviewed","archived","confirmed"].includes(String(r?.payload?.status||r?.status||"needs_review"));

export function newItemNotices({inbox=[],payslips=[]},already=new Set()){
 const out=[];
 for(const r of inbox){
  const key="inbox:"+r.id;
  if(already.has(key)||!inboxPending(r))continue;
  const cat=CAT[String(r.payload?.category||"").toLowerCase()];
  out.push({key,title:cat?`Nuevo ${cat} por revisar`:"Nueva captura en la bandeja",body:short(r.title||r.payload?.title||"Sin título"),url:"/inbox",tag:key});
 }
 for(const p of payslips){
  const key="payslip:"+p.id;
  if(already.has(key)||p.review_status!=="pending")continue;
  const net=Number(p.net_payment??p.net_salary);
  out.push({key,title:"Nómina nueva por revisar",body:short(`${p.period_label||"Semana sin etiqueta"}${Number.isFinite(net)?` · neto ${net.toFixed(2).replace(".",",")} €`:""}`),url:"/nominas",tag:key});
 }
 // Si llegan muchas a la vez, un solo aviso agrupado (las claves se marcan igualmente).
 if(out.length>3)return [{key:null,keys:out.map(o=>o.key),title:`${out.length} cosas nuevas por revisar`,body:short(out.map(o=>o.body).join(" · "),140),url:"/inbox",tag:"rise-new"}];
 return out.map(o=>({...o,keys:[o.key]}));
}

const prevMonth=today=>{const [y,m]=today.split("-").map(Number);return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,"0")}`;};
const lastDay=month=>{const [y,m]=month.split("-").map(Number);return new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);};

// today: AAAA-MM-DD en Europe/Amsterdam. bankLast: {ING:"2026-10-28",Revolut:null}.
export function digestNotice({inbox=[],payslips=[],bankLast={}},today,already=new Set()){
 const key="digest:"+today;
 if(already.has(key))return null;
 const parts=[],links=[];
 const nInbox=inbox.filter(inboxPending).length;
 const nPay=payslips.filter(p=>p.review_status==="pending").length;
 if(nInbox){parts.push(`${nInbox} en la bandeja`);links.push("/inbox");}
 if(nPay){parts.push(`${nPay} ${nPay===1?"nómina":"nóminas"} sin revisar`);links.push("/nominas");}
 // Cierre de mes: los 10 primeros días, si falta el extracto completo del mes anterior.
 if(Number(today.slice(8,10))<=10){
  const end=lastDay(prevMonth(today));
  const missing=["ING","Revolut"].filter(b=>!bankLast[b]||bankLast[b]<end);
  if(missing.length){parts.push(`extracto de ${missing.join(" y ")} hasta ${end.slice(8,10)}/${end.slice(5,7)}`);links.push("/dinero");}
 }
 if(!parts.length)return null;
 return {key,keys:[key],title:"Pendiente en Rise",body:short(parts.join(" · "),160),url:links[0],tag:"rise-digest"};
}

export function amsterdamDate(at=new Date()){
 return new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Amsterdam",year:"numeric",month:"2-digit",day:"2-digit"}).format(at);
}
