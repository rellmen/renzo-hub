import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {Download,Pencil,RefreshCw,Save,Trash2,Wand2} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {
 addContract,addLeave,addLeaveGuard,addShift,bandsToText,breaksToText,buildContract,buildShift,calculateShift,deleteShift,
 leaveBalance,leaveFormData,loadShiftTracker,periodWeeks,proposedShift,shiftCSV,updateShift,type ShiftRow
} from "@/lib/shift-editor.mjs";

const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
const n2=new Intl.NumberFormat("es-ES",{maximumFractionDigits:2});
const input="mt-2 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground";
const label="block text-xs text-muted-foreground";
const KIND:Record<string,string>={opening:"Saldo inicial",accrual:"Acumuladas",used:"Usadas",adjustment:"Corrección"};
const EMPTY_SHIFT={shiftId:"",contractId:"",date:"",start:"",end:"",startInstant:"",endInstant:"",breaks:""};
function nlToday(){
 const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Amsterdam",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).map(x=>[x.type,x.value]));
 return `${p['year']}-${p['month']}-${p['day']}`;
}
const message=(e:unknown,fallback:string)=>e instanceof Error?e.message:fallback;

export function ShiftTrackerEditor(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const key=["shift-tracker",uid];
 const query=useQuery({queryKey:key,enabled:!!client&&!!uid,queryFn:()=>loadShiftTracker(client!,uid),staleTime:0,refetchOnWindowFocus:true,retry:false});
 const [shift,setShift]=useState({...EMPTY_SHIFT,date:nlToday()});
 const [notice,setNotice]=useState("");
 const [confirmDelete,setConfirmDelete]=useState<ShiftRow|null>(null);
 const formRef=useRef<HTMLFormElement>(null);
 useEffect(()=>{setShift({...EMPTY_SHIFT,date:nlToday()});setConfirmDelete(null);setNotice("");},[uid]);
 const data=query.data;
 useEffect(()=>{const last=data?.contracts[data.contracts.length-1];if(last&&!shift.contractId)setShift(s=>({...s,contractId:last.id}));},[data,shift.contractId]);
 const refresh=async()=>{await qc.invalidateQueries({queryKey:key});await qc.invalidateQueries({queryKey:["shift-payroll-report",uid]});};
 const run=useMutation({
  mutationFn:async(op:()=>Promise<string>)=>op(),
  onSuccess:async(text)=>{setNotice(text);await refresh();},
  onError:()=>setNotice("")
 });
 const ensure=()=>{if(!client||!data)throw Error("Primero carga los turnos actualizados.");return {client,data};};

 const submitContract=(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();const form=e.currentTarget;const v=Object.fromEntries(new FormData(form)) as Record<string,string>;
  run.mutate(async()=>{const {client,data}=ensure();const c=buildContract(v,data.employers);await addContract(client,uid,c);form.reset();
   return "Contrato guardado. Los turnos conservarán una copia de estas condiciones.";});
 };
 const submitShift=(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();
  run.mutate(async()=>{const {client,data}=ensure();
   const old=shift.shiftId?data.shifts.find(r=>r.id===shift.shiftId)||null:null;
   if(shift.shiftId&&!old)throw Error("No se encuentra el turno que quieres modificar.");
   const {fields,summary}=buildShift(shift,data.contracts,old);
   if(old)await updateShift(client,uid,old,fields);else await addShift(client,uid,fields);
   setShift({...EMPTY_SHIFT,contractId:shift.contractId,date:shift.date});
   return `Turno ${old?"actualizado":"guardado"} · ${n2.format(summary.paidMinutes/60)} h remuneradas. El importe semanal con horas extra se recalcula en el resumen.`;});
 };
 const submitLeave=(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();const form=e.currentTarget;const v=Object.fromEntries(new FormData(form)) as Record<string,string>;
  run.mutate(async()=>{const {client,data}=ensure();const m=addLeaveGuard(leaveFormData(v),data);await addLeave(client,uid,m);form.reset();
   return "Movimiento de vacaciones guardado. Comprueba el saldo con tu nómina de SD Worx.";});
 };
 const propose=()=>{
  setNotice("");
  try{
   if(!shift.date)throw Error("Selecciona primero la fecha del turno.");
   const p=proposedShift(shift.date);
   if(!p.workingDay)throw Error("Es fin de semana. Introduce las horas reales solo si trabajaste.");
   setShift(s=>({...s,start:p.start,end:p.end,breaks:"",startInstant:"",endInstant:""}));
   setNotice(`Turno de ${p.rotation==="morning"?"mañana":"tarde"} sugerido. Ajusta la salida y registra el descanso real (normalmente 30 min sin pago).`);
  }catch(e){setNotice(message(e,"No se pudo sugerir el turno."));}
 };
 const edit=(r:ShiftRow)=>{
  const p=r.payload||{};
  setShift({shiftId:r.id,contractId:p.contractId||"",date:p.date||"",start:p.start||"",end:p.end||"",startInstant:p.startInstant||"",endInstant:p.endInstant||"",breaks:breaksToText(p.breaks)});
  setNotice("Editando turno existente: revisa y guarda los cambios. La versión anterior queda en su historial.");
  formRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
 };
 const exportCSV=()=>{
  try{
   if(!data)return;
   const url=URL.createObjectURL(new Blob([shiftCSV(data.shifts)],{type:"text/csv;charset=utf-8"}));
   const a=document.createElement("a");a.href=url;a.download="rise-hub-turnos.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){setNotice(message(e,"No se pudo exportar."));}
 };

 let balance:ReturnType<typeof leaveBalance>|null=null,balanceError="";
 if(data?.balanceAvailable){try{balance=leaveBalance(data.leave,data.balanceImport);}catch(e){balanceError=message(e,"Saldo no calculable.");}}
 const history=data?data.shifts.slice().sort((a,b)=>String(b.payload?.date).localeCompare(String(a.payload?.date))).slice(0,60):[];
 const busy=run.isPending;

 return <div className="space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <p className="text-xs text-platinum/75">Shift Tracker nativo · contratos, turnos, descansos, ORT, DST y vacaciones sobre tus registros originales.</p>
   <button type="button" className="btn-ghost" disabled={query.isFetching} onClick={()=>void query.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(query.isFetching?"animate-spin":"")}/> Actualizar turnos
   </button>
  </div>
  {query.isLoading&&<p role="status" className="surface p-4 text-sm">Cargando contratos y turnos…</p>}
  {query.error&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">{message(query.error,"No se pudieron cargar los turnos.")}</p>}
  {notice&&<p role="status" className="surface p-4 text-sm">{notice}</p>}
  {run.error&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">{message(run.error,"No se pudo guardar.")}</p>}
  {data&&<div className="grid gap-5 lg:grid-cols-2">
   <SectionCard eyebrow="1 · Contrato / agencia" title={`Contratos (${data.contracts.length})`} accent="var(--money)">
    <ul className="divide-y divide-hairline">{data.contracts.map(c=><li key={c.id} className="py-3 text-sm">
     <strong className="break-words">{c.title}</strong>
     <p className="text-xs text-muted-foreground">{eur.format(Number(c.payload?.hourlyRate)||0)} / h · {c.payload?.effectiveFrom||"Sin fecha"} · {c.payload?.effectiveTo||"vigente sin fin"} · extra {c.payload?.overtimePercent??150} % tras {c.payload?.overtimeThresholdHours??40} h</p>
     <details className="mt-1 text-xs text-muted-foreground"><summary>Franjas del contrato</summary><pre className="mt-1 whitespace-pre-wrap">{bandsToText(c.payload?.bands)}</pre></details>
    </li>)}</ul>
    <details className="mt-3" open={!data.contracts.length}>
     <summary className="cursor-pointer text-sm text-gold">Añadir contrato o nueva versión</summary>
     <form className="mt-3 space-y-3" onSubmit={submitContract}>
      <label className={label}>Agencia o empresa<input name="agency" maxLength={100} required className={input} placeholder="Nombre que figura en tu contrato"/></label>
      <label className={label}>Empresa oficial de la nómina<select name="employerId" className={input} defaultValue=""><option value="">Sin vincular · no comparar todavía</option>{data.employers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
      <label className={label}>Tarifa bruta por hora (€)<input name="hourlyRate" type="number" min="0.01" max="1000" step="0.01" required className={input}/></label>
      <div className="grid gap-3 sm:grid-cols-2">
       <label className={label}>Límite semanal de extra (h)<input name="overtimeThresholdHours" type="number" min="1" max="100" step="0.5" defaultValue={40} required className={input}/></label>
       <label className={label}>Horas extra: % de tarifa total<input name="overtimePercent" type="number" min="100" max="500" step="1" defaultValue={150} required className={input}/></label>
       <label className={label}>Desde<input name="effectiveFrom" type="date" required className={input}/></label>
       <label className={label}>Hasta (opcional)<input name="effectiveTo" type="date" className={input}/></label>
      </div>
      <label className={label}>Franjas y % de TARIFA TOTAL (una por línea)<textarea name="bands" rows={4} required className={input+" py-2"} placeholder={"00:00-06:00=100\n06:00-18:00=100\n18:00-00:00=130"}/></label>
      <p className="text-xs text-muted-foreground">130 significa 1,30 × la tarifa. Introduce los valores de tu contrato: deben cubrir 24 horas sin solaparse. No se presumen pluses.</p>
      <button type="submit" className="btn-gold min-h-11" disabled={busy}><Save className="h-4 w-4"/> Guardar contrato</button>
     </form>
    </details>
   </SectionCard>

   <SectionCard eyebrow="2 · Registrar turno" title={shift.shiftId?"Editar turno":"Nuevo turno"} accent="var(--projects)">
    {!data.contracts.length?<p className="text-sm text-muted-foreground">Crea primero un contrato con sus tramos y porcentajes confirmados.</p>:
    <form ref={formRef} className="space-y-3" onSubmit={submitShift}>
     <label className={label}>Contrato verificado<select required className={input} value={shift.contractId} onChange={e=>setShift(s=>({...s,contractId:e.target.value}))}>
      {data.contracts.map(c=><option key={c.id} value={c.id}>{c.title} · {eur.format(Number(c.payload?.hourlyRate)||0)}/h</option>)}</select></label>
     <div className="grid gap-3 sm:grid-cols-3">
      <label className={label}>Fecha de inicio<input type="date" required className={input} value={shift.date} onChange={e=>setShift(s=>({...s,date:e.target.value}))}/></label>
      <label className={label}>Entrada<input type="time" required className={input} value={shift.start} onChange={e=>setShift(s=>({...s,start:e.target.value}))}/></label>
      <label className={label}>Salida<input type="time" required className={input} value={shift.end} onChange={e=>setShift(s=>({...s,end:e.target.value}))}/></label>
     </div>
     <label className={label}>Descansos (uno por línea; vacío si no hubo)<textarea rows={2} className={input+" py-2"} value={shift.breaks} onChange={e=>setShift(s=>({...s,breaks:e.target.value}))} placeholder={"19:00-19:30;sinpago\n10:00-10:15;pagado"}/></label>
     <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">CET/CEST · instantes con offset (cambio de hora)</summary>
      <p className="mt-2">Ej.: 2026-10-25T01:30+02:00 y 2026-10-25T03:30+01:00. Si hay descansos en esa noche, añade sus instantes en la línea del descanso.</p>
      <div className="grid gap-3 sm:grid-cols-2">
       <label className={label}>Entrada con offset<input className={input} value={shift.startInstant} onChange={e=>setShift(s=>({...s,startInstant:e.target.value}))} placeholder="2026-10-25T01:30+02:00"/></label>
       <label className={label}>Salida con offset<input className={input} value={shift.endInstant} onChange={e=>setShift(s=>({...s,endInstant:e.target.value}))} placeholder="2026-10-25T03:30+01:00"/></label>
      </div>
     </details>
     <div className="flex flex-wrap gap-2">
      <button type="submit" className="btn-gold min-h-11" disabled={busy}><Save className="h-4 w-4"/>{shift.shiftId?"Guardar cambios":"Guardar turno"}</button>
      <button type="button" className="btn-ghost min-h-11" disabled={busy} onClick={propose}><Wand2 className="h-4 w-4"/> Sugerir por rotación</button>
      {shift.shiftId&&<button type="button" className="btn-ghost min-h-11" onClick={()=>{setShift({...EMPTY_SHIFT,contractId:shift.contractId,date:nlToday()});setNotice("");}}>Cancelar edición</button>}
     </div>
     <p className="text-xs text-muted-foreground">Rotación: {periodWeeks(nlToday(),undefined,2).map(w=>w.date+" "+w.label).join(" · ")}. Es una propuesta, no horas trabajadas.</p>
    </form>}
   </SectionCard>

   <SectionCard eyebrow="3 · Historial" title={`Turnos (${data.shifts.length})`} accent="var(--gold)"
    action={data.shifts.length?<button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={exportCSV}><Download className="h-4 w-4"/> CSV</button>:undefined}>
    {!history.length&&<p className="text-sm text-muted-foreground">Sin turnos registrados.</p>}
    <ul className="divide-y divide-hairline">{history.map(r=>{
     const p=r.payload||{};let v:any=null,err="";
     try{v=calculateShift(p,p.contractSnapshot);}catch(e){err=message(e,"Turno no calculable");}
     return <li key={r.id} className="space-y-1 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2"><strong>{p.date} · {p.start}–{p.end}</strong>{v&&<strong>{eur.format(v.estimatedGross)}</strong>}</div>
      {err?<p role="alert" className="text-xs text-gym">{err}</p>:<p className="text-xs text-muted-foreground">{v.agency} · {n2.format(v.paidMinutes/60)} h remuneradas · {v.unpaidBreakMinutes} min sin pago · {v.segments.map((s:any)=>n2.format(s.hours)+" h × "+s.percent+" %").join(" · ")}{p.revision?` · revisión ${p.revision}`:""}</p>}
      <div className="flex gap-2 pt-1">
       <button type="button" className="btn-ghost min-h-9 px-3 text-xs" disabled={busy||!p.contractSnapshot} onClick={()=>edit(r)}><Pencil className="h-3.5 w-3.5"/> Editar</button>
       <button type="button" className="btn-ghost min-h-9 px-3 text-xs" disabled={busy} onClick={()=>{run.reset();setConfirmDelete(r);}}><Trash2 className="h-3.5 w-3.5"/> Eliminar</button>
      </div>
      {confirmDelete?.id===r.id&&<div role="group" aria-label="Confirmar eliminación" className="mt-2 rounded-xl border border-gym/40 p-3 text-xs">
       <p>¿Eliminar el turno {r.title}? No se puede deshacer y no afecta a nóminas.</p>
       <div className="mt-2 flex gap-2">
        <button type="button" className="btn-gold min-h-9 px-3" disabled={busy} onClick={()=>run.mutate(async()=>{const {client}=ensure();await deleteShift(client,uid,r);setConfirmDelete(null);return "Turno eliminado.";})}>Eliminar definitivamente</button>
        <button type="button" className="btn-ghost min-h-9 px-3" onClick={()=>setConfirmDelete(null)}>Cancelar</button>
       </div>
      </div>}
     </li>;})}</ul>
    <p className="mt-2 text-xs text-muted-foreground">Estimación bruta por turno aislado; las horas extra se aplican por semana ISO y agencia en el resumen.</p>
   </SectionCard>

   <SectionCard eyebrow="4 · Vacaciones y festivos" title="Saldo de horas" accent="var(--learn)">
    {!data.balanceAvailable?<p role="alert" className="text-sm">Saldo de vacaciones no disponible. Actualiza para comprobar la conexión antes de registrar vacaciones.</p>:<>
     <p className="text-sm"><strong>{balanceError||(balance?.known?`${n2.format((balance.minutes||0)/60)} h${balance.overdrawn?" · saldo negativo: revisar":" · saldo estimado"}`:"Desconocido: introduce las horas acumuladas de tu nómina")}</strong></p>
     <p className="mt-1 text-xs text-muted-foreground">Festivos y días libres pagados de este saldo no son horas trabajadas y no cuentan para el límite semanal. {data.balanceImport?`Saldo documentado a ${data.balanceImport.as_of}.`:""}</p>
     <form className="mt-3 space-y-3" onSubmit={submitLeave}>
      <div className="grid gap-3 sm:grid-cols-2">
       <label className={label}>Fecha<input type="date" name="date" required defaultValue={nlToday()} className={input}/></label>
       <label className={label}>Movimiento<select name="kind" className={input} defaultValue="used"><option value="opening">Saldo inicial confirmado</option><option value="accrual">Horas acumuladas</option><option value="used">Festivo / día libre descontado</option><option value="adjustment">Corrección +/-</option></select></label>
       <label className={label}>Horas<input type="number" name="hours" step="any" min="-400" max="400" required placeholder="Ej.: 8" className={input}/></label>
       <label className={label}>Motivo<select name="reason" className={input} defaultValue="holiday"><option value="holiday">Festivo</option><option value="dayoff">Día libre</option><option value="other">Otro</option></select></label>
      </div>
      <label className={label}>Nota (opcional)<input name="note" maxLength={180} className={input} placeholder="Referencia a saldo de nómina"/></label>
      <button type="submit" className="btn-gold min-h-11" disabled={busy}><Save className="h-4 w-4"/> Registrar movimiento</button>
     </form>
     <details className="mt-3 text-xs text-muted-foreground"><summary className="cursor-pointer">Historial de movimientos ({data.leave.length})</summary>
      <ul className="mt-2 space-y-1">{(balance?.history||[]).slice().reverse().slice(0,12).map((e:any,i:number)=><li key={i}>{e.date} · {KIND[e.kind]} · {n2.format(e.minutes/60)} h{e.includedInSnapshot?" · ya incluido en el saldo documentado":""}{e.note?` · ${e.note}`:""}</li>)}</ul>
     </details>
    </>}
   </SectionCard>
  </div>}
 </div>;
}
