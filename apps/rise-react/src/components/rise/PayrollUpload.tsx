import {useEffect,useRef,useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {AlertTriangle,CheckCircle2,FileText,UploadCloud} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import type {PayrollParseResult} from "@/lib/payroll-pdf-parser.mjs";

const MAX_PDF_BYTES=3*1024*1024;
type Mode="idle"|"reading"|"preview"|"sending";
const format=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
function toBase64(buffer:ArrayBuffer){
 const bytes=new Uint8Array(buffer);let text="";
 for(let i=0;i<bytes.length;i+=0x8000)text+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
 return btoa(text);
}
export function PayrollUpload(){
 const {client,user,session}=useAuth(),uid=user?.id||"";
 const query=useQueryClient();
 const [file,setFile]=useState<File|null>(null);
 const [buffer,setBuffer]=useState<ArrayBuffer|null>(null);
 const [payload,setPayload]=useState<PayrollParseResult|null>(null);
 const [mode,setMode]=useState<Mode>("idle");
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const currentUid=useRef(uid);currentUid.current=uid;
 useEffect(()=>{
  setFile(null);setBuffer(null);setPayload(null);
  setMode("idle");setError("");setNotice("");
 },[uid]);
 const reset=()=>{
  setFile(null);setBuffer(null);setPayload(null);setMode("idle");setError("");
 };
 async function readFile(next:File|undefined){
  reset();setNotice("");
  if(!next)return;
  if(next.size>MAX_PDF_BYTES){setError("El PDF supera el máximo de 3 MB.");return;}
  if(next.size<100||(!/\.pdf$/i.test(next.name)&&next.type!=="application/pdf")){
   setError("Selecciona un PDF válido de nómina.");return;
  }
  setMode("reading");
  try{
   const bytes=await next.arrayBuffer();
   if(String.fromCharCode(...new Uint8Array(bytes.slice(0,5)))!=="%PDF-")throw Error("El archivo no contiene un PDF válido.");
   const {extractRows,parseSdWorx}=await import("@/lib/payroll-pdf-parser.mjs");
   const parsed=parseSdWorx(await extractRows(new Uint8Array(bytes.slice(0))));
   if(currentUid.current!==uid)return;
   setFile(next);setBuffer(bytes);setPayload(parsed);setMode("preview");
  }catch(e){
   if(currentUid.current!==uid)return;
   setMode("idle");setError(e instanceof Error?e.message:"No se pudo leer la nómina.");
  }
 }
 async function upload(){
  if(!file||!buffer||!payload||mode!=="preview"||!session?.access_token||!uid)return;
  setError("");setMode("sending");
  try{
   // PDF text is extracted locally; only the user's explicit confirmation sends it to their private backend.
   const response=await fetch("/api/payroll-upload",{
    method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},
    cache:"no-store",credentials:"same-origin",
    body:JSON.stringify({fileName:file.name,pdfBase64:toBase64(buffer),payload})
   });
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(typeof result.error==="string"?result.error:"No fue posible subir la nómina.");
   if(currentUid.current!==uid)return;
   reset();
   setNotice(result.duplicate
    ?"El documento ya existe; no se ha creado ninguna nómina duplicada."
    :"Nómina guardada en tu almacenamiento privado, pendiente de revisión humana.");
   await query.invalidateQueries({queryKey:["payroll-overview",uid]});
  }catch(e){
   if(currentUid.current!==uid)return;
   setMode("preview");setError(e instanceof Error?e.message:"No fue posible subir la nómina.");
  }
 }
 return <SectionCard eyebrow="MY FINANCE · DOCUMENTOS" title="Subir nómina" accent="var(--money)">
  <p className="text-sm text-platinum/80">Importación privada de PDF semanales de SD Worx. Se analizan en tu dispositivo antes de confirmar y nunca se aprueban automáticamente.</p>
  <div className="mt-4 space-y-4">
   <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gold/40 bg-raised px-4 py-3 text-sm">
    <UploadCloud className="h-5 w-5 text-gold"/>
    <span>{mode==="reading"?"Analizando archivo…":file?.name||"Seleccionar nómina PDF (máximo 3 MB)"}</span>
    <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={mode==="reading"||mode==="sending"||!uid}
     onChange={e=>{void readFile(e.currentTarget.files?.[0]);e.currentTarget.value="";}}/>
   </label>
   {mode==="preview"||mode==="sending"?<div className="space-y-3 rounded-xl border border-hairline p-4">
    <p className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4"/> Revisión antes de subir</p>
    <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
     <div><dt className="text-muted-foreground">Número</dt><dd>{payload?.payslip.payslip_number}</dd></div>
     <div><dt className="text-muted-foreground">Periodo</dt><dd>Semana {payload?.payslip.period_number} · {payload?.payslip.period_year}</dd></div>
     <div><dt className="text-muted-foreground">Bruto</dt><dd>{format.format(payload?.payslip.gross_salary||0)}</dd></div>
     <div><dt className="text-muted-foreground">Neto</dt><dd>{format.format(payload?.payslip.net_salary||0)}</dd></div>
     <div><dt className="text-muted-foreground">A pagar</dt><dd>{format.format(payload?.payslip.net_payment||0)}</dd></div>
     <div><dt className="text-muted-foreground">Conceptos</dt><dd>{payload?.line_items.length||0}</dd></div>
    </dl>
    {payload?.checks.some(c=>!c.passed)&&<p className="flex gap-2 text-xs text-gym"><AlertTriangle className="h-4 w-4 shrink-0"/>Hay discrepancias; revisa el documento después de subirlo.</p>}
    <div className="flex flex-wrap gap-2">
     <button className="btn-gold min-h-11" type="button" disabled={mode==="sending"} onClick={()=>void upload()}>
      <UploadCloud className="h-4 w-4"/>{mode==="sending"?"Subiendo…":"Confirmar subida privada"}
     </button>
     <button className="btn-ghost min-h-11" type="button" disabled={mode==="sending"} onClick={reset}>Cancelar</button>
    </div>
   </div>:null}
   {error&&<p role="alert" className="text-sm text-gym">{error}</p>}
   {notice&&<p role="status" className="flex gap-2 text-sm text-money"><CheckCircle2 className="h-4 w-4 shrink-0"/>{notice}</p>}
   <p className="text-xs text-muted-foreground">Otros formatos y nóminas mensuales todavía no están soportados. El fichero original se conserva en el bucket privado Payroll.</p>
  </div>
 </SectionCard>;
}
