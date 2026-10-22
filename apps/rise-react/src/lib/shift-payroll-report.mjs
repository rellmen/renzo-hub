// RISE HUB Nocturne: read-only salary estimation with the exact legacy DST/ORT engine.
// Preserves original contractSnapshot of each shift and the owner's Supabase records.
// No inferred premiums, no bank entries, no writes and no partial salary totals.
import {calculateWeeklyPayroll} from "./legacy-payroll/weekly-pay.js";
import {calculateShift} from "./legacy-payroll/shifts.js";

export async function loadSavedShifts(client,uid){
 if(!client?.from||typeof uid!=="string"||!uid)throw Error("Inicia sesión para consultar tus turnos.");
 const rows=[];
 for(let start=0;start<10000;start+=500){
  const {data,error}=await client.from("hub_records")
   .select("id,owner_id,domain,record_type,title,payload,occurred_at")
   .eq("owner_id",uid).eq("domain","work").eq("record_type","shift_log")
   .order("id",{ascending:true}).range(start,start+499);
  if(error||!Array.isArray(data))throw Error("No se ha podido consultar el historial completo de turnos.");
  if(data.some(r=>r.owner_id!==uid||r.domain!=="work"||r.record_type!=="shift_log"))
   throw Error("La respuesta de turnos no corresponde a la cuenta solicitada.");
  rows.push(...data);
  if(data.length<500)return rows;
 }
 throw Error("El historial supera el límite de paginación y no se mostrará una estimación parcial.");
}

export function buildContractualReport(rows){
 if(!Array.isArray(rows))throw Error("Historial de turnos inválido.");
 if(rows.length===0)return {weeks:[],shifts:[],count:0,unverified:0,warning:"Sin turnos guardados."};
 const unverified=rows.filter(r=>!r?.payload?.contractSnapshot).length;
 if(unverified)throw Error("Existen turnos sin copia de su contrato. Revisa esos registros antes de calcular un importe.");
 for(const row of rows)calculateShift(row.payload,row.payload.contractSnapshot);
 const report=calculateWeeklyPayroll(rows);
 return {weeks:report.weeks,shifts:report.shifts,count:rows.length,unverified:0,
  warning:"Estimación contractual, no ingreso confirmado. Verifica reglas de agencia, nómina, descansos y complementos."};
}
