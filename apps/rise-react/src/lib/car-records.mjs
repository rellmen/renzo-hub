import {loadInbox,captureStatus} from './inbox-records.mjs';
import {loadBankTxs,loadRules} from './legacy-money/finance/data.js';
import {categorizeAll} from './legacy-money/gastos/categories.js';
export function carSnapshot(legacy,bank,inbox){
 const expenses=legacy.filter(r=>r.payload?.kind==='expense'&&(r.payload.expenseCategory==='car'||r.payload.category==='Car'))
  .map(r=>({id:r.id,title:r.title||r.payload.title||'Gasto del coche',date:r.payload.date||r.occurred_at?.slice(0,10)||'',
   amount:Number(r.payload.amount),note:String(r.payload.note||''),source:'Documento registrado'}))
  .filter(r=>Number.isFinite(r.amount)&&r.amount>0);
 // Bank movements and captured receipts can describe the same purchase. Separate
 // the sources and never add the two lists to a fabricated consolidated total.
 const movements=bank.filter(r=>['coche','gasolina'].includes(r.category)&&r.amount<0);
 const pending=inbox.filter(r=>!['reviewed','archived','confirmed'].includes(captureStatus(r))&&
  (r.payload?.extracted?.expenseCategory==='car'||r.payload?.extracted?.category==='Car'));
 return {expenses:expenses.sort((a,b)=>b.date.localeCompare(a.date)),movements,pending};
}
export async function loadCar(client,uid){
 if(!uid||!client?.from)throw Error('Inicia sesión para consultar Car.');
 const legacy=[];
 const [txs,rules,inbox]=await Promise.all([loadBankTxs(client,uid),loadRules(client,uid),loadInbox(client,uid)]);
 for(let from=0;;from+=1000){
  const {data,error}=await client.from('hub_records').select('id,title,payload,occurred_at').eq('owner_id',uid)
   .eq('domain','money').eq('record_type','renzo_money').order('occurred_at',{ascending:false}).order('id',{ascending:false}).range(from,from+999);
  if(error)throw Error('No se pudo recuperar el historial de Car.');
  legacy.push(...(data||[]));if((data||[]).length<1000)break;
 }
 return carSnapshot(legacy,categorizeAll(txs,rules),inbox);
}
