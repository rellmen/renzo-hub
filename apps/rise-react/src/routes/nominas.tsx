import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {Download,FileText,RefreshCw,ShieldCheck,AlertTriangle,ArrowRight} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {loadPayrollOverview,downloadPayrollDocument,type PayrollDocument} from "@/lib/payroll-overview.mjs";
import {loadPayrollRecords} from "@/lib/payroll-records.mjs";
import {LEGACY_FALLBACK_URL} from "@/lib/nocturne-environment.mjs";
import {PayrollUpload} from "@/components/rise/PayrollUpload";

export const Route=createFileRoute("/nominas")({
 head:()=>pageHead("Nóminas","Documentos salariales reales, validaciones y auditoría privada."),
 component:Payroll
});
const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
const money=(v:number|null|undefined)=>typeof v==="number"?eur.format(v):"—";
function Payroll(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const [downloading,setDownloading]=useState<string|null>(null);
 const [fileError,setFileError]=useState("");
 const query=useQuery({queryKey:["payroll-overview",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadPayrollOverview(client!,uid),staleTime:30000,refetchOnWindowFocus:true});
 const data=query.data;
 const historical=useQuery({queryKey:["payroll-contracts-shifts",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadPayrollRecords(client!,uid),staleTime:30000,refetchOnWindowFocus:true});
 async function download(doc:PayrollDocument){
  if(!client)return;
  setDownloading(doc.id);setFileError("");
  try{
   const result=await downloadPayrollDocument(client,uid,doc);
   const url=URL.createObjectURL(result.blob),a=document.createElement("a");
   a.href=url;a.download=result.name;document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),2000);
  }catch(e){setFileError(e instanceof Error?e.message:"Error descargando documento");}
  finally{setDownloading(null);}
 }
 return <div className="space-y-6">
  <PageHeader eyebrow="MY FINANCE · NÓMINAS" title="Tu historial salarial"
    subtitle="Datos originales de Supabase. No se alteran importes, nóminas ni documentos durante esta migración."/>
  <PayrollUpload/>
  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-platinum/75">
   <p><ShieldCheck className="mr-2 inline h-4 w-4 text-gold"/>Solo se muestran las nóminas vinculadas a tu sesión.</p>
   <button type="button" className="btn-ghost" disabled={query.isFetching} onClick={()=>void query.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(query.isFetching?"animate-spin":"")}/> Actualizar</button>
  </div>
  {query.isLoading&&<p role="status" className="surface p-4">Cargando historial salarial…</p>}
  {query.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">No se pudo cargar el historial completo; no se muestran cifras parciales.</p>}
  {data&&<>
   <div className="grid gap-4 sm:grid-cols-3">
    <SectionCard eyebrow="Nóminas" title={String(data.rows.length)} accent="var(--gold)">
     <p className="text-xs text-muted-foreground">{data.documentCount} documentos asociados</p>
    </SectionCard>
    <SectionCard eyebrow="Anomalías" title={String(data.unresolvedAnomalies)} accent="var(--gym)">
     <p className="text-xs text-muted-foreground">Pendientes según el estado original de las revisiones</p>
    </SectionCard>
    <SectionCard eyebrow="Validaciones" title={String(data.failedValidations)} accent="var(--money)">
     <p className="text-xs text-muted-foreground">Comprobaciones no superadas registradas históricamente</p>
    </SectionCard>
   </div>
   <SectionCard eyebrow="Historial privado" title="Documentos y periodos" accent="var(--gold)">
    {!data.rows.length?<p className="text-sm text-muted-foreground">No hay nóminas vinculadas a tu cuenta.</p>:
    <ul className="divide-y divide-hairline">{data.rows.map(p=><li key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-[180px] flex-1 space-y-1">
       <p className="text-sm font-semibold">{p.period_label||p.period_end||"Periodo sin identificar"}</p>
       <p className="text-xs text-muted-foreground">Bruto: {money(p.gross_salary)} · Neto: {money(p.net_payment??p.net_salary)}</p>
       <p className="text-xs text-muted-foreground">Horas: {p.worked_hours??"—"} · Estado: {p.review_status||"Sin revisión"}</p>
       {(p.unresolved>0||p.failedValidations>0)&&<p className="text-xs text-gym">
        <AlertTriangle className="mr-1 inline h-3 w-3"/>{p.unresolved} anomalías pendientes · {p.failedValidations} reglas fallidas
       </p>}
      </div>
      {p.document?.storage_path_archive||p.document?.storage_path_raw?
       <button type="button" className="btn-ghost min-h-11" disabled={!!downloading}
        onClick={()=>void download(p.document!)}><Download className="h-4 w-4"/>
        {downloading===p.document?.id?"Descargando…":"Descargar PDF"}</button>:
       <span className="text-xs text-muted-foreground"><FileText className="mr-1 inline h-4 w-4"/>Documento no disponible</span>}
     </li>)}</ul>}
   </SectionCard>
  </>}
  <SectionCard eyebrow="SHIFT TRACKER · DATOS REALES" title="Contratos y turnos importados" accent="var(--projects)">
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
  </SectionCard>
  {fileError&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">{fileError}</p>}
  <SectionCard eyebrow="Compatibilidad" title="Herramientas laborales avanzadas" accent="var(--projects)">
   <p className="text-sm text-platinum/75">Las correcciones, reextracción documental y comparación salarial avanzada siguen en el módulo clásico hasta superar la paridad de escrituras en React.</p>
   <div className="mt-3 flex flex-wrap gap-2">
    <Link to="/turnos" className="btn-gold inline-flex min-h-11 items-center"><ArrowRight className="h-4 w-4"/> Turnos</Link>
    <a href={LEGACY_FALLBACK_URL+"/?app=payroll"} target="_blank" rel="noopener noreferrer" className="btn-ghost inline-flex min-h-11 items-center">Herramientas clásicas</a>
   </div>
  </SectionCard>
 </div>;
}
