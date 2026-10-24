import {useMemo,useState} from "react";
import type {SupabaseClient} from "@supabase/supabase-js";
import {Check,HelpCircle,Loader2,X} from "lucide-react";
import {InlineMd} from "./AcademyMarkdown";
import type {PublicQuestion} from "@/lib/academy/content";
import {bandFor,newId} from "@/lib/academy/engine.mjs";
import {finishQuiz,gradeAnswer,type FinishResult,type GradeResult} from "@/lib/academy/records.mjs";

type Mode="exit"|"review"|"practice"|"diagnostic";
type Answer={choice?:string|undefined;value?:string|undefined;text?:string|undefined;dont_know?:boolean|undefined};
const MODE_LABEL:Record<Mode,string>={exit:"Evaluación de salida",review:"Repaso espaciado",practice:"Práctica",diagnostic:"Diagnóstico"};

/** Preguntas corregidas en servidor. Cada pregunta conserva su id de intento: reenviar tras un fallo de red no duplica. */
export function AcademyQuiz({client,questions,mode,lessonId,sessionId:givenSession,onFinished,onAttempt}:{
  client:SupabaseClient|null;questions:PublicQuestion[];mode:Mode;lessonId?:string;sessionId?:string;
  onFinished?:(r:FinishResult)=>void;onAttempt?:()=>void;
}){
  const sessionId=useMemo(()=>givenSession||newId(),[givenSession]);
  const attemptIds=useMemo(()=>Object.fromEntries(questions.map(q=>[q.id,newId()])),[questions,sessionId]);
  const [answers,setAnswers]=useState<Record<string,Answer>>({});
  const [results,setResults]=useState<Record<string,GradeResult>>({});
  const [busy,setBusy]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [hints,setHints]=useState<Record<string,boolean>>({});
  const [final,setFinal]=useState<FinishResult|null>(null);
  const gradable=questions.filter(q=>q.kind!=="essay");
  const answered=gradable.filter(q=>results[q.id]).length;
  const correct=gradable.filter(q=>results[q.id]?.is_correct).length;

  async function submit(q:PublicQuestion,dontKnow=false){
    if(!client){setError("Inicia sesión para guardar tus respuestas.");return;}
    const a=answers[q.id]||{};
    const payload:Answer=dontKnow?{dont_know:true}:q.kind==="multiple_choice"?{choice:a.choice}:q.kind==="numeric"?{value:a.value}:{text:a.text};
    if(!dontKnow&&!(payload.choice||payload.value?.trim()||payload.text?.trim())){setError("Escribe o elige una respuesta, o pulsa «No lo sé».");return;}
    setBusy(q.id);setError(null);
    try{
      const r=await gradeAnswer(client,{attemptId:attemptIds[q.id]!,questionId:q.id,answer:payload as Record<string,unknown>,context:mode,sessionId:mode==="exit"||mode==="review"?sessionId:null});
      setResults(x=>({...x,[q.id]:r}));onAttempt?.();
    }catch(e){setError(e instanceof Error?e.message:"No se pudo corregir. Tu respuesta sigue aquí: vuelve a enviarla.");}
    finally{setBusy(null);}
  }
  async function close(){
    if(!client||!lessonId||(mode!=="exit"&&mode!=="review"))return;
    setBusy("finish");setError(null);
    try{const r=await finishQuiz(client,{lessonId,sessionId,context:mode});setFinal(r);onFinished?.(r);}
    catch(e){setError(e instanceof Error?e.message:"No se pudo cerrar la evaluación.");}
    finally{setBusy(null);}
  }
  if(!questions.length)return <p className="rounded-2xl border border-dashed border-hairline p-4 text-sm text-muted-foreground">Esta lección todavía no tiene preguntas evaluables en el servidor.</p>;
  return <div className="space-y-4 rounded-3xl border border-learn/30 bg-learn/[0.04] p-4 sm:p-5" aria-label={MODE_LABEL[mode]}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="eyebrow text-learn">{MODE_LABEL[mode]} · {answered}/{gradable.length} respondidas</p>
      {(mode==="exit"||mode==="review")&&<p className="text-xs text-muted-foreground">Cuenta tu primer intento de cada pregunta. ≥80 % = dominio provisional.</p>}
    </div>
    <ol className="space-y-4">
      {questions.map((q,idx)=>{
        const r=results[q.id];const a=answers[q.id]||{};const locked=!!r||busy===q.id;
        return <li key={q.id} className="rounded-2xl border border-hairline bg-ink/60 p-4">
          <div className="mb-3 flex items-start gap-2 text-[15px] text-foreground"><span className="font-semibold text-learn">{idx+1}.</span><div className="min-w-0 flex-1"><InlineMd text={q.prompt_md}/></div></div>
          {q.kind==="multiple_choice"&&<fieldset className="grid gap-2" disabled={locked}>
            <legend className="sr-only">Opciones</legend>
            {q.choices?.map(c=>{
              const chosen=a.choice===c.id;const isRight=r&&r.correct===c.id;const isWrong=r&&chosen&&!r.is_correct;
              return <label key={c.id} className={"flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm "+
                (isRight?"border-learn bg-learn/15":isWrong?"border-gym bg-gym/10":chosen?"border-learn/60 bg-learn/[0.08]":"border-hairline")}>
                <input type="radio" name={q.id} value={c.id} checked={chosen} className="h-4 w-4 accent-[var(--learn)]"
                  onChange={()=>setAnswers(x=>({...x,[q.id]:{choice:c.id}}))}/>
                <span className="min-w-0 flex-1"><InlineMd text={c.text}/></span>
              </label>;})}
          </fieldset>}
          {(q.kind==="numeric"||q.kind==="short_text")&&<label className="flex flex-wrap items-center gap-2 text-sm">
            <span className="sr-only">Tu respuesta</span>
            <input className="min-h-11 w-full max-w-xs rounded-xl border border-hairline bg-obsidian px-3 text-base text-foreground" disabled={locked}
              inputMode={q.kind==="numeric"?"decimal":"text"} autoComplete="off" autoCapitalize="off" spellCheck={q.kind!=="numeric"}
              value={q.kind==="numeric"?a.value||"":a.text||""} placeholder={q.kind==="numeric"?"Ej.: 12,5 o 3/4":"Tu respuesta"}
              onChange={e=>setAnswers(x=>({...x,[q.id]:q.kind==="numeric"?{value:e.target.value}:{text:e.target.value}}))}
              onKeyDown={e=>{if(e.key==="Enter"&&!locked)void submit(q);}}/>
            {q.unit&&<span className="text-muted-foreground">{q.unit}</span>}
          </label>}
          {q.hint_md&&!r&&<div className="mt-3">
            {hints[q.id]?<p className="rounded-xl border border-hairline bg-foreground/[0.03] p-3 text-sm"><InlineMd text={q.hint_md}/></p>
              :<button type="button" className="btn-ghost min-h-11 text-xs" onClick={()=>setHints(h=>({...h,[q.id]:true}))}><HelpCircle className="h-4 w-4"/> Pista</button>}
          </div>}
          {!r&&<div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn-gold min-h-11" disabled={locked} onClick={()=>void submit(q)}>
              {busy===q.id?<Loader2 className="h-4 w-4 animate-spin"/>:null} Comprobar
            </button>
            <button type="button" className="btn-ghost min-h-11" disabled={locked} onClick={()=>void submit(q,true)}>No lo sé</button>
          </div>}
          {r&&<div role="status" className={"mt-3 rounded-xl border p-3 text-sm "+(r.is_correct?"border-learn/50 bg-learn/10":"border-gym/40 bg-gym/[0.08]")}>
            <p className="mb-1 flex items-center gap-2 font-semibold text-foreground">{r.is_correct?<><Check className="h-4 w-4 text-learn"/> Correcto</>:<><X className="h-4 w-4 text-gym"/> Incorrecto{r.correct&&q.kind!=="multiple_choice"?<> · respuesta: <InlineMd text={r.correct}/>{q.unit?" "+q.unit:""}</>:null}</>}</p>
            {r.explanation_md&&<InlineMd text={r.explanation_md}/>}
            {r.duplicate&&<p className="mt-1 text-xs text-muted-foreground">Ya estaba registrada: se muestra el resultado guardado.</p>}
          </div>}
        </li>;})}
    </ol>
    {error&&<p role="alert" className="rounded-xl border border-gym/40 p-3 text-sm text-gym">{error}</p>}
    {(mode==="exit"||mode==="review")&&!final&&<div className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn-gold min-h-11" disabled={answered<gradable.length||busy==="finish"} onClick={()=>void close()}>
        {busy==="finish"?<Loader2 className="h-4 w-4 animate-spin"/>:null} Cerrar evaluación
      </button>
      <span className="text-xs text-muted-foreground">{answered<gradable.length?`Responde las ${gradable.length-answered} restantes para cerrar.`:`${correct}/${gradable.length} correctas: se calculará en el servidor.`}</span>
    </div>}
    {(mode==="practice"||mode==="diagnostic")&&answered>0&&<p className="text-sm text-muted-foreground">{correct}/{answered} correctas en esta tanda ({Math.round(correct/answered*100)} %). Se guarda por habilidad en Resultados.</p>}
    {final&&<div role="status" className="rounded-2xl border border-learn/50 bg-learn/10 p-4">
      <p className="font-display text-2xl text-foreground">{final.pct} % · {bandFor(final.pct)?.label}</p>
      <p className="mt-1 text-sm">{final.correct}/{final.total} correctas. Estado: {final.status==="mastered"?"dominada":final.status==="completed"?"completada":"en curso"}.
        {final.next_review?` Próximo repaso: ${new Date(final.next_review+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"long"})}.`:""}</p>
      {final.band==="rescate"&&<p className="mt-2 text-sm">Por debajo del 60 %: repasa los prerrequisitos y los ejemplos resueltos antes de reintentarlo.</p>}
      {final.band==="practica"&&<p className="mt-2 text-sm">Entre 60 y 79 %: rehaz el ejercicio guiado y la práctica, y vuelve a intentarlo otro día.</p>}
      {final.duplicate&&<p className="mt-1 text-xs text-muted-foreground">Esta evaluación ya estaba cerrada; resultado recuperado.</p>}
    </div>}
  </div>;
}
