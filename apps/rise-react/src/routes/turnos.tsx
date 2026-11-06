import {createFileRoute,Link} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {CalendarDays,RefreshCw,Save} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {SHIFT_MODES,loadShiftState,saveShiftState,nextShiftState,nextTemplateState,shiftPreview} from "@/lib/shift-state.mjs";
import {ShiftPayrollReport} from "@/components/rise/ShiftPayrollReport";
import {ShiftTrackerEditor} from "@/components/rise/ShiftTrackerEditor";
import {SubTabs,useSubTab} from "@/components/rise/SubTabs";
import {loadPayrollRecords} from "@/lib/payroll-records.mjs";

export const Route=createFileRoute("/turnos")({
 head:()=>pageHead("Turnos","Calendario laboral con el mismo estado que la aplicación clásica."),
 component:Shifts
});
/** Turnos en cuatro pestañas (6-11-2026). «Contratos» viene de Nóminas: es información de trabajo, no de sueldo. */
const TABS=[{id:"calendario",label:"Calendario"},{id:"registro",label:"Registro"},{id:"informe",label:"Informe"},{id:"contratos",label:"Contratos"}] as const;
const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
const money=(v:number|null|undefined)=>typeof v==="number"?eur.format(v):"—";
const DAYS=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
function dateToday(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function nextDays(){const now=new Date();return Array.from({length:14},(_,i)=>{
 const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
});}
function ShiftSelect({value,onChange,disabled=false}:{value:string;onChange:(v:string)=>void;disabled?:boolean}){
 return <select aria-label="Tipo de turno" value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}
 className="min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground">
  <option value="">Sin turno / eliminar excepción</option>
  {SHIFT_MODES.map(s=><option key={s} value={s}>{s}</option>)}
 </select>;
}
function Shifts(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [tab,go]=useSubTab(TABS,"calendario");
 const historical=useQuery({queryKey:["payroll-contracts-shifts",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadPayrollRecords(client!,uid),staleTime:30000,refetchOnWindowFocus:true});
 const [date,setDate]=useState(dateToday());
 const [mode,setMode]=useState("");
 const [day,setDay]=useState("1");
 const [templateMode,setTemplateMode]=useState("");
 const [status,setStatus]=useState("");
 const key=["shift-state",uid];
 const query=useQuery({queryKey:key,enabled:!!uid&&!!client,queryFn:()=>loadShiftState(client!,uid),
  staleTime:0,refetchOnWindowFocus:true});
 const save=useMutation({
  mutationFn:async(input:{kind:"date"|"template";date?:string;mode:string;day?:string})=>{
   if(!client||!query.data)throw Error("Primero carga el calendario actualizado.");
   const updated=input.kind==="date"
    ?nextShiftState(query.data.state,input.date!,input.mode)
    :nextTemplateState(query.data.state,input.day!,input.mode);
   return saveShiftState(client,uid,query.data,updated);
  },
  onSuccess:async()=>{
   setStatus("Turno guardado y confirmado en Supabase.");
   await qc.invalidateQueries({queryKey:key});
  }
 });
 const saveDate=()=>{setStatus("");save.mutate({kind:"date",date,mode});};
 const saveTemplate=()=>{setStatus("");save.mutate({kind:"template",day,mode:templateMode});};
 const calendar=nextDays(),data=query.data;
 return <div className="space-y-6">
  
  <PageHeader eyebrow="TRABAJO · TURNOS" title="Mis turnos"
   action={<button type="button" className="btn-ghost" disabled={query.isFetching} aria-label="Actualizar turnos" onClick={()=>void query.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(query.isFetching?"animate-spin":"")}/></button>}/>
  <SubTabs tabs={TABS} value={tab} onChange={go} label="Apartados de Turnos" accent="var(--projects)"/>
  {tab==="calendario"&&<>
  {query.isLoading&&<p role="status" className="surface p-4">Buscando turnos…</p>}
  {query.error&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">No se pudo consultar el estado del calendario.</p>}
  {data&&<div className="grid gap-5 lg:grid-cols-2">
   <SectionCard eyebrow="Próximos 14 días" title="Calendario" accent="var(--projects)">
    <ul className="divide-y divide-hairline">{calendar.map(d=><li key={d} className="flex items-center justify-between gap-3 py-3 text-sm">
     <span>{new Date(d+"T12:00:00").toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"})}</span>
     <span className="text-right text-xs text-platinum/80">{shiftPreview(data,d)||"Sin configurar"}</span>
    </li>)}</ul>
   </SectionCard>
   <div className="space-y-5">
    <SectionCard eyebrow="Excepción" title="Guardar un día" accent="var(--gold)">
     <label className="block text-xs text-muted-foreground">Fecha
      <input type="date" value={date} onChange={e=>setDate(e.target.value)}
       className="mt-2 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground"/>
     </label>
     <div className="mt-3"><ShiftSelect value={mode} onChange={setMode} disabled={save.isPending}/></div>
     <button type="button" className="btn-gold mt-4 min-h-11" disabled={save.isPending||!date} onClick={saveDate}>
      <Save className="h-4 w-4"/>{save.isPending?"Guardando…":"Guardar excepción"}
     </button>
    </SectionCard>
    <SectionCard eyebrow="Plantilla semanal" title="Horario recurrente" accent="var(--learn)">
     <label className="block text-xs text-muted-foreground">Día de la semana
      <select className="mt-2 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground"
       value={day} onChange={e=>{setDay(e.target.value);setTemplateMode(String(data.state.shiftTemplates?.[e.target.value]||""));}}>
       {DAYS.map((d,i)=><option key={d} value={String(i)}>{d}</option>)}
      </select>
     </label>
     <div className="mt-3"><ShiftSelect value={templateMode} onChange={setTemplateMode} disabled={save.isPending}/></div>
     <button type="button" className="btn-gold mt-4 min-h-11" disabled={save.isPending} onClick={saveTemplate}>
      <Save className="h-4 w-4"/> Guardar plantilla
     </button>
     <p className="mt-3 text-xs text-muted-foreground">Una fecha concreta tiene prioridad sobre la plantilla semanal.</p>
    </SectionCard>
   </div>
  </div>}
  {status&&<p role="status" className="surface p-4 text-sm">{status}</p>}
  {save.error&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">
   {save.error instanceof Error?save.error.message:"No se guardó. Actualiza antes de reintentar."}
  </p>}
  </>}
  {tab==="registro"&&<ShiftTrackerEditor/>}
  {tab==="informe"&&<>
   <ShiftPayrollReport/>
   <Link to="/nominas" className="btn-ghost inline-flex min-h-11 items-center"><CalendarDays className="h-4 w-4"/> Ver nóminas</Link>
  </>}
  {tab==="contratos"&&<SectionCard eyebrow="Importados de nóminas" title="Contratos y turnos importados" accent="var(--projects)">
   {historical.isLoading&&<p role="status" className="text-sm">Consultando contratos y turnos…</p>}
   {historical.error&&<p role="alert" className="text-sm text-gym">No se pudo recuperar la información contractual completa.</p>}
   {historical.data&&<div className="space-y-4">
     <p className="text-sm text-platinum/80">{historical.data.contracts.length} contratos · {historical.data.shifts.length} turnos guardados. No se calculan complementos sin reglas contractuales verificadas.</p>
     <details><summary className="cursor-pointer text-sm font-medium">Ver contratos registrados</summary>
       <ul className="mt-3 space-y-2">{historical.data.contracts.map(c=><li key={c.id} className="rounded-xl border border-hairline p-3 text-sm">
         <strong>{c.title||"Contrato sin título"}</strong><p className="mt-1 text-xs text-muted-foreground">Tarifa base registrada: {typeof c.payload?.hourlyRate==="number"?money(c.payload.hourlyRate)+"/h":"No verificada"}</p>
       </li>)}</ul>
     </details>
     <details><summary className="cursor-pointer text-sm font-medium">Ver historial de turnos</summary>
       <ul className="mt-3 space-y-2">{historical.data.shifts.slice(0,100).map(t=><li key={t.id} className="rounded-xl border border-hairline p-3 text-sm">
         <strong>{t.title||String(t.payload?.date||"Fecha pendiente")}</strong><p className="mt-1 text-xs text-muted-foreground">{String(t.payload?.start||"—")}–{String(t.payload?.end||"—")}</p>
       </li>)}</ul>
     </details>
   </div>}
  </SectionCard>}
 </div>;
}
