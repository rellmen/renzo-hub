// RISE HUB React: real, read-only Money adapter.
// Reuses byte-identical legacy categorisation and bank computations.
// Never derive bank balances from fictional transactions or unreviewed AI inbox items.
import {loadFinance} from "./legacy-money/finance/data.js";
import {monthsOf} from "./legacy-money/gastos/categories.js";
import {monthInsights,lastImported,revolutGap} from "./legacy-money/finance/insights.js";
import {netWorth} from "./legacy-money/finance/networth.js";
import {recurring,fixedFlags} from "./legacy-money/finance/insights.js";
import {goalProgress} from "./money-goals.mjs";

function owner(uid){if(typeof uid!=="string"||!uid.trim())throw new Error("Debes iniciar sesión.");return uid;}
function unwrap(result){
  if(!result||result.error)throw new Error(result?.error?.message||"No fue posible cargar los registros financieros.");
  return result.data;
}
async function loadType(client,uid,record_type){
  const {data,error}=await client.from("hub_records").select("id,title,status,payload,updated_at,occurred_at")
    .eq("owner_id",uid).eq("domain","money").eq("record_type",record_type)
    .order("updated_at",{ascending:false}).limit(300);
  if(error)throw new Error(error.message);
  return data||[];
}
function dayStamp(at){return [at.getFullYear(),String(at.getMonth()+1).padStart(2,"0"),String(at.getDate()).padStart(2,"0")].join("-");}
export function summarizeMoney(fin,assets,goals,{at=new Date()}={}){
  const months=monthsOf(fin.items);
  const current=months[0]||null;
  const entries=current?monthInsights(fin.items,current):null;
  const nw=netWorth(fin.txs,assets,dayStamp(at));
  const banks=lastImported(fin.items);
  const salaryIds=new Set(fin.items.filter(i=>i.category==="nomina"&&i.amount>0).map(i=>i.id));
  const salaryBankTxs=fin.txs.filter(t=>salaryIds.has(t.id)).map(t=>({id:t.id,payload:{date:t.payload?.date,amount:t.payload?.amount,payslip_numbers:t.payload?.payslip_numbers||[],bank:t.payload?.bank}}));
  const unknownBankMonths=current?revolutGap(fin.items,current):null;
  const fixed=current?recurring(fin.items,current,fixedFlags(fin.rules||[])):null;
  const fixedMonthly=fixed?.items.length?fixed.total:null;
  const today=dayStamp(at);
  const goalContext={items:fin.items,today,month:current||today.slice(0,7),cash:nw.accounts.length?nw.cash:null,fixedMonthly,months};
  return {
    months,month:current,items:fin.items,salaryBankTxs,
    txCount:fin.txs.length,bankUpdatedThrough:banks,fixedExpenses:fixed,
    monthSummary:entries,worth:nw,
    // If Revolut has no imported statement, its spending cannot be treated as complete.
    noRevolutStatement:fin.items.length>0&&!banks.Revolut,
    possibleRevolutGap:unknownBankMonths,
    goals:(goals||[]).filter(r=>r.status!=="archived").map(r=>{
      const payload=r.payload||{};
      const valid=Boolean(current&&months.length&&["emergency","target","invest"].includes(payload.type));
      return{id:r.id,title:payload.name||r.title||"Objetivo sin nombre",
       type:payload.type||null,payload,status:r.status||"active",updated_at:r.updated_at||"",
       progress:valid?goalProgress(payload,goalContext):null};
    }),
    budget:fin.budget,
  };
}
export async function loadRealMoney(client,uid,{at=new Date()}={}){
  const id=owner(uid);
  if(!client?.from)throw new Error("Conexión privada no disponible.");
  // Same legacy finance loader that the current production area uses.
  const [fin,assets,goals]=await Promise.all([
    loadFinance(client,id),
    loadType(client,id,"money_asset"),
    loadType(client,id,"money_goal"),
  ]);
  return summarizeMoney(fin,assets,goals,{at});
}
export function moneyMonthView(summary,month){
  if(!summary.months.includes(month))return null;
  return monthInsights(summary.items,month);
}
