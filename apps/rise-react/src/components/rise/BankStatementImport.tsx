import {useEffect,useRef,useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {AlertTriangle,CheckCircle2,FileUp} from "lucide-react";
import {SectionCard} from "@/components/rise/primitives";
import {useAuth} from "@/lib/auth/AuthProvider";
import {previewBankStatement,saveBankStatement,type BankImportPreview} from "@/lib/bank-import-client.mjs";
type Phase="idle"|"reading"|"preview"|"saving";
const euro=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
export function BankStatementImport(){
 const {client,user}=useAuth(),uid=user?.id||"";const qc=useQueryClient();
 const [phase,setPhase]=useState<Phase>("idle"),[preview,setPreview]=useState<BankImportPreview|null>(null);
 const [error,setError]=useState(""),[notice,setNotice]=useState("");
 const owner=useRef(uid);owner.current=uid;
 useEffect(()=>{setPhase("idle");setPreview(null);setError("");setNotice("");},[uid]);
 async function inspect(file?:File){
  setPreview(null);setError("");setNotice("");
  if(!file||!client||!uid)return;
  setPhase("reading");
  try{const p=await previewBankStatement(client,uid,file);
   if(owner.current!==uid)return;
   setPreview(p);setPhase("preview");
  }catch(e){if(owner.current!==uid)return;
   setPhase("idle");setError(e instanceof Error?e.message:"No se pudo leer el extracto.");
  }
 }
 async function confirm(){
  if(!client||!uid||!preview||phase!=="preview"||!preview.newCount)return;
  setPhase("saving");setError("");
  try{
   await saveBankStatement(client,uid,preview);
   if(owner.current!==uid)return;
   setPreview(null);setPhase("idle");
   setNotice("Extracto procesado de forma idempotente. Actualiza el historial para comprobar los movimientos guardados.");
   await Promise.all([
    qc.invalidateQueries({queryKey:["money-real",uid]}),
    qc.invalidateQueries({queryKey:["gastos-bank",uid]})
   ]);
  }catch(e){if(owner.current!==uid)return;
   setPhase("preview");setError(e instanceof Error?e.message:"No se pudo guardar el extracto.");
  }
 }
 return <SectionCard eyebrow="MY FINANCE · BANCOS" title="Importar movimientos bancarios" accent="var(--money)">
  <p className="text-sm text-platinum/80">Importa CSV de ING o Revolut, o PDF de Revolut. El fichero se analiza en tu dispositivo; ningún movimiento se guarda antes de confirmarlo.</p>
  <div className="mt-4 space-y-4">
   <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-money/40 bg-raised px-4 py-3 text-sm">
    <FileUp className="h-5 w-5 text-money"/><span>{phase==="reading"?"Leyendo extracto…":"Seleccionar extracto CSV/PDF (máximo 5 MB)"}</span>
    <input type="file" accept=".csv,.pdf,text/csv,application/pdf" className="sr-only" disabled={!uid||phase==="reading"||phase==="saving"}
     onChange={e=>{void inspect(e.currentTarget.files?.[0]);e.currentTarget.value="";}}/>
   </label>
   {preview&&<div className="space-y-3 rounded-xl border border-hairline p-4">
    <p className="text-sm font-semibold">{preview.bank} · {preview.fileName}</p>
    <p className="text-xs text-muted-foreground">{preview.from} — {preview.to} · cuentas {preview.accounts.join(", ")||"sin identificar"}</p>
    <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
     <div><dt className="text-muted-foreground">Movimientos</dt><dd>{preview.total}</dd></div>
     <div><dt className="text-muted-foreground">Nuevos</dt><dd>{preview.newCount}</dd></div>
     <div><dt className="text-muted-foreground">Ya existentes</dt><dd>{preview.alreadyImported}</dd></div>
     <div><dt className="text-muted-foreground">Entradas</dt><dd>{euro.format(preview.income)}</dd></div>
     <div><dt className="text-muted-foreground">Salidas</dt><dd>{euro.format(preview.expenses)}</dd></div>
     <div><dt className="text-muted-foreground">Referencias a nómina</dt><dd>{preview.salaryMentions}</dd></div>
    </dl>
    {preview.balanceBreaks.length>0&&<p className="flex gap-2 text-xs text-gym"><AlertTriangle className="h-4 w-4 shrink-0"/>El saldo del extracto no cuadra en {preview.balanceBreaks.length} movimientos. Revísalo antes de continuar.</p>}
    {preview.skippedLines.length>0&&<p className="text-xs text-gym">Se han omitido {preview.skippedLines.length} líneas no reconocidas.</p>}
    {preview.newCount===0&&<p className="text-xs text-muted-foreground">Este extracto ya estaba importado; no hay movimientos nuevos.</p>}
    <div className="flex flex-wrap gap-2">
     <button type="button" className="btn-gold min-h-11" disabled={phase==="saving"||preview.newCount===0}
      onClick={()=>void confirm()}>{phase==="saving"?"Guardando…":"Confirmar importación"}</button>
     <button type="button" className="btn-ghost min-h-11" disabled={phase==="saving"}
      onClick={()=>{setPreview(null);setPhase("idle");setError("");}}>Cancelar</button>
    </div>
   </div>}
   {error&&<p role="alert" className="text-sm text-gym">{error}</p>}
   {notice&&<p role="status" className="flex gap-2 text-sm text-money"><CheckCircle2 className="h-4 w-4 shrink-0"/>{notice}</p>}
   <p className="text-xs text-muted-foreground">Los registros se deduplican por identificador estable. Las referencias a nómina no implican que el cobro esté conciliado.</p>
  </div>
 </SectionCard>;
}
