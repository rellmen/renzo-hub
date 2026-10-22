import {createFileRoute} from "@tanstack/react-router";
import {useState} from "react";
import {Archive,AlertTriangle,CheckCircle2,Download,RefreshCw,Search,ShieldCheck,UploadCloud} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {MIGRATION_TABLES,MIGRATION_BUCKETS,auditPrivateTables,buildMigrationBackup,legacyLocalKeys,comparisonAgainstExport,compareMigrationRows,compareMigrationFiles,type MigrationAudit} from "@/lib/migration-audit.mjs";

export const Route=createFileRoute("/migracion")({
 head:()=>pageHead("Migración y copias","Auditoría privada de datos, copia de seguridad y comparación segura entre versiones."),
 component:MigrationCenter
});
type Compared={table:string;backupCount:number|null;currentCount:number|null;match:boolean};
type RowCompared={table:string;backupCount:number|null;currentCount:number|null;missing:number;added:number;changed:number;match:boolean};
type FilesCompared={backupCount:number;currentCount:number;missing:number;added:number;changed:number;equal:boolean};
function downloadBackup(data:unknown){
 const blob=new Blob([JSON.stringify(data)],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download="rise-hub-copia-"+new Date().toISOString().slice(0,10)+".json";
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function MigrationCenter(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const [busy,setBusy]=useState<"audit"|"backup"|"compare"|"local"|null>(null);
 const [progress,setProgress]=useState("");
 const [error,setError]=useState("");
 const [audit,setAudit]=useState<MigrationAudit|null>(null);
 const [snapshot,setSnapshot]=useState<{key:string;present:boolean;valid?:boolean;modifiedAt?:string|null;counts?:Record<string,number>}[]|null>(null);
 const [compared,setCompared]=useState<Compared[]|null>(null);
 const [rowCompared,setRowCompared]=useState<RowCompared[]|null>(null);
 const [fileCompared,setFileCompared]=useState<FilesCompared|null>(null);
 const [equal,setEqual]=useState<boolean|null>(null);
 const [exported,setExported]=useState("");
 async function runAudit(){
  if(!client||!uid)return;
  setBusy("audit");setError("");setProgress("");
  try{setAudit(await auditPrivateTables(client,uid,{onProgress:s=>setProgress("Verificando "+s)}));}
  catch(e){setError(e instanceof Error?e.message:"No se pudo verificar la base de datos.");}
  finally{setBusy(null);setProgress("");}
 }
 async function backup(){
  if(!client||!uid)return;
  setBusy("backup");setError("");setExported("");setProgress("");
  try{
   const result=await buildMigrationBackup(client,uid,{onProgress:setProgress});
   downloadBackup(result);
   setExported("Copia descargada. Guárdala en un lugar privado y comprueba que puedes abrirla. Nunca la subas a una PR.");
  }catch(e){setError(e instanceof Error?e.message:"No se pudo completar la copia.");}
  finally{setBusy(null);setProgress("");}
 }
 function inspectLocal(){
  if(!uid)return;
  setBusy("local");setError("");
  try{setSnapshot(legacyLocalKeys(uid,window.localStorage));}
  catch(e){setError(e instanceof Error?e.message:"La copia del navegador no pudo verificarse.");}
  finally{setBusy(null);}
 }
 async function compare(file:File|undefined){
  if(!file||!uid)return;
  setBusy("compare");setError("");setCompared(null);setRowCompared(null);setFileCompared(null);setProgress("");
  try{
   if(file.size>96*1024*1024)throw Error("La copia supera 96 MB; no se cargará en memoria.");
   if(!audit?.complete)throw Error("Verifica primero todos los datos de Supabase.");
   if(!client)throw Error("Sesión de Supabase no disponible.");
   const raw=JSON.parse(await file.text()) as unknown;
   const result=comparisonAgainstExport(raw,audit,uid);
   const rows=await compareMigrationRows(client,uid,raw,{onProgress:setProgress});
   const files=await compareMigrationFiles(client,uid,raw,{onProgress:setProgress});
   setCompared(result.comparisons);setRowCompared(rows.comparisons);setFileCompared(files);
   setEqual(result.equal&&rows.equal&&files.equal);
  }catch(e){setError(e instanceof Error?e.message:"No se pudo comparar esta copia.");}
  finally{setBusy(null);setProgress("");}
 }
 const total=audit?Object.values(audit.counts).reduce((n,v)=>n+v,0):null;
 return <div className="space-y-6">
  <PageHeader eyebrow="SISTEMA · MIGRACIÓN SEGURA" title="Tus datos, bajo control"
    subtitle="Conciliación de Nocturne con el sistema clásico. Este apartado no modifica tus registros ni migra datos a otra cuenta."/>
  <div className="grid gap-5 lg:grid-cols-2">
   <SectionCard eyebrow="Fase 1 · Inventario" title="Auditar mi cuenta" accent="var(--gold)">
    <p className="text-sm text-platinum/80">Compara la presencia de las {Object.keys(MIGRATION_TABLES).length} tablas privadas de RISE HUB con la sesión autenticada, sin consultar ni mostrar datos de otras cuentas.</p>
    <button type="button" disabled={!!busy||!client||!uid} onClick={()=>void runAudit()} className="btn-gold mt-4 min-h-11">
     <RefreshCw className="h-4 w-4"/> {busy==="audit"?"Analizando…":"Comprobar registros"}
    </button>
    {audit&&<div className="mt-4 space-y-2">
     <p className="text-sm">{audit.complete?<CheckCircle2 className="mr-2 inline h-4 w-4 text-gold"/>:<AlertTriangle className="mr-2 inline h-4 w-4 text-gym"/>}
      {audit.complete?"Inventario de tablas accesible":"Algunas tablas no son accesibles"} · {total?.toLocaleString("es-ES")} filas visibles para esta sesión</p>
     <ul className="grid grid-cols-2 gap-2 text-xs">{Object.entries(audit.counts).map(([table,count])=>
      <li key={table} className="flex items-center justify-between gap-2 rounded-lg border border-hairline p-2">
       <span className="truncate" title={table}>{table}</span><strong>{count}</strong>
      </li>)}</ul>
     {audit.errors.map(r=><p key={r.table} role="alert" className="text-xs text-gym">{r.table}: no accesible</p>)}
    </div>}
   </SectionCard>
   <SectionCard eyebrow="Fase 1 · Respaldo" title="Exportación compatible" accent="var(--money)">
    <p className="text-sm text-platinum/80">Exporta tus tablas y los cuatro almacenes privados (<strong>{MIGRATION_BUCKETS.join(", ")}</strong>) en un JSON compatible con el formato de recuperación clásico.</p>
    <p className="mt-2 text-xs text-muted-foreground">El archivo puede contener nóminas, información bancaria y fotografías. La descarga se inicia solo al pulsar; máximo 60 MB de archivos privados. Utiliza preferentemente un ordenador.</p>
    <button type="button" disabled={!!busy||!client||!uid} onClick={()=>void backup()} className="btn-gold mt-4 min-h-11">
      <Download className="h-4 w-4"/>{busy==="backup"?"Exportando…":"Descargar copia privada"}
    </button>
    {exported&&<p role="status" className="mt-3 text-sm text-platinum/80">{exported}</p>}
   </SectionCard>
   <SectionCard eyebrow="Fase 1 · Navegador" title="Datos clásicos locales" accent="var(--learn)">
    <p className="text-sm text-platinum/80">Inspecciona únicamente si hay una copia local del mundo clásico en este mismo dominio, su fecha y el número de elementos. No lee contraseñas ni migra automáticamente datos.</p>
    <button type="button" disabled={!!busy||!uid} onClick={inspectLocal} className="btn-ghost mt-4 min-h-11">
     <Search className="h-4 w-4"/> Revisar este dispositivo
    </button>
    {snapshot&&<ul className="mt-3 space-y-3">{snapshot.map(s=><li key={s.key} className="rounded-lg border border-hairline p-3 text-xs">
      <strong>{s.key.split(":")[0]}</strong> · {!s.present?"Sin copia en este origen":!s.valid?"Copia presente, pero inválida":"Copia local disponible"}
      {s.modifiedAt&&<p className="mt-1">Último cambio declarado: {s.modifiedAt}</p>}
      {s.counts&&<p className="mt-1">Elementos: {Object.values(s.counts).reduce((n,v)=>n+v,0)}</p>}
     </li>)}</ul>}
    <p className="mt-3 text-xs text-muted-foreground">Si utilizaste otro dominio antes, su localStorage no se puede leer desde aquí. Importa una copia descargada de esa versión para comparar.</p>
   </SectionCard>
   <SectionCard eyebrow="Fase 1 · Conciliación" title="Comparar una copia" accent="var(--skin)">
    <p className="text-sm text-platinum/80">Selecciona un JSON exportado desde la aplicación clásica. Verificamos identificadores, contenido de las filas y archivos privados mediante SHA-256 en este navegador, sin subir el archivo ni restaurar datos.</p>
    <label className="btn-ghost mt-4 flex min-h-11 w-fit cursor-pointer items-center gap-2">
     <UploadCloud className="h-4 w-4"/> {busy==="compare"?"Comparando…":"Seleccionar archivo JSON"}
     <input type="file" accept=".json,application/json" className="sr-only" disabled={!!busy} onChange={e=>{const f=e.currentTarget.files?.[0];void compare(f);e.currentTarget.value="";}}/>
    </label>
    {compared&&<div className="mt-3 space-y-2">
      <p className="text-sm">{equal?"Coinciden registros y archivos privados de esta copia.":"Se han detectado diferencias o elementos sin verificar."}</p>
      <ul className="space-y-1 text-xs">{compared.filter(x=>!x.match).map(x=><li key={x.table}>{x.table}: copia {x.backupCount??"?"}, nube {x.currentCount??"?"}</li>)}</ul>
      {rowCompared?.filter(x=>!x.match).map(x=><p key={x.table} className="text-xs text-gym">{x.table}: faltan {x.missing}, nuevos {x.added}, modificados {x.changed}{x.backupCount===null?" · tabla ausente en la copia": ""}</p>)}
      {fileCompared&&<p className="text-xs">Archivos privados: copia {fileCompared.backupCount}, nube {fileCompared.currentCount}; faltan {fileCompared.missing}, nuevos {fileCompared.added}, modificados {fileCompared.changed}.</p>}
      <p className="text-xs text-muted-foreground">La comparación SHA-256 no recupera cambios locales pendientes ni garantiza que no se escribieran datos nuevos después de esta comprobación.</p>
    </div>}
   </SectionCard>
  </div>
  {progress&&<p role="status" className="surface p-4 text-sm text-platinum/80">{progress}</p>}
  {error&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">{error}</p>}
  <div className="surface flex gap-3 p-5 text-sm text-platinum/80">
   <ShieldCheck className="h-5 w-5 shrink-0 text-gold"/>
   <p>La exportación no prueba por sí sola la paridad React. No se eliminarán las bases clásicas ni se escribirán registros hasta cerrar las pruebas de integridad y recuperación.</p>
  </div>
 </div>;
}
