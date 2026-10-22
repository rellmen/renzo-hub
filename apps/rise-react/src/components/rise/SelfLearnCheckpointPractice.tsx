import {useSelfLearnCapabilities} from '@/lib/use-selflearn-capabilities';
import {useEffect,useState,type FormEvent} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {BookOpen,Check,Headphones,RotateCcw,ShieldCheck,Volume2} from "lucide-react";
import type {SupabaseClient} from "@supabase/supabase-js";
import {appendStudyCheckpoint,recentLearningCheckpoints,newestStudyRun,type LearningRun} from "@/lib/selflearn-checkpoints.mjs";
import {makePractice,practicePrompt,gradePractice,type PracticeStep} from "@/lib/selflearn-practice.mjs";
import {finalizeOfficialLesson} from "@/lib/selflearn-finalization.mjs";
import {officialSelfLearnAwardsEnabled} from "@/lib/nocturne-environment.mjs";

type Course="nl"|"en";
type Active={id:string;sessionId:string;run:LearningRun};
type Props={client:SupabaseClient|null;uid:string;course:Course;legacyActive:boolean;nextUnitId:string|null};
const errorMessage=(e:unknown)=>e instanceof Error?e.message:"No se pudo confirmar tu progreso.";
const CHOICE=new Set(["choice","listen","gap","dialogue"]);
const PASSIVE=new Set(["learn","grammar","speak"]);
function AudioButton({text,course}:{text:string;course:Course}){
 const speak=()=>{
  if(!("speechSynthesis" in window))return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=course==="nl"?"nl-NL":"en-US";utterance.rate=0.85;
  window.speechSynthesis.speak(utterance);
 };
 return <button type="button" className="btn-ghost min-h-11" disabled={!text}
  onClick={speak}><Volume2 className="h-4 w-4"/> Escuchar</button>;
}
function StepEditor({step,course,value,setValue,match,setMatch}:{step:PracticeStep;course:Course;
 value:string;setValue:(s:string)=>void;match:string[];setMatch:(next:string[])=>void}){
 const kind=step.type;
 if(kind==="learn")return <div className="space-y-3">
   <p className="font-display text-3xl text-gold-gradient">{step.target}</p>
   <p className="text-sm text-platinum/80">{step.es}</p>
   {step.example&&<p className="rounded-xl border border-hairline p-3 text-sm">{step.example.t} · {step.example.es}</p>}
   <AudioButton text={step.target||""} course={course}/>
 </div>;
 if(kind==="grammar")return <div className="space-y-3">
   <p className="font-display text-2xl">{step.title}</p>
   <p className="whitespace-pre-wrap text-sm leading-relaxed text-platinum/85">{step.text}</p>
   {step.example&&<p className="rounded-xl border border-hairline p-3 text-sm">{step.example.t} · {step.example.es}</p>}
 </div>;
 if(kind==="speak")return <div className="space-y-3">
   <p className="font-display text-2xl">{step.t}</p>
   <p className="text-sm text-muted-foreground">{step.es}</p>
   <AudioButton text={step.t||""} course={course}/>
   <p className="text-xs text-muted-foreground">Repite la frase en voz alta. Esta práctica no evalúa la pronunciación.</p>
 </div>;
 if(kind==="match"){
   const right=(step.rights||step.pairs?.map(p=>p[1])||[]).map(String);
   return <div className="space-y-3">
     <p className="text-sm text-platinum/80">Elige el significado de cada expresión.</p>
     {(step.pairs||[]).map((pair,i)=><label key={i} className="flex flex-col gap-2 rounded-xl border border-hairline p-3 sm:flex-row sm:items-center">
       <span className="flex-1 text-sm font-semibold">{pair[0]}</span>
       <select aria-label={"Significado de "+pair[0]} className="min-h-11 rounded-lg border border-input bg-obsidian px-3 text-sm text-foreground"
         value={match[i]||""} onChange={e=>setMatch((step.pairs||[]).map((_,j)=>j===i?e.target.value:match[j]||""))}>
         <option value="">Selecciona una opción</option>
         {right.map((r,j)=><option key={j} value={r}>{r}</option>)}
       </select>
     </label>)}
   </div>;
 }
 return <div className="space-y-3">
   {step.prompt&&<p className="text-sm leading-relaxed text-platinum/85">{step.prompt}</p>}
   {step.sentence&&<p className="rounded-xl border border-hairline p-4 font-display text-xl">{step.sentence}</p>}
   {kind==="build"&&<p className="text-sm text-platinum/75">{step.es}</p>}
   {kind==="dialogue"&&<div className="space-y-1">{(step.lines||[]).map((line,i)=>
     <p key={i} className="text-xs text-muted-foreground">{line.who}: {i===(step.lines?.length||1)-1?"________":line.t}</p>)}</div>}
   {kind==="listen"&&<><AudioButton text={step.audio||""} course={course}/>
     <p className="text-xs text-muted-foreground">Escucha y elige el significado. Si no tienes audio disponible, puedes usar el reproductor clásico.</p></>}
   {CHOICE.has(kind)?<div className="grid gap-2 sm:grid-cols-2">
     {(step.options||[]).map((option,i)=><button type="button" key={i} aria-pressed={value===option}
       className={"min-h-12 rounded-xl border px-4 text-left text-sm "+(value===option?"border-learn bg-learn/15 text-foreground":"border-hairline bg-raised text-platinum/85")}
       onClick={()=>setValue(option)}>{option}</button>)}
   </div>:<label className="block space-y-2 text-xs text-muted-foreground">
     {kind==="build"?"Construye la frase escribiendo las palabras en orden":"Tu respuesta"}
     <input type="text" autoComplete="off" maxLength={350} value={value} onChange={e=>setValue(e.target.value)}
       className="min-h-12 w-full rounded-xl border border-input bg-obsidian px-4 text-sm text-foreground"
       placeholder={kind==="type"?step.hint||"Escribe la respuesta":"Escribe la frase completa"}/>
     {kind==="build"&&<span>Palabras disponibles: {(step.tiles||[]).join(" · ")}</span>}
   </label>}
 </div>;
}
export function SelfLearnCheckpointPractice({client,uid,course,legacyActive,nextUnitId}:Props){
 const qc=useQueryClient();
 const [active,setActive]=useState<Active|null>(null);
 const [selection,setSelection]=useState("");
 const [matching,setMatching]=useState<string[]>([]);
 const [feedback,setFeedback]=useState("");
 const [minutes,setMinutes]=useState<5|10|20>(5);
 // Disabled by default: enable only for a controlled authenticated staging QA.
 // Never enable the switch in a public production bundle without server-side
 // cross-client idempotency/RLS verification of all awards.
 const backendReady=useSelfLearnCapabilities(client,uid);
 const allowOfficialAward=officialSelfLearnAwardsEnabled(import.meta.env["VITE_ENABLE_SELFLEARN_AWARDS"]==="true",{
   hostname:typeof window==="undefined"?"":window.location.hostname,
   backendReady,releaseTarget:import.meta.env['VITE_NOCTURNE_RELEASE_TARGET']||""
 });
 const key=["selflearn-checkpoints",uid];
 const query=useQuery({queryKey:key,enabled:!!client&&!!uid,
  queryFn:()=>recentLearningCheckpoints(client!,uid),staleTime:5000,refetchOnWindowFocus:true});
 useEffect(()=>{setActive(null);setSelection("");setMatching([]);setFeedback("");},[uid,course]);
 const latest=query.data?newestStudyRun(query.data,course):null;
 const start=useMutation({
  mutationFn:async()=>{
   if(!client||!uid||!nextUnitId)throw Error("No hay una unidad disponible.");
   if(legacyActive)throw Error("Tienes una sesión clásica abierta. Continúala allí para no duplicar progreso.");
   if(latest&&!practicePrompt(latest.run).complete)throw Error("Hay una práctica pendiente: reanúdala antes de crear otra.");
   const run=makePractice(course,nextUnitId,{minutes});
   const sessionId=crypto.randomUUID();
   const saved=await appendStudyCheckpoint(client,uid,run,sessionId);
   return {id:saved.id,sessionId,run};
  },
  onSuccess:async session=>{setActive(session);setFeedback("Primera copia del progreso guardada.");await qc.invalidateQueries({queryKey:key});}
 });
 const save=useMutation({
   mutationFn:async()=>{
    if(!active||!client)throw Error("La sesión no está abierta.");
    const evaluation=gradePractice(active.run,practicePrompt(active.run).step?.type==="match"?matching:selection);
    const row=await appendStudyCheckpoint(client,uid,evaluation.run,active.sessionId,{previousId:active.id});
    return {session:{id:row.id,sessionId:active.sessionId,run:evaluation.run},evaluation};
   },
   onSuccess:async({session,evaluation})=>{
     setActive(session);setSelection("");setMatching([]);
     setFeedback(evaluation.complete
       ?(allowOfficialAward?"Práctica guardada. Puedes solicitar la acreditación de XP en pruebas; el servidor debe confirmarla.":"Práctica guardada. La acreditación de la lección, XP y FSRS siguen en el reproductor clásico.")
       :evaluation.correct?"Respuesta registrada y guardada correctamente."
         :"Respuesta guardada. Se repetirá cuando corresponda. Corrección: "+String(evaluation.expected||""));
     await qc.invalidateQueries({queryKey:key});
   }
 });
 const award=useMutation({
   mutationFn:async()=>{
     if(!allowOfficialAward||!client||!active)throw Error("La acreditación oficial está desactivada.");
     return finalizeOfficialLesson(client,uid,active,{legacyActive});
   },
   onSuccess:async result=>{
     setFeedback(result.already?"La unidad ya estaba acreditada: no se duplicó el XP.":
       "Lección oficial guardada: "+result.xp+" XP y "+result.addedCards+" tarjetas nuevas.");
     await Promise.all([
       qc.invalidateQueries({queryKey:key}),
       qc.invalidateQueries({queryKey:["selflearn-snapshot",uid]})
     ]);
   }
 });
 useEffect(()=>{award.reset();},[active?.sessionId]);
 const run=active?.run;
 const view=run?practicePrompt(run):null;
 const step=view?.step;
 const canAnswer=!!step&&(PASSIVE.has(step.type)||(step.type==="match"?
   (step.pairs||[]).length>0&&(step.pairs||[]).every((_,i)=>!!matching[i]):selection.trim().length>0));
 function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(canAnswer&&!save.isPending)save.mutate();}
 return <SectionWrapper>
  {query.isLoading&&<p role="status" className="text-sm text-muted-foreground">Buscando prácticas anteriores…</p>}
  {query.error&&<p role="alert" className="text-sm text-gym">{errorMessage(query.error)}</p>}
  {!run&&query.data&&<div className="space-y-4">
    {latest&&<div className="rounded-xl border border-learn/30 bg-learn/[0.06] p-4">
      <p className="text-sm">Última práctica de {course.toUpperCase()}: {Math.round(practicePrompt(latest.run).progress)}% guardado</p>
      <p className="mt-2 text-xs text-muted-foreground">{allowOfficialAward?"El progreso se guarda como checkpoints privados. En staging, la acreditación experimental requiere una confirmación posterior de Supabase.":"El progreso se guarda como checkpoints privados; la acreditación de lecciones continúa en SelfLearn clásico."}</p>
      {(!practicePrompt(latest.run).complete||allowOfficialAward)&&<button type="button" className="btn-gold mt-3"
        onClick={()=>{setActive({id:latest.id,sessionId:latest.sessionId,run:latest.run});setFeedback("");}}>
        <RotateCcw className="h-4 w-4"/> {practicePrompt(latest.run).complete?"Recuperar práctica terminada":"Reanudar práctica guardada"}
      </button>}
    </div>}
    {legacyActive&&<p className="rounded-xl border border-gold/30 bg-gold/[0.06] p-4 text-sm">
      Existe una lección iniciada en SelfLearn clásico. Termínala allí antes de empezar otra sesión para evitar resultados duplicados.
    </p>}
    <div className="flex flex-wrap items-end gap-3">
      <label className="space-y-1 text-xs text-muted-foreground">Duración de práctica
        <select className="block min-h-11 rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground"
          value={minutes} onChange={e=>setMinutes(Number(e.target.value) as 5|10|20)}>
          <option value={5}>5 minutos</option><option value={10}>10 minutos</option><option value={20}>20 minutos</option>
        </select>
      </label>
      <button type="button" className="btn-gold min-h-11"
        disabled={!nextUnitId||!!query.error||query.isFetching||start.isPending||legacyActive||!!(latest&&!practicePrompt(latest.run).complete)}
        onClick={()=>start.mutate()}><BookOpen className="h-4 w-4"/> {start.isPending?"Guardando…":"Iniciar práctica"}</button>
    </div>
    <p className="text-xs text-muted-foreground">{allowOfficialAward?"Guardar checkpoints no otorga XP. Tras completar la lección puedes solicitar la acreditación experimental y comprobar su confirmación remota.":"Este reproductor es una práctica de la unidad original. No otorga XP ni cambia el estado oficial de completado hasta terminar la integración de FSRS."}</p>
  </div>}
  {run&&<div className="space-y-4">
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>Lección {run.unitId} · Paso {Math.min(run.index+1,run.queue.length)} de {run.queue.length}</span>
      <span>{view?.progress??0}% registrado</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-foreground/10"><div className="h-full bg-learn transition-all"
      style={{width:(view?.progress??0)+"%"}}/></div>
    {view?.complete?<div className="rounded-xl border border-learn/30 p-5">
      <Check className="mb-3 h-7 w-7 text-learn"/>
      <h3 className="font-display text-2xl">Práctica terminada y guardada</h3>
      <p className="mt-2 text-sm">Resultado de práctica: {view.score?.correct}/{view.score?.total} respuestas correctas a la primera.</p>
      {allowOfficialAward?<div className="mt-4 space-y-2">
        <button type="button" className="btn-gold"
          disabled={award.isPending||award.isSuccess||legacyActive||query.isFetching}
          onClick={()=>award.mutate()}>
          {award.isPending?"Comprobando y guardando…":award.isSuccess?"Lección acreditada":"Acreditar lección y XP"}
        </button>
        <p className="text-xs text-muted-foreground">Función experimental de QA. La lección se acredita únicamente tras confirmar los registros de Supabase.</p>
      </div>:<p className="mt-3 text-xs text-muted-foreground">
        Aún no es una lección acreditada: XP y tarjetas oficiales permanecen en SelfLearn clásico hasta verificar el cierre con dos dispositivos.
      </p>}
      <button type="button" className="btn-ghost mt-4" onClick={()=>{setActive(null);setFeedback("");}}>Volver al catálogo</button>
    </div>:step&&<form onSubmit={submit} className="space-y-4">
      <div className="rounded-xl border border-hairline bg-raised p-4">
        <p className="eyebrow mb-3 text-learn">{step.type==="learn"?"Nueva palabra":step.type==="grammar"?"Gramática":step.type==="speak"?"Practica pronunciación":"Ejercicio original"}</p>
        <StepEditor key={step.id+"-"+run.index} step={step} course={course}
          value={selection} setValue={setSelection} match={matching} setMatch={setMatching}/>
      </div>
      <button type="submit" className="btn-gold min-h-12" disabled={save.isPending||!canAnswer}>
        {save.isPending?"Guardando respuesta…":PASSIVE.has(step.type)?"Continuar y guardar":"Comprobar y guardar"}
      </button>
      <p className="text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline h-3.5 w-3.5"/> No avanza al siguiente paso hasta que Supabase confirma el guardado.</p>
    </form>}
  </div>}
  {feedback&&<p role="status" className="rounded-xl border border-learn/25 p-3 text-sm text-platinum/85">{feedback}</p>}
  {(start.error||save.error||award.error)&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">
    {errorMessage(start.error||save.error||award.error)}. No se ha avanzado sin confirmación; puedes volver a intentarlo.
  </p>}
 </SectionWrapper>;
}
function SectionWrapper({children}:{children:React.ReactNode}){
 return <section className="surface rim space-y-5 p-5 sm:p-6">
   <div><p className="eyebrow text-learn">Prácticas recuperables · prueba</p>
     <h2 className="mt-2 font-display text-2xl">Entrena y conserva cada paso</h2>
     <p className="mt-2 text-sm text-muted-foreground">Ejercicios del motor original, con guardado remoto tras cada respuesta. Tu progreso acreditado no se altera.</p>
   </div>{children}
 </section>;
}
