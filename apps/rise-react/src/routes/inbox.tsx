import {createFileRoute,Link} from '@tanstack/react-router';
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query';
import {useRef,useState} from 'react';
import {Archive,Check,Download,Plus,RefreshCw,Upload} from 'lucide-react';
import {useAuth} from '@/lib/auth/AuthProvider';
import {PageHeader,SectionCard} from '@/components/rise/primitives';
import {pageHead} from '@/lib/seo';
import {CAPTURE_TYPES,attachCaptureFile,captureNeedsFinance,captureReviewAvailable,captureStatus,changeCaptureStatus,createCapture,downloadCaptureFile,loadInbox,reviewCapture,type Capture} from '@/lib/inbox-records.mjs';
export const Route=createFileRoute('/inbox')({head:()=>pageHead('AI Inbox','Capturas, adjuntos privados y revisión manual.'),component:Inbox});
function Inbox(){
 const {user}=useAuth();
 return <InboxAccount key={user?.id||'signed-out'}/>;
}
function InboxAccount(){
 const {client,user}=useAuth(),uid=user?.id||'',qc=useQueryClient();
 const [title,setTitle]=useState(''),[note,setNote]=useState(''),[category,setCategory]=useState('Note');
 const draftId=useRef('');
 const [filter,setFilter]=useState('needs_review');
 const [choice,setChoice]=useState<Capture|null>(null),[feedback,setFeedback]=useState('');
 const key=['inbox',uid];
 const q=useQuery({queryKey:key,enabled:!!uid&&!!client,queryFn:()=>loadInbox(client!,uid),staleTime:15000,refetchOnWindowFocus:true});
 async function refresh(){await Promise.all([qc.invalidateQueries({queryKey:key}),qc.invalidateQueries({queryKey:['car',uid]}),qc.invalidateQueries({queryKey:['ares-records',uid]})]);}
 const save=useMutation({mutationFn:async()=>{
  if(!client||!uid)throw Error('Sesión necesaria.');
  if(!draftId.current)draftId.current=crypto.randomUUID();
  return createCapture(client,uid,{id:draftId.current,title,note,category});
 },onSuccess:async()=>{draftId.current='';setTitle('');setNote('');setFeedback('Captura guardada en tu bandeja.');await refresh();}});
 const action=useMutation({mutationFn:async(input:{row:Capture;kind:'archive'|'restore'|'review'|'file'|'download';file?:File})=>{
  if(!client||!uid)throw Error('Sesión necesaria.');
  const {row,kind}=input;
  if(kind==='download'){
   const {blob,name}=await downloadCaptureFile(client,uid,row);
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }else if(kind==='file'){await attachCaptureFile(client,uid,row,input.file!);}
  else if(kind==='review'){await reviewCapture(client,uid,row);}
  else await changeCaptureStatus(client,uid,row,kind==='archive'?'archived':'needs_review');
  return kind;
 },onSuccess:async(kind)=>{setChoice(null);setFeedback(kind==='download'?'Adjunto descargado.':'Cambio guardado y confirmado.');await refresh();}});
 const busy=save.isPending||action.isPending;
 const rows=(q.data||[]).filter(r=>filter==='all'||captureStatus(r)===filter);
 return <div className="space-y-6">
  <PageHeader eyebrow="ARES · CAPTURE TO HUB" title="Tu AI Inbox" subtitle="Captura ideas, notas y documentos. Cada entrada conserva su origen y requiere tu revisión; no ejecuta agentes ni añade importes a tus cuentas."/>
  <SectionCard eyebrow="Nueva captura" title="Guárdalo para revisar" accent="var(--ares)">
   <form className="space-y-4" onSubmit={e=>{e.preventDefault();setFeedback('');save.mutate();}}>
    <fieldset disabled={busy} className="space-y-4">
     <label className="block text-sm">Título<input required maxLength={180} value={title} onChange={e=>{setTitle(e.target.value);draftId.current='';}} className="mt-2 w-full rounded-xl border border-input bg-raised p-3"/></label>
     <label className="block text-sm">Tipo<select value={category} onChange={e=>{setCategory(e.target.value);draftId.current='';}} className="mt-2 w-full rounded-xl border border-input bg-raised p-3">{CAPTURE_TYPES.map(t=><option key={t}>{t}</option>)}</select></label>
     <label className="block text-sm">Nota<textarea maxLength={2000} rows={3} value={note} onChange={e=>{setNote(e.target.value);draftId.current='';}} className="mt-2 w-full rounded-xl border border-input bg-raised p-3"/></label>
     <button type="submit" className="btn-gold"><Plus className="h-4 w-4"/>{save.isPending?'Guardando…':'Guardar captura'}</button>
    </fieldset>
   </form><p className="mt-3 text-xs text-muted-foreground">Puedes adjuntar un archivo privado después de guardar la captura.</p>
  </SectionCard>
  <div className="flex flex-wrap items-end justify-between gap-3">
   <label className="text-sm">Mostrar<select aria-label="Filtrar capturas" value={filter} onChange={e=>setFilter(e.target.value)} className="ml-3 rounded-xl border border-input bg-raised p-3"><option value="needs_review">Pendientes</option><option value="reviewed">Revisadas</option><option value="archived">Archivadas</option><option value="all">Todo el historial</option></select></label>
   <button type="button" className="btn-ghost" disabled={q.isFetching||busy} onClick={()=>void q.refetch()}><RefreshCw className="h-4 w-4"/>Actualizar bandeja</button>
  </div>
  {q.isLoading&&<p role="status">Consultando capturas privadas…</p>}
  {q.error&&<p role="alert">No se pudo recuperar la bandeja completa. Actualiza antes de decidir.</p>}
  {(save.error||action.error)&&<p role="alert" className="surface border border-gym/40 p-4 text-sm">{(save.error||action.error)?.message}</p>}
  {feedback&&<p role="status" className="surface p-4 text-sm">{feedback}</p>}
  {q.data&&!rows.length&&<p className="surface p-5 text-sm text-muted-foreground">No hay capturas con este estado.</p>}
  <ul className="space-y-4">{rows.map(row=>{
   const status=captureStatus(row),finance=captureNeedsFinance(row),p=row.payload;
   return <li key={row.id} className="surface space-y-3 p-5">
    <div className="flex flex-wrap justify-between gap-2"><h2 className="min-w-0 break-words font-display text-xl">{row.title||'Captura sin título'}</h2><span className="text-xs text-muted-foreground">{status==='needs_review'?'Pendiente':status==='reviewed'?'Revisada':status==='archived'?'Archivada':status}</span></div>
    <p className="text-xs text-muted-foreground">{p.category||'Sin clasificar'} · {p.date||row.occurred_at.slice(0,10)} · {p.source||'Origen sin indicar'}</p>
    {p.note&&<p className="whitespace-pre-wrap break-words text-sm">{p.note}</p>}
    {p.reviewReason&&<p className="break-words text-sm text-gold">{p.reviewReason}</p>}
    {p.extracted&&<details><summary className="cursor-pointer text-sm text-platinum/80">Datos detectados · pendientes de confirmar</summary><dl className="mt-2 space-y-2 text-sm">{Object.entries(p.extracted).filter(([,v])=>v!==null&&['string','number','boolean'].includes(typeof v)).map(([k,v])=><div key={k} className="break-words"><dt className="text-muted-foreground">{k}</dt><dd>{String(v)}</dd></div>)}</dl></details>}
    <div className="flex flex-wrap gap-2">
     {p.attachment&&<button type="button" className="btn-ghost max-w-full" disabled={busy} onClick={()=>action.mutate({row,kind:'download'})}><Download className="h-4 w-4 shrink-0"/><span className="truncate">{p.attachment.name||'Descargar adjunto'}</span></button>}
     {status==='needs_review'&&!p.attachment&&<label className="btn-ghost inline-flex cursor-pointer items-center"><Upload className="h-4 w-4"/>Adjuntar archivo<input type="file" aria-label={'Adjuntar a '+row.title} className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,.docx,.xlsx" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)action.mutate({row,kind:'file',file});e.target.value='';}}/></label>}
     {status==='needs_review'&&(captureReviewAvailable(row)?<button type="button" className="btn-gold" disabled={busy||!!q.error} onClick={()=>setChoice(row)}><Check className="h-4 w-4"/>{finance?'Confirmar documento de gasto':'Marcar revisada'}</button>:<Link to={String(p.category).toLowerCase()==='payslip'?'/nominas':'/dinero'} className="btn-gold">Revisar en {String(p.category).toLowerCase()==='payslip'?'Nóminas':'Money'}</Link>)}
     {status==='needs_review'&&<button type="button" className="btn-ghost" disabled={busy||!!q.error} onClick={()=>action.mutate({row,kind:'archive'})}><Archive className="h-4 w-4"/>Archivar</button>}
     {status==='archived'&&<button type="button" className="btn-ghost" disabled={busy||!!q.error} onClick={()=>action.mutate({row,kind:'restore'})}>Restaurar a pendientes</button>}
    </div>
    {finance&&status==='needs_review'&&<p className="text-xs text-muted-foreground">La extracción no se convierte automáticamente en un ingreso o gasto. Comprueba el documento y el movimiento bancario antes de confirmar importes.</p>}
   </li>;
  })}</ul>
  {choice&&<div className="surface space-y-3 border border-gold/40 p-5" role="group" aria-label="Confirmar revisión"><p className="break-words text-sm">¿Marcar «{choice.title}» como revisada y conservarla en el historial? Esto no ejecuta su contenido.</p>{captureNeedsFinance(choice)&&<p className="text-sm text-gold">Importe detectado: {String(choice.payload.extracted?.['amount'])} EUR · {choice.payload.date||'Sin fecha'}. Se guardará un documento de gasto; no se añade otro movimiento al saldo bancario.</p>}<div className="flex flex-wrap gap-2"><button type="button" className="btn-gold" disabled={busy} onClick={()=>action.mutate({row:choice,kind:'review'})}>Confirmar revisión</button><button type="button" className="btn-ghost" disabled={busy} onClick={()=>setChoice(null)}>Cancelar</button></div></div>}
 </div>;
}
