import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {useEffect,useState} from "react";
import {Bot,RefreshCw,ShieldCheck} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {loadAresRecords} from "@/lib/ares-records.mjs";
export const Route=createFileRoute("/agentes")({
 head:()=>pageHead("Agent Monitor","Ejecuciones de agentes registradas y revisiones pendientes."),
 component:Agents
});
type AgentRecord={id:string;title?:string|null;occurred_at?:string|null;status?:string|null;source?:string|null;payload?:Record<string,unknown>};
function Agents(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const q=useQuery({queryKey:["ares-records",uid],enabled:!!client&&!!uid,
  queryFn:()=>loadAresRecords(client!,uid),staleTime:15000,refetchOnWindowFocus:true});
 const data=q.data,all=(data?.agents||[]) as AgentRecord[];
 const [agent,setAgent]=useState("all"),[status,setStatus]=useState("all");
 useEffect(()=>{setAgent("all");setStatus("all");},[uid]);
 const agentOf=(x:AgentRecord)=>String(x.payload?.["agent"]||x.source||"Sin origen");
 const agents=[...new Set(all.map(agentOf))].sort(),statuses=[...new Set(all.map(x=>x.status||"Sin estado"))].sort();
 const events=all.filter(x=>(agent==="all"||agentOf(x)===agent)&&(status==="all"||(x.status||"Sin estado")===status));
 return <div className="space-y-6">
  <PageHeader eyebrow="ARES CENTER · SEGUIMIENTO" title="Agent Monitor"
   subtitle="Consulta ejecuciones registradas y revisiones. No se supone que un agente está activo si no consta evidencia."/>
  <SectionCard eyebrow="Actividad" title={data?String(events.length)+(events.length!==all.length?" de "+all.length:"")+" eventos":"Cargando eventos…"} accent="var(--ares)">
   <button type="button" className="btn-ghost min-h-11" disabled={q.isFetching} onClick={()=>void q.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(q.isFetching?"animate-spin":"")}/>Actualizar historial</button>
   {all.length>0&&<div className="mt-3 grid gap-3 sm:grid-cols-2">
    <label className="block text-xs text-muted-foreground">Agente<select value={agent} onChange={e=>setAgent(e.target.value)} className="mt-1 min-h-10 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"><option value="all">Todos</option>{agents.map(a=><option key={a}>{a}</option>)}</select></label>
    <label className="block text-xs text-muted-foreground">Estado<select value={status} onChange={e=>setStatus(e.target.value)} className="mt-1 min-h-10 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"><option value="all">Todos</option>{statuses.map(a=><option key={a}>{a}</option>)}</select></label>
   </div>}
   {data?.partial&&<p className="mt-3 text-xs text-gym">Se han consultado los primeros 300 registros; el historial puede ser parcial.</p>}
   {q.error&&<p role="alert" className="mt-3 text-xs text-gym">No se pudieron cargar los eventos de agentes.</p>}
   {data&&!events.length&&<p className="mt-3 text-sm text-muted-foreground">{all.length?"Ningún evento coincide con el filtro.":"No hay ejecuciones de agentes registradas en la muestra consultada."}</p>}
   {events.length>0&&<ul className="mt-4 divide-y divide-hairline">{events.map(x=><li key={x.id} className="flex gap-3 py-3">
    <Bot className="mt-1 h-4 w-4 shrink-0 text-gold"/>
    <div><p className="text-sm font-semibold">{x.title||"Evento automático"}</p>
      <p className="mt-1 text-xs text-muted-foreground">{(x.occurred_at||"").slice(0,16)} · {agentOf(x)} · {x.status||"Estado no identificado"}</p>
    </div>
   </li>)}</ul>}
  </SectionCard>
  <SectionCard eyebrow="Seguridad" title="Aprobaciones" accent="var(--gold)">
   <p className="text-sm text-platinum/80">{data?String(data.approvals.length):"—"} propuestas o decisiones pendientes registradas.</p>
   <p className="mt-2 flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0"/>Esta vista solo consulta registros. No ejecuta agentes, operaciones financieras ni tareas externas.</p>
   <Link to="/ares" className="btn-gold mt-4 inline-flex min-h-11 items-center">Abrir Ares Center</Link>
  </SectionCard>
 </div>;
}
