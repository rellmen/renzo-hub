import {createFileRoute} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {Download,FileText,RefreshCw,AlertTriangle} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {loadPayrollOverview,downloadPayrollDocument,type PayrollDocument} from "@/lib/payroll-overview.mjs";
import {SubTabs,useSubTab} from "@/components/rise/SubTabs";
import {backendEnvironmentForHost} from "@/lib/nocturne-environment.mjs";
import {PayrollUpload} from "@/components/rise/PayrollUpload";
import {PayrollReview} from "@/components/rise/PayrollReview";
import {PayrollMonthly} from "@/components/rise/PayrollMonthly";
import {payrollOutliers} from "@/lib/payroll-outliers.mjs";

export const Route=createFileRoute("/nominas")({
 head:()=>pageHead("Nóminas","Documentos salariales reales, validaciones y auditoría privada."),
 component:Payroll
});
/** Nóminas en tres pestañas (6-11-2026). Contratos y turnos importados viven ahora en Trabajo › Turnos. */
const TABS=[{id:"lista",label:"Nóminas"},{id:"mes",label:"Mes a mes"},{id:"subir",label:"Subir"}] as const;
const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
const money=(v:number|null|undefined)=>typeof v==="number"?eur.format(v):"—";
function Payroll(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const isStaging=import.meta.env['VITE_NOCTURNE_RELEASE_TARGET']==='preview'||import.meta.env['VITE_NOCTURNE_RELEASE_TARGET']==='staging'||(typeof window!=='undefined'&&backendEnvironmentForHost(window.location.hostname)==='staging');
 const [tab,go]=useSubTab(TABS,"lista");
 const [downloading,setDownloading]=useState<string|null>(null);
 const [fileError,setFileError]=useState("");
 const query=useQuery({queryKey:["payroll-overview",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadPayrollOverview(client!,uid),staleTime:30000,refetchOnWindowFocus:true});
 const data=query.data;
 const outliers=new Map((data?payrollOutliers(data.rows):[]).map(x=>[x.id,x.outlier]));
 const pendingOutliers=data?data.rows.filter(r=>outliers.has(r.id)&&r.review_status!=="approved"&&r.review_status!=="reviewed"):[];
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
  
  <PageHeader eyebrow="MONEY · NÓMINAS" title="Tu historial salarial"
    action={<button type="button" className="btn-ghost" disabled={query.isFetching} aria-label="Actualizar nóminas" onClick={()=>void query.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(query.isFetching?"animate-spin":"")}/></button>}/>
  {isStaging&&<p role="note" className="surface border border-gold/20 p-3 text-xs text-platinum/80">Staging: solo aparecen nóminas de prueba.</p>}
  <SubTabs tabs={TABS} value={tab} onChange={go} label="Apartados de Nóminas" accent="var(--money)"/>
  {tab==="subir"&&<PayrollUpload/>}
  {query.isLoading&&<p role="status" className="surface p-4">Cargando historial salarial…</p>}
  {query.error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">No se pudo cargar el historial completo; no se muestran cifras parciales.</p>}
  {data&&<>
   {tab==="lista"&&<p className="text-xs text-muted-foreground">{data.rows.length} nóminas · {data.documentCount} documentos · <span className={data.unresolvedAnomalies?"text-gym":""}>{data.unresolvedAnomalies} anomalías pendientes</span> · <span className={data.failedValidations?"text-gym":""}>{data.failedValidations} validaciones fallidas</span></p>}
   {tab==="lista"&&pendingOutliers.length>0&&<div role="status" className="surface border border-gym/40 p-4 text-sm">
    <p className="font-semibold text-gym"><AlertTriangle className="mr-2 inline h-4 w-4"/>{pendingOutliers.length===1?"1 nómina pendiente sale":`${pendingOutliers.length} nóminas pendientes salen`} muy por debajo de lo habitual</p>
    <p className="mt-1 text-xs text-platinum/75">Antes de aprobar: {pendingOutliers.map(r=>r.period_label||r.period_end).join(", ")}. Es un aviso automático; no cambia ningún dato.</p>
   </div>}
   {tab==="mes"&&<PayrollMonthly rows={data.rows}/>}
   {tab==="lista"&&<SectionCard eyebrow="Historial" title="Documentos y periodos" accent="var(--gold)">
    {!data.rows.length?<p className="text-sm text-muted-foreground">No hay nóminas vinculadas a tu cuenta.</p>:
    <ul className="divide-y divide-hairline">{data.rows.map(p=><li key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-[180px] flex-1 space-y-1">
       <p className="text-sm font-semibold">{p.period_label||p.period_end||"Periodo sin identificar"}</p>
       <p className="text-xs text-muted-foreground">Bruto: {money(p.gross_salary)} · Neto: {money(p.net_payment??p.net_salary)}</p>
       <p className="text-xs text-muted-foreground">Horas: {p.worked_hours??"—"} · Estado: {p.review_status||"Sin revisión"}</p>
       {outliers.has(p.id)&&(()=>{const o=outliers.get(p.id)!;return <p className="text-xs text-gym" data-testid="payroll-outlier">
        <AlertTriangle className="mr-1 inline h-3 w-3"/>Neto {money(o.net)}: {Math.round(o.ratio*100)} % de lo habitual ({money(o.usualNet)}, mediana de {o.references} nóminas revisadas). {o.question}
       </p>;})()}
       {(p.unresolved>0||p.failedValidations>0)&&<p className="text-xs text-gym">
        <AlertTriangle className="mr-1 inline h-3 w-3"/>{p.unresolved} anomalías pendientes · {p.failedValidations} reglas fallidas
       </p>}

       <details className="mt-3 rounded-xl border border-hairline bg-raised p-3 text-xs">
        <summary className="cursor-pointer font-medium text-gold">Desglose y auditoría · {p.lineItems.length} conceptos</summary>
        <div className="mt-3 space-y-3">
         {p.lineItems.length?<ul className="divide-y divide-hairline">{p.lineItems.map(i=><li key={i.id} className="flex items-center justify-between gap-3 py-2">
          <span className="min-w-0 break-words">{i.label_original||i.code||"Concepto sin etiqueta"}</span>
          <strong className="whitespace-nowrap tabular-nums">{money(i.amount)}</strong>
         </li>)}</ul>:<p className="text-muted-foreground">No hay conceptos normalizados registrados para esta nómina.</p>}
         {p.validations.length>0&&<div><p className="mb-1 font-medium">Validaciones ({p.validations.length})</p>
          <ul className="space-y-1">{p.validations.map(v=><li key={v.id} className={v.passed?"text-platinum/75":"text-gym"}>
           {v.passed?"Correcta":"Revisar"} · {v.rule_code||"Regla sin código"}
          </li>)}</ul>
         </div>}
         {p.anomalies.length>0&&<div><p className="mb-1 font-medium">Anomalías ({p.anomalies.length})</p>
          <ul className="space-y-1">{p.anomalies.map(a=><li key={a.id} className="text-platinum/75">
           {a.anomaly_type||"Anomalía"} · {a.status||"Sin estado"}
          </li>)}</ul>
         </div>}
         <p className="text-muted-foreground">Datos originales de revisión, sin modificar ni aprobar automáticamente.</p>
        </div>
       </details>
       <PayrollReview row={p}/>
      </div>
      {p.document?.storage_path_archive||p.document?.storage_path_raw?
       <button type="button" className="btn-ghost min-h-11" disabled={!!downloading}
        onClick={()=>void download(p.document!)}><Download className="h-4 w-4"/>
        {downloading===p.document?.id?"Descargando…":"Descargar PDF"}</button>:
       <span className="text-xs text-muted-foreground"><FileText className="mr-1 inline h-4 w-4"/>Documento no disponible</span>}
     </li>)}</ul>}
   </SectionCard>}
  </>}
  {fileError&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">{fileError}</p>}
 </div>;
}
