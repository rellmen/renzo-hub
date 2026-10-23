import {createFileRoute} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState} from "react";
import {Pause,Play,RefreshCw,RotateCcw,Timer,Dumbbell,Plus,Minus,TrendingUp,Trophy} from "lucide-react";
import img from "@/assets/gym.jpg";
import {pageHead} from "@/lib/seo";
import {PageHero} from "@/components/rise/PageHero";
import {SectionCard,EmptyState} from "@/components/rise/primitives";
import {ProgressRing} from "@/components/rise/ProgressRing";
import {fmt,useCountdown} from "@/components/rise/FocusTimer";
import {useAuth} from "@/lib/auth/AuthProvider";
import {loadGymRecords,workoutVolume,workoutSetCount,type GymSet} from "@/lib/gym-records.mjs";
import {startGymDraft,saveGymDraft,type GymDraftSet} from "@/lib/gym-session-actions.mjs";
import {GymProgressPhotos} from "@/components/rise/GymProgressPhotos";
import {bestE1rm,isRecord,lastSets,sessionSummary,suggestSets} from "@/lib/legacy-gym/progression.js";

export const Route=createFileRoute("/gym")({
  head:()=>pageHead("Gym","Tus entrenamientos reales y tu plan privado, conservando el historial de RISE HUB."),
  component:Gym
});
function number(n:number){return new Intl.NumberFormat("es-ES",{maximumFractionDigits:1}).format(n);}
function errorText(e:unknown){return e instanceof Error?e.message:"No se pudo cargar el historial.";}
function Gym(){
  const {client,user}=useAuth();
  const rest=useCountdown(90);
  const qc=useQueryClient();
  const [chosenDay,setChosenDay]=useState(0);
  const [editor,setEditor]=useState<GymDraftSet[][]>([]);
  const key=["gym-records",user?.id];
  const records=useQuery({
    queryKey:key,enabled:!!client&&!!user?.id,
    queryFn:()=>loadGymRecords(client!,user!.id),staleTime:15000,refetchOnWindowFocus:true
  });
  const d=records.data;
  const current=d?.current;
  const sourceStamp=current?JSON.stringify(current.exercises):"";
  useEffect(()=>{
    setEditor(current?(current.exercises||[]).map(e=>(e.sets||[]).map(x=>({
      completed:!!x.completed,weight:x.weight??null,reps:x.reps??null,
      rir:x.rir??null
    }))):[]);
  },[current?.id,sourceStamp]);
  const start=useMutation({
    mutationFn:()=>startGymDraft(client!,user!.id,d?.plan||[],chosenDay),
    onSuccess:()=>qc.invalidateQueries({queryKey:key}),
  });
  const save=useMutation({
    mutationFn:({finish}:{finish:boolean})=>{
      if(!current)throw Error("No hay sesión abierta.");
      return saveGymDraft(client!,user!.id,current,editor,{finish});
    },
    onSuccess:()=>qc.invalidateQueries({queryKey:key}),
  });
  function editSet(i:number,j:number,field:keyof GymDraftSet,value:unknown){
    setEditor(list=>list.map((sets,ix)=>ix===i?
      sets.map((old,jx)=>jx===j?{...old,[field]:value}:old):sets));
  }
  function addSet(i:number){setEditor(list=>list.map((sets,ix)=>ix===i&&sets.length<20?[...sets,{completed:false,weight:sets.at(-1)?.weight??null,reps:null,rir:null}]:sets));}
  function removeSet(i:number){setEditor(list=>list.map((sets,ix)=>ix===i&&sets.length>1&&!sets.at(-1)?.completed?sets.slice(0,-1):sets));}
  function applySuggestion(i:number,target:{weight:number;reps:number;rir:number}[]){
    setEditor(list=>list.map((sets,ix)=>ix!==i?sets:sets.map((old,j):GymDraftSet=>{const t=target[Math.min(j,target.length-1)];return old.completed||!t?old:{...old,weight:t.weight,reps:t.reps,rir:t.rir};})));
  }
  const history=d?.sessions||[];
  const summary=d?.lastCompleted?sessionSummary(d.lastCompleted,history):null;
  const recent=d?.completed.slice(0,8)||[];
  return <div className="space-y-6">
    <PageHero image={img} eyebrow="GYM · REGISTROS PRIVADOS"
      title="Más fuerte cada día."
      subtitle="Entrenamientos y progreso registrados en tu cuenta real, sin repeticiones ni cargas inventadas."
      color="var(--gym)" priority />
    {records.error&&<p role="alert" className="surface border border-gym/40 p-5 text-sm text-gym">{errorText(records.error)}. No se muestran datos simulados.</p>}
    {records.isLoading&&<p role="status" className="surface p-6">Cargando tu historial de entrenamiento…</p>}
    {d&&<>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Sesiones reales guardadas en Supabase. Una sesión activa a la vez.</p>
        <button type="button" className="btn-ghost" onClick={()=>void records.refetch()} disabled={records.isFetching}>
          <RefreshCw className={"h-4 w-4 "+(records.isFetching?"animate-spin":"")}/>Actualizar
        </button>
      </div>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Estadísticas reales de entrenamiento">
        {[
          {label:"Sesiones completadas",value:String(d.completedCount)},
          {label:"Sesiones esta semana",value:String(d.weekCount)},
          {label:"Volumen histórico registrado",value:number(d.totalVolume)+" kg"},
          {label:"Plan guardado",value:d.plan.length?String(d.plan.length)+" días":"Sin registrar"}
        ].map(k=><div key={k.label} className="surface rim p-4">
          <p className="text-xs text-muted-foreground">{k.label}</p>
          <p className="mt-3 font-display text-3xl text-foreground">{k.value}</p>
        </div>)}
      </section>
      <SectionCard eyebrow="Registro de entrenamiento" title={current?"Tu sesión en curso":"Iniciar una sesión real"} accent="var(--gym)">
        {!current&&d.plan.length>0&&<div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-2 text-sm">Día de tu plan
            <select className="min-h-12 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground"
              value={chosenDay} onChange={e=>setChosenDay(Number(e.target.value))}>
              {d.plan.map((day,i)=><option key={i} value={i}>Día {i+1} · {day[0]}</option>)}
            </select>
          </label>
          <button type="button" disabled={start.isPending} className="btn-gold"
            onClick={()=>start.mutate()}>{start.isPending?"Iniciando…":"Iniciar entrenamiento"}</button>
        </div>}
        {!current&&!d.plan.length&&<p className="text-sm text-muted-foreground">Primero guarda una rutina desde la aplicación Gym existente. Aquí se utilizará el plan real, sin ejercicios de demostración.</p>}
        {current&&<div className="space-y-5">
          <p className="text-sm text-platinum/80">
            Marca únicamente las series realizadas. Una serie completada necesita peso, repeticiones y RIR. Las sugerencias de progresión son orientativas (doble progresión con RIR del sistema original). Usa «Guardar borrador» antes de salir.
          </p>
          <div className="space-y-4">
            {(current.exercises||[]).map((ex,i)=><fieldset key={i} className="rounded-2xl border border-hairline bg-raised p-4">
              <legend className="px-1 text-sm font-semibold">{ex.name}</legend>
              {(()=>{const prev=lastSets(history,ex.name,current.id);const tip=suggestSets(ex,prev);return <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                <p>{prev?`Última vez (${prev.date}): `+prev.sets.map(x=>x.weight+"×"+x.reps).join(" · "):"Sin historial: esta sesión fija la referencia."}</p>
                {tip&&<p className="flex flex-wrap items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-gym"/>{tip.reason}: {tip.sets.map(x=>x.weight+" kg × "+x.reps).join(" · ")}
                  <button type="button" className="btn-ghost min-h-8 px-2 text-[11px]" disabled={save.isPending} onClick={()=>applySuggestion(i,tip.sets)}>Aplicar a series pendientes</button></p>}
              </div>;})()}
              <div className="mt-2 space-y-3">
                {(editor[i]||ex.sets||[]).map((set,j)=>{
                  const value=editor[i]?.[j]??set;
                  const pr=value.completed&&isRecord(value,bestE1rm(history,ex.name,current.id));
                  return <div key={j} className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] items-end gap-2">
                    <label className="flex min-h-12 items-center gap-1.5 text-xs">
                      <input type="checkbox" className="h-5 w-5 accent-[var(--gym)]"
                        checked={!!value.completed} disabled={save.isPending}
                        onChange={e=>editSet(i,j,"completed",e.target.checked)}/>
                      <span className="sr-only">Serie {j+1} completada</span>
                      <span aria-hidden="true">{j+1}</span>{pr&&<Trophy className="h-3.5 w-3.5 text-gold" aria-label="Récord personal"/>}
                    </label>
                    {(["weight","reps","rir"] as const).map((field)=><label key={field} className="min-w-0 space-y-1 text-[11px] text-muted-foreground">
                      <span>{field==="weight"?"kg":field==="reps"?"Reps":"RIR"}</span>
                      <input type="number" inputMode="decimal"
                        min={field==="weight"?0:field==="reps"?1:0}
                        max={field==="weight"?1000:field==="reps"?500:10}
                        step={field==="weight"?0.5:1}
                        aria-label={ex.name+" serie "+(j+1)+" "+field}
                        value={value[field]??""}
                        disabled={save.isPending}
                        onChange={e=>editSet(i,j,field,e.target.value===""?null:Number(e.target.value))}
                        className="min-h-11 w-full min-w-0 rounded-xl border border-input bg-obsidian px-2 text-center text-sm text-foreground"/>
                    </label>)}
                  </div>;
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-ghost min-h-9 px-3 text-xs" disabled={save.isPending||(editor[i]?.length||0)>=20} onClick={()=>addSet(i)}><Plus className="h-3.5 w-3.5"/>Serie</button>
                <button type="button" className="btn-ghost min-h-9 px-3 text-xs" disabled={save.isPending||(editor[i]?.length||0)<=1||!!editor[i]?.at(-1)?.completed} onClick={()=>removeSet(i)}><Minus className="h-3.5 w-3.5"/>Quitar última</button>
                {ex.rest&&<span className="self-center text-[11px] text-muted-foreground">Descanso del plan: {String(ex.rest)}</span>}
              </div>
            </fieldset>)}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={save.isPending} className="btn-ghost"
              onClick={()=>save.mutate({finish:false})}>{save.isPending?"Guardando…":"Guardar borrador"}</button>
            <button type="button" disabled={save.isPending} className="btn-gold"
              onClick={()=>save.mutate({finish:true})}>Finalizar entrenamiento</button>
          </div>
          <p className="text-xs text-muted-foreground">Revisa la sesión antes de finalizar. El guardado usa una comprobación atómica cuando está instalada en este entorno; hasta confirmarlo, no edites la misma sesión a la vez en dos dispositivos.</p>
        </div>}
        {(start.error||save.error)&&<p role="alert" className="mt-4 rounded-xl border border-gym/50 p-3 text-sm text-gym">
          {errorText(start.error||save.error)}. Recarga si la sesión se ha editado en otro dispositivo.
        </p>}
      </SectionCard>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard eyebrow={<span className="text-gym">Sesión real</span>} title={d.current?"Entrenamiento en curso":"Último entrenamiento terminado"} accent="var(--gym)">
          {!(d.current||d.lastCompleted)&&<EmptyState icon={<Dumbbell className="h-5 w-5"/>} title="Sin entrenamientos registrados" text="Tu primera sesión aparecerá al guardarla en RISE HUB."/>}
          {(d.current||d.lastCompleted)&&(()=>{
            const s=d.current||d.lastCompleted!;
            const exercises=Array.isArray(s.exercises)?s.exercises:[];
            const totalSets=exercises.reduce((n,e)=>n+(Array.isArray(e.sets)?e.sets.length:0),0);
            const completed=workoutSetCount(s);
            const pct=totalSets?Math.round(completed/totalSets*100):0;
            return <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                <ProgressRing value={pct} size={85} stroke={6} color="var(--gym)"/>
                <div><p className="font-display text-2xl">{s.title||"Sesión de entrenamiento"}</p>
                  <p className="text-xs text-muted-foreground">{s.workout_date} · {completed}/{totalSets} series registradas</p>
                  <p className="mt-1 text-xs text-gym">{s.completed_at?"Completada":"En curso"}</p></div>
              </div>
              <ul className="space-y-3">
                {exercises.map((e,i)=><li key={i} className="rounded-xl border border-hairline bg-raised p-4">
                  <h3 className="text-sm font-semibold">{e.name||"Ejercicio"}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{e.muscle||"Musculatura no indicada"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(e.sets||[]).map((set,j)=><span key={j}
                      className={"rounded-lg border px-2.5 py-1.5 text-xs "+(set.completed?"border-gym/40 bg-gym/10 text-foreground":"border-hairline text-muted-foreground")}>
                      {j+1}: {set.weight??"—"} kg × {set.reps??"—"}{set.completed?" ✓":""}
                    </span>)}
                  </div>
                </li>)}
              </ul>
              {!d.current&&summary&&summary.records.length>0&&<p className="flex flex-wrap items-center gap-2 text-xs text-gold"><Trophy className="h-4 w-4"/>Récords: {summary.records.map(r=>r.name+" "+number(r.before)+" → "+number(r.after)+" kg e1RM").join(" · ")}</p>}
              <p className="text-right text-sm text-muted-foreground">
                Volumen confirmado: <span className="text-foreground">{number(workoutVolume(s))} kg</span>
              </p>
            </div>;
          })()}
        </SectionCard>
        <SectionCard eyebrow="Descanso" title="Temporizador" accent="var(--gym)">
          <div className="flex flex-col items-center gap-4 py-5">
            <ProgressRing value={Math.round((90-rest.left)/90*100)} size={144} stroke={6} color="var(--gym)">
              <div><Timer className="mx-auto mb-2 h-4 w-4 text-gym"/>
                <div className="font-display text-4xl tabular-nums" aria-live="polite">{fmt(rest.left)}</div></div>
            </ProgressRing>
            <div className="flex gap-3">
              <button type="button" className="btn-gold" onClick={rest.toggle}>
                {rest.running?<Pause className="h-4 w-4"/>:<Play className="h-4 w-4"/>}
                {rest.running?"Pausar":"Iniciar"}
              </button>
              <button type="button" className="btn-ghost" onClick={rest.reset}>
                <RotateCcw className="h-4 w-4"/>Reiniciar
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">Temporizador local; no modifica ninguna sesión.</p>
        </SectionCard>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Programa de entrenamiento" title="Tu plan almacenado" accent="var(--gym)">
          {d.plan.length===0&&<EmptyState icon={<Dumbbell className="h-5 w-5"/>}
            title="Sin plan guardado" text="El plan existente aparecerá cuando esté disponible en Gym."/>}
          {d.plan.length>0&&<ul className="space-y-3">
            {d.plan.map((day,i)=><li key={i} className="rounded-xl border border-hairline bg-raised p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gym">Día {i+1}</p>
              <h3 className="mt-2 text-sm font-semibold">{day[0]}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{Array.isArray(day[2])?day[2].length:0} ejercicios · Cardio {day[1]||"no definido"}</p>
            </li>)}
          </ul>}
          <p className="mt-4 text-xs text-muted-foreground">Puedes iniciar y guardar sesiones desde esta versión React. La edición avanzada del plan y la sincronización simultánea entre dispositivos siguen pendientes de validación.</p>
        </SectionCard>
        <SectionCard eyebrow="Historial" title="Sesiones recientes" accent="var(--gym)">
          {recent.length===0&&<p className="text-sm text-muted-foreground">No existen sesiones completadas en los registros consultados.</p>}
          <ol className="divide-y divide-hairline">
            {recent.map(s=><li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0"><p className="truncate font-medium">{s.title||"Entrenamiento"}</p><p className="text-xs text-muted-foreground">{s.workout_date}</p></div>
              <span className="shrink-0 text-xs text-platinum/75">{number(workoutVolume(s))} kg</span>
            </li>)}
          </ol>
        </SectionCard>
      </div>
      <GymProgressPhotos/>
    </>}
  </div>;
}
