import {createFileRoute} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {Pause,Play,RefreshCw,RotateCcw,Timer,Dumbbell} from "lucide-react";
import img from "@/assets/gym.jpg";
import {pageHead} from "@/lib/seo";
import {PageHero} from "@/components/rise/PageHero";
import {SectionCard,EmptyState} from "@/components/rise/primitives";
import {ProgressRing} from "@/components/rise/ProgressRing";
import {fmt,useCountdown} from "@/components/rise/FocusTimer";
import {useAuth} from "@/lib/auth/AuthProvider";
import {loadGymRecords,workoutVolume,workoutSetCount} from "@/lib/gym-records.mjs";

export const Route=createFileRoute("/gym")({
  head:()=>pageHead("Gym","Tus entrenamientos reales y tu plan privado, conservando el historial de RISE HUB."),
  component:Gym
});
function number(n:number){return new Intl.NumberFormat("es-ES",{maximumFractionDigits:1}).format(n);}
function errorText(e:unknown){return e instanceof Error?e.message:"No se pudo cargar el historial.";}
function Gym(){
  const {client,user}=useAuth();
  const rest=useCountdown(90);
  const records=useQuery({
    queryKey:["gym-records",user?.id],enabled:!!client&&!!user?.id,
    queryFn:()=>loadGymRecords(client!,user!.id),staleTime:15000,refetchOnWindowFocus:true
  });
  const d=records.data;
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
        <p className="text-xs text-muted-foreground">Historial de solo lectura · sesiones guardadas con tu cuenta.</p>
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
          <p className="mt-4 text-xs text-muted-foreground">Los controles de edición y registro de series se habilitarán tras verificar su sincronización y recuperación.</p>
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
    </>}
  </div>;
}
