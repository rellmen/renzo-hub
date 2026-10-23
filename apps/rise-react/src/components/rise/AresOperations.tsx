import {useMutation,useQueryClient} from '@tanstack/react-query';
import {useEffect,useState} from 'react';
import {Link} from '@tanstack/react-router';
import {useAuth} from '@/lib/auth/AuthProvider';
import {reviewAresRequest} from '@/lib/ares-decisions.mjs';
import type {AresRecord} from '@/lib/ares-records.mjs';
import {SectionCard} from './primitives';
export function AresOperations({approvals,agents}:{approvals:AresRecord[];agents:AresRecord[]}){
 const {client,user}=useAuth();const qc=useQueryClient();
 const [choice,setChoice]=useState<{row:AresRecord;decision:'approved'|'rejected'}|null>(null);
 useEffect(()=>{setChoice(null);},[user?.id]);
 const mutation=useMutation({mutationFn:async()=>{
  if(!client||!user||!choice)throw Error('Sesión necesaria.');
  return reviewAresRequest(client,user.id,choice.row,choice.decision);
 },onSuccess:async()=>{setChoice(null);await qc.invalidateQueries({queryKey:['ares-records',user?.id]});}});
 return <div className="space-y-6">
  <SectionCard eyebrow="AI Inbox" title="Revisar solicitudes" accent="var(--ares)">
   <p className="text-sm text-muted-foreground">Aprobar registra tu decisión. La ejecución de agentes requiere una acción e integración independientes.</p>
   {!approvals.length&&<p className="mt-4 text-sm">Sin solicitudes pendientes en los registros consultados.</p>}
   <ul className="mt-4 space-y-3">{approvals.map(row=>{
    const canReview=row.domain==='system'&&!!row.updated_at&&(['ares_operation','ares_decision'].includes(row.record_type));
    return <li key={row.id} className="rounded-xl border border-hairline p-4">
     <h3 className="break-words text-sm font-medium">{row.title||'Solicitud sin título'}</h3>
     <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{String(row.payload?.['details']||row.payload?.['note']||'Sin detalles')}</p>
     <p className="mt-2 text-xs text-muted-foreground">{row.status||'Sin estado'} · {row.occurred_at?.slice(0,10)||'Sin fecha'}</p>
     {canReview?<div className="mt-3 flex flex-wrap gap-2">{(['approved','rejected'] as const).map(decision=><button key={decision} type="button" className="btn-ghost" disabled={mutation.isPending} onClick={()=>{mutation.reset();setChoice({row,decision});}}>{decision==='approved'?'Registrar aprobación':'Rechazar'}</button>)}</div>:<Link className="mt-3 inline-block text-sm text-gold underline" to="/inbox">Revisar captura en AI Inbox</Link>}
    </li>;
   })}</ul>
   {choice&&<div className="mt-4 rounded-xl border border-gold/40 p-4" role="group" aria-label="Confirmar decisión">
    <p className="text-sm">{choice.decision==='approved'?'Registrar aprobación':'Rechazar'}: {choice.row.title||'Solicitud'}. Esta decisión no ejecuta la solicitud.</p>
    <div className="mt-3 flex gap-2"><button type="button" className="btn-gold" disabled={mutation.isPending} onClick={()=>mutation.mutate()}>Confirmar decisión</button><button type="button" className="btn-ghost" disabled={mutation.isPending} onClick={()=>setChoice(null)}>Cancelar</button></div>
   </div>}
   {mutation.error&&<p role="alert" className="mt-3 text-sm">{mutation.error instanceof Error?mutation.error.message:'No se pudo guardar la decisión.'}</p>}
  </SectionCard>
  <SectionCard eyebrow="Agent Monitor" title="Actividad registrada" accent="var(--projects)">
   <p className="text-sm text-muted-foreground">Historial guardado; no acredita conectividad ni ejecución en tiempo real.</p>
   {!agents.length&&<p className="mt-4 text-sm">Sin eventos de agentes en los registros consultados.</p>}
   <ul className="mt-4 space-y-3">{agents.map(row=><li key={row.id} className="rounded-xl border border-hairline p-3"><h3 className="text-sm">{row.title||'Evento sin título'}</h3><p className="mt-2 text-xs text-muted-foreground">{String(row.payload?.['agent']||'Origen sin indicar')} · {row.status||'Sin estado'} · {row.occurred_at?.slice(0,19)||'Sin fecha'}</p></li>)}</ul>
  </SectionCard>
 </div>;
}
