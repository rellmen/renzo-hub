import {createFileRoute} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState} from "react";
import {Check,Moon,Sun,ShieldCheck,RefreshCcw} from "lucide-react";
import img from "@/assets/skin.jpg";
import {pageHead} from "@/lib/seo";
import {PageHero} from "@/components/rise/PageHero";
import {SectionCard,EmptyState} from "@/components/rise/primitives";
import {ProgressRing} from "@/components/rise/ProgressRing";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PRODUCTS,stepsFor,dateKeyLocal} from "@/lib/skin-catalog.mjs";
import {loadSkinState,setSkinSteps,setSkinNote,weekSkinProgress,type SkinSession} from "@/lib/skin-records.mjs";

export const Route=createFileRoute("/piel")({
  head:()=>pageHead("Skin Routine","Tu cuidado real: productos, rutina e historial privado sincronizado."),
  component:Skin,
});

const STATUS:Record<string,string>={
  available:"Disponible",paused:"En pausa",finished:"Terminado",unknown:"Sin confirmar"
};
function errText(e:unknown){return e instanceof Error?e.message:"Error de conexión";}

function Skin(){
  const {client,user}=useAuth();
  const uid=user?.id||"";
  const qc=useQueryClient();
  const [mode,setMode]=useState<SkinSession>("pm");
  const [showAll,setShowAll]=useState(false);
  const [note,setNote]=useState("");
  const today=dateKeyLocal(new Date());
  const key=["skin-real",uid,today];
  const state=useQuery({
    queryKey:key,enabled:!!client&&!!uid,
    queryFn:()=>loadSkinState(client!,uid),
    staleTime:15000,refetchOnWindowFocus:true
  });
  const routine=useMutation({
    mutationFn:({session,index}:{session:SkinSession;index:number})=>{
      const steps=stepsFor(new Date(),session,state.data?.barrierFirst??true);
      const done=state.data?.current[session]||[];
      const next=done.includes(index)?done.filter(x=>x!==index):[...done,index];
      return setSkinSteps(client!,uid,today,session,next,steps.length);
    },
    onSuccess:()=>qc.invalidateQueries({queryKey:key}),
  });
  const saveNote=useMutation({
    mutationFn:()=>setSkinNote(client!,uid,today,note),
    onSuccess:()=>qc.invalidateQueries({queryKey:key}),
  });
  useEffect(()=>{if(state.data)setNote(state.data.note);},[state.data?.note,state.data?.today]);
  const steps=stepsFor(new Date(),mode,state.data?.barrierFirst??true);
  const completed=state.data?.current[mode]||[];
  const percent=steps.length&&state.data?Math.round(completed.length/steps.length*100):0;
  const week=weekSkinProgress(state.data?.logs||[],new Date(),state.data?.barrierFirst??true);
  return <div className="space-y-6">
    <PageHero image={img} eyebrow="SKIN ROUTINE · PRIVADO"
      title="Tu ritual, cada día."
      subtitle="Constancia antes que intensidad. Tu plan personal existente, sincronizado sin inventar productos."
      color="var(--skin)" priority/>
    {state.error&&<p role="alert" className="surface border border-gym/40 p-5 text-sm text-gym">Error al recuperar la rutina: {errText(state.error)}. No se han cargado productos ficticios.</p>}
    {state.isLoading&&<p role="status" className="surface p-5">Cargando los registros de tu piel…</p>}
    {!state.isLoading&&!state.error&&state.data&&<>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-skin"/> Datos de tu cuenta · {today}</span>
        <button type="button" className="btn-ghost" onClick={()=>void state.refetch()} disabled={state.isFetching}><RefreshCcw className={"h-4 w-4 "+(state.isFetching?"animate-spin":"")}/> Actualizar</button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <SectionCard eyebrow={<span className="text-skin">Rutina de hoy</span>}
          title={mode==="am"?"Mañana":"Noche"} accent="var(--skin)"
          action={<div role="tablist" aria-label="Rutina diaria" className="inline-flex rounded-full border border-hairline p-1">
            {(["am","pm"] as const).map(m=><button key={m} role="tab" type="button" aria-selected={mode===m}
              onClick={()=>setMode(m)}
              className={"flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold "+(mode===m?"bg-skin/20 text-foreground ring-1 ring-skin/50":"text-muted-foreground")}>
              {m==="am"?<Sun className="h-3.5 w-3.5"/>:<Moon className="h-3.5 w-3.5"/>}{m.toUpperCase()}
            </button>)}
          </div>}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <ProgressRing value={percent} size={110} stroke={6} color="var(--skin)">
              <div><div className="font-display text-3xl">{percent}%</div><div className="text-[0.6rem] tracking-widest text-muted-foreground">{mode.toUpperCase()}</div></div>
            </ProgressRing>
            <ol className="flex-1 space-y-2">
              {steps.map(([title,product],index)=>{
                const checked=completed.includes(index);
                return <li key={mode+"-"+index}>
                  <button type="button" aria-pressed={checked} disabled={routine.isPending}
                    onClick={()=>routine.mutate({session:mode,index})}
                    className={"flex min-h-16 w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left "+(checked?"border-skin/40 bg-skin/[0.08]":"border-hairline hover:border-skin/40")}>
                    <span className={"grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs "+(checked?"border-skin bg-skin text-ink":"border-input text-muted-foreground")}>{checked?<Check className="h-3.5 w-3.5"/>:index+1}</span>
                    <span className="min-w-0 flex-1"><span className={"block text-sm "+(checked?"text-muted-foreground line-through":"")}>{title}</span><span className="block break-words text-xs text-muted-foreground">{product}</span></span>
                  </button>
                </li>;
              })}
            </ol>
          </div>
          {state.data.barrierFirst&&<p className="mt-4 text-xs text-platinum/75">Fase de recuperación de barrera cutánea: los activos irritantes permanecen en pausa según tu planificación original.</p>}
          {routine.error&&<p role="alert" className="mt-3 text-sm text-gym">No se guardó el cambio: {errText(routine.error)}</p>}
          {routine.isPending&&<p role="status" className="mt-3 text-xs text-muted-foreground">Guardando en Supabase…</p>}
        </SectionCard>
        <div className="space-y-6">
          <SectionCard eyebrow="Constancia real" title="Últimos siete días" accent="var(--skin)">
            <ul className="space-y-3">
              {week.map(d=><li key={d.day} className="flex items-center gap-3 text-xs">
                <span className="w-12 shrink-0 uppercase text-muted-foreground">{d.display}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
                  <div className="h-full rounded-full bg-skin" style={{width:d.pct+"%"}}/>
                </div>
                <span className="w-12 text-right text-platinum/75">{d.done}/{d.total}</span>
              </li>)}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Se muestran únicamente pasos registrados en tu historial, sin porcentajes inventados.</p>
          </SectionCard>
          <SectionCard eyebrow="Notas privadas" title="Observaciones de hoy" accent="var(--skin)">
            <form onSubmit={e=>{e.preventDefault();saveNote.mutate();}} className="space-y-3">
              <label htmlFor="skin-note-real" className="text-xs text-muted-foreground">Cómo se encuentra tu piel</label>
              <textarea id="skin-note-real" value={note} onChange={e=>setNote(e.target.value)}
                maxLength={6000} rows={4} className="min-h-28 w-full rounded-xl border border-input bg-ink p-3 text-sm text-foreground"
                placeholder="Escribe una observación personal…"/>
              <button type="submit" disabled={saveNote.isPending||note===state.data.note} className="btn-gold">
                {saveNote.isPending?"Guardando…":"Guardar nota"}
              </button>
              {saveNote.error&&<p role="alert" className="text-xs text-gym">{errText(saveNote.error)}</p>}
            </form>
          </SectionCard>
        </div>
      </div>
      <SectionCard eyebrow="Tu inventario" title="Productos ya identificados" accent="var(--skin)">
        {PRODUCTS.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.slice(0,showAll?PRODUCTS.length:6).map(([name,kind,precaution],i)=>{
            const status=state.data.inventory["p"+i]||"unknown";
            return <article key={name} className="rounded-2xl border border-hairline bg-raised p-4">
              <h3 className="break-words text-sm font-medium">{name}</h3>
              <p className="mt-2 text-xs text-skin">{kind} · {STATUS[status]||"Sin confirmar"}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{precaution}</p>
            </article>;
          })}
        </div>:<EmptyState title="Sin productos" text="Todavía no hay productos catalogados."/>}
        {PRODUCTS.length>6&&<button type="button" className="btn-ghost mt-5" onClick={()=>setShowAll(x=>!x)}>{showAll?"Mostrar menos":"Ver todos los productos"} ({PRODUCTS.length})</button>}
        <p className="mt-3 text-xs text-muted-foreground">El inventario se muestra en modo consulta. Se conservarán los estados registrados antes de habilitar su edición en React.</p>
      </SectionCard>
    </>}
  </div>;
}
