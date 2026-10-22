// Same tables and identifiers as classic Payroll. Never imports or confirms payment.
async function all(client,table,columns,ownerColumn,uid,filters={}){
 const rows=[];
 for(let from=0;;from+=500){
  let q=client.from(table).select(columns).eq(ownerColumn,uid);
  for(const [key,value] of Object.entries(filters))q=q.eq(key,value);
  const {data,error}=await q.order('id').range(from,from+499);
  if(error)throw Error(error.message||'No se pudieron cargar las nóminas.');
  if(!Array.isArray(data))throw Error('Respuesta de nóminas no válida.');
  rows.push(...data);
  if(data.length<500)return rows;
 }
}
export async function loadPayrollRecords(client,uid){
 if(typeof uid!=='string'||!uid.trim())throw Error('Inicia sesión para ver tus nóminas.');
 if(!client?.from)throw Error('Conexión privada no disponible.');
 const [payslips,contracts,shifts]=await Promise.all([
  all(client,'payroll_payslips','id,document_id,employer_id,period_label,period_start,period_end,payment_date,currency,worked_hours,gross_salary,net_payment,review_status,validation_status,updated_at','user_id',uid),
  all(client,'hub_records','id,title,payload,updated_at','owner_id',uid,{domain:'money',record_type:'shift_contract'}),
  all(client,'hub_records','id,title,payload,updated_at,occurred_at','owner_id',uid,{domain:'work',record_type:'shift_log'})
 ]);
 payslips.sort((a,b)=>String(b.payment_date||b.period_end||'').localeCompare(String(a.payment_date||a.period_end||''))||String(a.id).localeCompare(String(b.id)));
 shifts.sort((a,b)=>String(b.payload?.date||'').localeCompare(String(a.payload?.date||'')));
 return {payslips,contracts,shifts};
}
export function payrollTotals(payslips){
 const result={};
 for(const row of payslips){
  const currency=String(row.currency||'').trim()||'Sin moneda';
  const item=result[currency]||{amount:0,count:0,missing:0};
  const value=row.net_payment;
  if(value==null||value===''||!Number.isFinite(Number(value)))item.missing++;
  else item.amount=(Math.round(item.amount*100)+Math.round(Number(value)*100))/100;
  item.count++;result[currency]=item;
 }
 return result;
}
