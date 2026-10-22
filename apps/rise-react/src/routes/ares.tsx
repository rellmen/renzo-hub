import {createFileRoute,Link} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {CalendarCheck,Dumbbell,GraduationCap,RefreshCw,ShieldCheck,Sparkles,Wallet,Inbox,MessageCircle} from "lucide-react";
import orb from "@/assets/ares.jpg";
import {pageHead} from "@/lib/seo";
import {SectionCard,EmptyState} from "@/components/rise/primitives";
import {useAuth} from "@/lib/auth/AuthProvider";
import {loadAresRecords,answerAresFromRecords} from "@/lib/ares-records.mjs";
import {aresPreviewStatus,askAresPreview} from "@/lib/ares-preview-client.mjs";

export const Route=createFileRoute("/ares")({
  head:()=>pageHead("Ares Center","Consulta privada de actividad y tareas registradas en RISE HUB."),
  component:AresPage
});
type Msg={role:"user"|"ares";text:string;id:number;source?:string};
const SUGGESTIONS=[
  {text:"¿Cuáles son mis proyectos?",icon:CalendarCheck},
  {text:"¿Qué tareas tengo esta semana?",icon:GraduationCap},
  {text:"¿Qué aprobaciones están pendientes?",icon:Dumbbell},
  {text:"¿Qué agentes tienen actividad registrada?",icon:Wallet}
];

function AresPage(){
  const {client,user,session}=useAuth();
  const [messages,setMessages]=useState<Msg[]>([]);
  const [input,setInput]=useState("");
  const sequence=useRef(0);
  const userId=useRef(user?.id);
  userId.current=user?.id;
  const [externalConsent,setExternalConsent]=useState(false);
  const [sending,setSending]=useState(false);
  useEffect(()=>{setMessages([]);setExternalConsent(false);setInput("");},[user?.id]);
  const preview=useQuery({
    queryKey:["ares-preview-status",user?.id],
    enabled:!!client&&!!user?.id,
    queryFn:()=>aresPreviewStatus(),
    staleTime:60000
  });
  const {data,isFetching,error,refetch}=useQuery({
    queryKey:["ares-records",user?.id],
    enabled:!!client&&!!user?.id,
    queryFn:()=>loadAresRecords(client!,user!.id),
    staleTime:20_000,refetchOnWindowFocus:true
  });
  const ask=async(text:string)=>{
    const q=text.trim();
    if(!q||!data||sending)return;
    const owner=user?.id;
    const id=++sequence.current;
    setMessages(old=>[...old,{id,role:"user",text:q}]);
    setInput("");setSending(true);
    try{
      const answer=externalConsent&&preview.data?.enabled
        ?await askAresPreview(q,session?.access_token||"")
        :{text:answerAresFromRecords(q,data),source:"Registros privados de RISE HUB"};
      if(userId.current!==owner)return;
      setMessages(old=>[...old,{id:++sequence.current,role:"ares",text:answer.text,source:answer.source}]);
    }catch(error){
      if(userId.current===owner)setMessages(old=>[...old,{
        id:++sequence.current,role:"ares",
        text:error instanceof Error?error.message:"La consulta no pudo completarse.",
        source:"Error · no se enviarán más datos sin que vuelvas a solicitarlo"
      }]);
    }finally{setSending(false);}
  };
  const submit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();void ask(input);};
  const message=(error:unknown)=>error instanceof Error?error.message:"No se pudieron consultar los registros.";
  return <div className="space-y-6">
    <section className="surface rim relative overflow-hidden" style={{background:"var(--ink)"}}>
      <img src={orb} alt="" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover object-center opacity-80 sm:object-[70%_center]"/>
      <div className="absolute inset-0 bg-hero-side"/>
      <div className="relative p-6 sm:p-10 lg:p-12">
        <div className="eyebrow mb-3 text-ares">Ares Center · Acceso privado</div>
        <h1 className="max-w-lg font-display text-5xl font-medium leading-[0.95] sm:text-6xl">Piensa contigo, <em className="text-gold-gradient">no por ti.</em></h1>
        <p className="mt-4 max-w-md text-sm text-platinum/80">Consulta tus proyectos, tareas y revisiones guardados de forma privada. Respuestas basadas exclusivamente en registros verificables.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-ink/50 px-3 py-1.5 text-xs text-platinum/80 backdrop-blur">
          <ShieldCheck className="h-3.5 w-3.5 text-gold"/> Consultas de datos reales · sin acciones automáticas
        </div>
      </div>
    </section>

    {error&&<p role="alert" className="surface border border-gym/40 p-4 text-sm text-gym">{message(error)}. No se mostrarán valores ficticios.</p>}

    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <SectionCard eyebrow={<span className="text-ares">Conversación privada</span>} title="Consultar Ares" accent="var(--ares)"
        action={<button className="btn-ghost min-h-9 px-3 text-xs" type="button" disabled={isFetching}
          onClick={()=>void refetch()}><RefreshCw className={"h-4 w-4 "+(isFetching?"animate-spin":"")}/> Actualizar</button>}>
        <div className="grid gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map(x=><button key={x.text} type="button" onClick={()=>void ask(x.text)}
            disabled={!data||isFetching||sending}
            className="flex min-h-14 items-center gap-3 rounded-xl border border-hairline bg-foreground/[0.02] px-4 text-left text-sm hover:border-ares/50 disabled:opacity-50">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ares/15 text-ares"><x.icon className="h-4 w-4"/></span>
            {x.text}
          </button>)}
        </div>
        <div aria-live="polite" className="my-5 max-h-[440px] min-h-[210px] space-y-4 overflow-y-auto rounded-xl border border-hairline bg-ink/40 p-4">
          {!data&&!error&&<p role="status" className="text-sm text-muted-foreground">Cargando registros privados…</p>}
          {messages.length===0&&data&&<EmptyState icon={<MessageCircle className="h-5 w-5"/>}
            title="Empieza una consulta" text="Por defecto, las respuestas usan solo tus registros privados; el proveedor externo es opcional."/>}
          {messages.map(m=><div key={m.id} className={m.role==="user"?"ml-8 rounded-2xl bg-wine-gradient p-4 text-sm":"mr-5 rounded-2xl border border-hairline bg-raised p-4 text-sm"}>
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-ares">{m.role==="user"?"Tú":m.source||"Ares · registros verificados"}</span>
            <p className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>
          </div>)}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <label className="sr-only" htmlFor="aresRealQuestion">Consulta</label>
          <input id="aresRealQuestion" maxLength={350} className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-obsidian px-4 text-sm text-foreground"
            value={input} onChange={e=>setInput(e.target.value)}
            placeholder="Pregunta sobre tareas o proyectos…" disabled={!data||sending}/>
          <button type="submit" className="btn-gold" disabled={!data||sending||!input.trim()}>{sending?"Consultando…":"Enviar"}</button>
        </form>
        <div className="mt-4 rounded-xl border border-hairline bg-raised p-4">
          <label className="flex items-start gap-3 text-xs text-platinum/85">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--ares)]"
              checked={externalConsent} disabled={!preview.data?.enabled||sending}
              onChange={e=>setExternalConsent(e.target.checked)}/>
            <span>Autorizo esta consulta a través del proveedor externo OpenRouter cuando solicite enviar una pregunta.
              Solo pueden compartirse títulos, estados y fechas limitadas de proyectos y tareas según el servidor.
              No incluiré nóminas, dinero, notas, credenciales ni datos sensibles. Puedo desactivarlo en cualquier momento.</span>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            {preview.isPending?"Comprobando la disponibilidad opcional…":preview.data?.enabled
              ?externalConsent?"Modelo gratuito activo para la siguiente consulta. No ejecuta acciones.":"Modelo externo disponible, pero desactivado hasta que autorices."
              :preview.data?.reason||"Solo disponible en la vista previa autorizada."}
          </p>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">El modo privado funciona por defecto y no envía preguntas a un modelo externo. Las respuestas no crean tareas ni ejecutan agentes.</p>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard eyebrow="Aprobaciones" title="Pendientes de revisión" accent="var(--gold)">
          {!data&&!error&&<p role="status">Cargando…</p>}
          {data&&data.approvals.length===0&&<EmptyState icon={<Inbox className="h-5 w-5"/>}
            title="Sin revisiones pendientes" text="No hay aprobaciones pendientes entre los registros consultados."/>}
          {data&&data.approvals.length>0&&<ul className="space-y-3">
            {data.approvals.slice(0,12).map(row=><li key={row.id}
              className="rounded-xl border border-hairline bg-raised p-4">
              <p className="break-words text-sm font-medium">{row.title||"Sin título"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Estado: {row.status||"Sin indicar"}</p>
              <span className="mt-2 inline-block rounded-full border border-gold/30 px-3 py-1 text-xs text-gold">Revisión manual · sin ejecutar</span>
            </li>)}
          </ul>}
          <p className="mt-3 text-xs text-muted-foreground">Las aprobaciones y operaciones sensibles se realizarán únicamente después de portar su flujo de autorización.</p>
        </SectionCard>
        <SectionCard eyebrow="Actividad" title="Datos disponibles" accent="var(--ares)">
          {data?<dl className="grid grid-cols-2 gap-3">
            {[["Proyectos",data.projects.length],["Tareas abiertas",data.tasks.length],["Revisiones",data.approvals.length],["Eventos",data.agents.length]].map(([label,value])=>
              <div key={label} className="rounded-xl border border-hairline p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="font-display text-3xl">{value}</dd></div>
            )}
          </dl>:<p className="text-sm text-muted-foreground">Sin datos cargados.</p>}
          {data?.partial&&<p className="mt-3 text-xs text-gold">Se muestran hasta 300 registros recientes; el total puede ser mayor.</p>}
          <Link to="/proyectos" className="btn-ghost mt-4 inline-flex">Abrir proyectos <Sparkles className="h-4 w-4"/></Link>
        </SectionCard>
      </div>
    </div>
  </div>;
}
