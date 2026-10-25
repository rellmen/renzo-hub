// Rise Nocturne · Shift Tracker editor.
// Port de microapps/payroll/shift-tracker.js + shift-extras.js (Classic, solo lectura) sobre los
// mismos registros hub_records (shift_contract / shift_log / shift_leave_event) y el mismo motor
// salarial (copias byte-idénticas en ./legacy-payroll). Mejoras Nocturne: edición y borrado con
// control de versión updated_at (no se pisa un cambio de otro dispositivo) e IDs estables al crear.
// No crea ingresos, no toca nóminas ni bancos y no inventa porcentajes de contrato.
import {calculateShift,validateContract} from "./legacy-payroll/shifts.js";
import {calculateWeeklyPayroll,leaveBalance,reconcileOfficialPayroll} from "./legacy-payroll/weekly-pay.js";
import {proposedShift,periodWeeks,rotationForDate} from "./legacy-payroll/shift-schedule.js";

export {calculateShift,calculateWeeklyPayroll,leaveBalance,reconcileOfficialPayroll,proposedShift,periodWeeks,rotationForDate};
const COLUMNS="id,owner_id,domain,record_type,title,status,occurred_at,payload,created_at,updated_at";
const TYPES=Object.freeze({contract:["money","shift_contract"],shift:["work","shift_log"],leave:["money","shift_leave_event"]});
export const validDate=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+"T00:00:00Z"))&&new Date(x+"T00:00:00Z").toISOString().slice(0,10)===x;
const uuid=()=>globalThis.crypto?.randomUUID?.()||"10000000-1000-4000-8000-100000000000".replace(/[018]/g,c=>(Number(c)^Math.random()*16>>Number(c)/4).toString(16));

// --- Parsers originales (idénticos en reglas y mensajes a Classic) ---
export function parseBands(value){
 const lines=String(value||"").trim().split(/\n/).map(s=>s.trim()).filter(Boolean);
 if(!lines.length)throw Error("Escribe las franjas verificadas de tu contrato.");
 return lines.map(line=>{
  const m=/^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)\s*=\s*(\d+(?:[.,]\d+)?)\s*%?$/.exec(line);
  if(!m)throw Error(`Franja no válida: ${line.slice(0,50)}. Usa 18:00-00:00=130`);
  return {start:`${m[1]}:${m[2]}`,end:`${m[3]}:${m[4]}`,percent:Number(m[5].replace(",","."))};
 });
}
export function parseBreaks(value){
 const raw=String(value||"").trim();if(!raw)return [];
 return raw.split(/\n/).map(line=>{
  const m=/^([01]\d|2[0-3]):([0-5]\d)\s*-\s*([01]\d|2[0-3]):([0-5]\d)\s*;\s*(pagado|sinpago)(?:\s*;\s*([^;]+)\s*;\s*([^;]+))?$/i.exec(line.trim());
  if(!m)throw Error("Descanso inválido. Escribe una línea como 19:00-19:30;sinpago o 10:00-10:15;pagado.");
  return {start:`${m[1]}:${m[2]}`,end:`${m[3]}:${m[4]}`,paid:m[5].toLowerCase()==="pagado",...(m[6]?{startInstant:m[6].trim(),endInstant:m[7].trim()}:{})};
 });
}
export const breaksToText=(breaks=[])=>breaks.map(b=>`${b.start}-${b.end};${b.paid?"pagado":"sinpago"}${b.startInstant?";"+b.startInstant+";"+b.endInstant:""}`).join("\n");
export const bandsToText=(bands=[])=>bands.map(b=>`${b.start}-${b.end}=${b.percent}`).join("\n");

export function leaveFormData(v){
 const date=String(v.date||"");
 if(!validDate(date))throw Error("Fecha de vacaciones inválida.");
 const kind=String(v.kind||"");if(!["opening","accrual","used","adjustment"].includes(kind))throw Error("Tipo de movimiento inválido.");
 const hours=Number(v.hours);if(!Number.isFinite(hours)||Math.abs(hours)>400||(hours<=0&&kind!=="adjustment"))throw Error("Indica horas válidas (no días).");
 const minutes=Math.round(hours*60);if(Math.abs(hours*60-minutes)>0.001)throw Error("Introduce horas en incrementos de un minuto.");
 if(kind==="adjustment"&&minutes===0)throw Error("La corrección no puede ser cero.");
 const reason=String(v.reason||"other");if(!["holiday","dayoff","other"].includes(reason))throw Error("Motivo no válido.");
 return {date,kind,minutes,reason,note:String(v.note||"").trim().slice(0,180)};
}

export function buildContract(v,employers=[]){
 if(!validDate(v.effectiveFrom)||(v.effectiveTo&&!validDate(v.effectiveTo))||(v.effectiveTo&&v.effectiveTo<v.effectiveFrom))throw Error("Vigencia del contrato inválida.");
 if(v.employerId&&!employers.some(e=>e.id===v.employerId))throw Error("La empresa seleccionada no pertenece a tu cuenta.");
 const c=validateContract({employerId:v.employerId||null,agency:String(v.agency||"").trim().slice(0,100),hourlyRate:v.hourlyRate,bands:parseBands(v.bands),
  overtimeThresholdHours:Number(v.overtimeThresholdHours),overtimePercent:Number(v.overtimePercent),effectiveFrom:v.effectiveFrom,effectiveTo:v.effectiveTo||null});
 if(!Number.isFinite(c.overtimeThresholdHours)||c.overtimeThresholdHours<=0||c.overtimeThresholdHours>100||!Number.isFinite(c.overtimePercent)||c.overtimePercent<100||c.overtimePercent>500)throw Error("Reglas de horas extra inválidas.");
 if(!c.agency)throw Error("Indica agencia o empresa.");
 return c;
}

// Devuelve los campos del registro shift_log (nuevo o revisión) y el resumen calculado.
export function buildShift(v,contracts,old=null,now=()=>new Date()){
 const record=contracts.find(c=>c.id===v.contractId);if(!record)throw Error("Selecciona un contrato guardado.");
 const contract=record.payload;
 if(!validDate(v.date))throw Error("Fecha no válida.");
 if(v.date<contract.effectiveFrom||(contract.effectiveTo&&v.date>contract.effectiveTo))throw Error("El contrato no estaba vigente en esa fecha.");
 const shift={date:v.date,start:v.start,end:v.end,startInstant:v.startInstant||null,endInstant:v.endInstant||null,breaks:parseBreaks(v.breaks),contractId:record.id,contractSnapshot:structuredClone(contract)};
 const summary=calculateShift(shift,contract);
 const payload=old?{...shift,revision:(old.payload?.revision||0)+1,
  priorRevisions:[...(old.payload?.priorRevisions||[]).slice(-8),{at:now().toISOString(),previous:old.payload}]}:shift;
 return {fields:{title:`${shift.date} ${shift.start}–${shift.end}`,status:"recorded",occurred_at:`${shift.date}T12:00:00Z`,payload},summary};
}

export function shiftCSV(rows){
 const headers=["fecha","agencia","entrada","salida","min_programados","min_descanso_sin_pago","min_descanso_pagado","min_remunerados","horas_100","horas_130","horas_150","horas_extra","bruto_estimado_eur"];
 const cell=x=>'"'+String(x??"").replaceAll('"','""')+'"';
 const payroll=calculateWeeklyPayroll(rows);
 const detailsById=new Map(payroll.shifts.filter(x=>x.id).map(x=>[x.id,x]));
 const body=rows.map(r=>{const p=r.payload||{},base=calculateShift(p,p.contractSnapshot);
  const extra=detailsById.get(r.id)||payroll.shifts.find(s=>s.date===p.date&&s.start===p.start&&s.end===p.end&&s.agency===p.contractSnapshot?.agency);
  if(!extra)throw Error("Falta la distribución semanal para el turno.");
  const byRate=percent=>extra.segments.filter(s=>s.percent===percent).reduce((a,x)=>a+x.minutes,0)/60;
  return [p.date,p.contractSnapshot.agency,p.start,p.end,base.scheduledMinutes,base.unpaidBreakMinutes,base.paidBreakMinutes,base.paidMinutes,byRate(100),byRate(130),byRate(150),extra.overtimeMinutes/60,extra.gross].map(cell).join(";");
 });
 return "﻿"+[headers.map(cell).join(";"),...body].join("\r\n");
}

// --- Persistencia (RLS del propietario; sin service-role) ---
function owner(uid){if(typeof uid!=="string"||!uid)throw Error("Inicia sesión para consultar tus turnos.");return uid;}
async function listAll(client,uid,[domain,type]){
 const rows=[];
 for(let start=0;start<10000;start+=500){
  const {data,error}=await client.from("hub_records").select(COLUMNS).eq("owner_id",uid).eq("domain",domain).eq("record_type",type)
   .order("id",{ascending:true}).range(start,start+499);
  if(error||!Array.isArray(data))throw Error("No se pudieron cargar los registros de turnos.");
  if(data.some(r=>r.owner_id!==uid||r.record_type!==type))throw Error("La respuesta no corresponde a la cuenta activa.");
  rows.push(...data);if(data.length<500)return rows;
 }
 throw Error("Historial demasiado grande para mostrarlo completo.");
}
export async function loadShiftTracker(client,uid){
 const id=owner(uid);
 const [contracts,shifts,leave,balance,employers]=await Promise.all([
  listAll(client,id,TYPES.contract),listAll(client,id,TYPES.shift),listAll(client,id,TYPES.leave),
  client.from("payroll_balance_imports").select("*").eq("owner_id",id).maybeSingle(),
  client.from("payroll_employers").select("id,name").eq("user_id",id)
 ]);
 return {contracts:contracts.filter(c=>c.status!=="archived"),shifts,leave,
  balanceImport:balance?.error?null:balance?.data||null,balanceAvailable:!balance?.error,
  employers:employers?.error?[]:employers?.data||[]};
}
async function insert(client,uid,kind,fields){
 const [domain,record_type]=TYPES[kind];const id=uuid();
 const {data,error}=await client.from("hub_records").insert({id,owner_id:owner(uid),domain,record_type,...fields}).select(COLUMNS).single();
 if(error||!data)throw Error(error?.message||"No se pudo guardar.");
 return data;
}
export const addContract=(client,uid,contract)=>insert(client,uid,"contract",{title:contract.agency,status:"active",payload:contract});
export const addShift=(client,uid,fields)=>insert(client,uid,"shift",fields);
export const addLeave=(client,uid,m)=>insert(client,uid,"leave",{title:`${m.date} · ${m.kind}`,occurred_at:`${m.date}T12:00:00Z`,status:"recorded",payload:m});
export async function updateShift(client,uid,old,fields){
 if(!old?.id||!old.updated_at)throw Error("Actualiza antes de editar este turno.");
 const {data,error}=await client.from("hub_records").update(fields).eq("id",old.id).eq("owner_id",owner(uid))
  .eq("domain","work").eq("record_type","shift_log").eq("updated_at",old.updated_at).select(COLUMNS).maybeSingle();
 if(error)throw Error(error.message||"No se pudo guardar el turno.");
 if(!data)throw Error("El turno cambió en otro dispositivo. Actualiza antes de guardar.");
 return data;
}
export async function deleteShift(client,uid,old){
 if(!old?.id||!old.updated_at)throw Error("Actualiza antes de eliminar este turno.");
 const {data,error}=await client.from("hub_records").delete().eq("id",old.id).eq("owner_id",owner(uid))
  .eq("domain","work").eq("record_type","shift_log").eq("updated_at",old.updated_at).select("id");
 if(error)throw Error(error.message||"No se pudo eliminar.");
 if(!Array.isArray(data)||data.length!==1)throw Error("El turno cambió o ya no existe. Actualiza.");
 return true;
}
export function addLeaveGuard(movement,state){
 if(!state.balanceAvailable)throw Error("No se puede comprobar el saldo documentado. Actualiza antes de registrar vacaciones.");
 const existing=leaveBalance(state.leave,state.balanceImport);
 if(state.balanceImport&&movement.date<=state.balanceImport.as_of)throw Error("Ese movimiento ya está incluido en el saldo documentado.");
 if(movement.kind==="opening"&&existing.known)throw Error("Ya existe un saldo inicial. Registra diferencias como corrección.");
 return movement;
}
