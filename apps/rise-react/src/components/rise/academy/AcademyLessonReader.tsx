import {useCallback,useEffect,useRef,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import type {SupabaseClient} from "@supabase/supabase-js";
import {ArrowLeft,CheckCircle2,Clock,FileWarning,Loader2,RotateCcw,ShieldCheck} from "lucide-react";
import {AcademyMarkdown,InlineMd} from "./AcademyMarkdown";
import {AcademyQuiz} from "./AcademyQuiz";
import {loadLesson,lessonMeta} from "@/lib/academy/content";
import {newId,type ProgressRow,type ReviewRow} from "@/lib/academy/engine.mjs";
import {openLesson,recordEditorialReview,saveLessonDraft,type EditorialRow,type FinishResult} from "@/lib/academy/records.mjs";

const STATUS_LABEL:Record<string,string>={planned:"Planificada",draft:"Borrador",reviewed:"Revisada",ready:"Lista",published:"Publicada"};

export function AcademyLessonReader({client,uid,lessonId,progress,review,editorial,onBack,onChanged}:{
  client:SupabaseClient|null;uid:string;lessonId:string;progress:ProgressRow|undefined;review:ReviewRow|undefined;editorial:EditorialRow[];
  onBack:()=>void;onChanged:()=>void;
}){
  const lesson=useQuery({queryKey:["academy-lesson",lessonId],queryFn:()=>loadLesson(lessonId),staleTime:Infinity});
  const meta=lessonMeta(lessonId);
  const [row,setRow]=useState<ProgressRow|null>(progress||null);
  const [notes,setNotes]=useState<string>(typeof progress?.draft?.["notes"]==="string"?String(progress.draft["notes"]):"");
  const [saveState,setSaveState]=useState<"idle"|"saving"|"saved"|"error">("idle");
  const [saveError,setSaveError]=useState<string|null>(null);
  const [quizKey,setQuizKey]=useState(()=>newId());
  const [editorialNote,setEditorialNote]=useState("");
  const [editorialMsg,setEditorialMsg]=useState<string|null>(null);
  const rowRef=useRef(row);rowRef.current=row;
  const notesRef=useRef(notes);notesRef.current=notes;
  const dirty=useRef(false);
  const today=new Date();const todayIso=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const reviewDue=!!review&&review.due_on<=todayIso;
  const mode:"exit"|"review"=reviewDue?"review":"exit";

  // Abrir = "en curso". Nunca completa la lección.
  useEffect(()=>{
    if(!client||!uid||progress)return;
    let alive=true;
    openLesson(client,uid,lessonId).then(r=>{if(alive&&r){setRow(r);onChanged();}}).catch(()=>{});
    return()=>{alive=false;};
  },[client,uid,lessonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const save=useCallback(async(text:string)=>{
    const current=rowRef.current;
    if(!client||!uid||!current)return;
    setSaveState("saving");setSaveError(null);
    try{
      const next=await saveLessonDraft(client,uid,current,{draft:{...(current.draft||{}),notes:text.slice(0,20000)}});
      setRow(next);dirty.current=false;setSaveState("saved");
    }catch(e){setSaveState("error");setSaveError(e instanceof Error?e.message:"No se pudo guardar.");}
  },[client,uid]);

  // Autoguardado: 1,5 s después de dejar de escribir y al salir de la lección.
  useEffect(()=>{
    if(!dirty.current)return;
    const t=setTimeout(()=>{void save(notes);},1500);
    return()=>clearTimeout(t);
  },[notes,save]);
  useEffect(()=>()=>{if(dirty.current)void save(notesRef.current);},[save]);
  // El cierre de una evaluación incrementa la revisión en el servidor: adoptar la fila nueva si no hay cambios locales.
  useEffect(()=>{
    if(progress&&(!rowRef.current||progress.revision>rowRef.current.revision)&&!dirty.current)setRow(progress);
  },[progress]);

  async function editorialDecision(decision:"reviewed"|"changes_requested"){
    if(!client||!lesson.data)return;
    setEditorialMsg(null);
    try{
      await recordEditorialReview(client,uid,{lessonId,contentVersion:lesson.data.content_version,decision,comment:editorialNote});
      setEditorialMsg(decision==="reviewed"?"Revisión registrada. Para publicarla, el estado se cambia en el repositorio (PR) tras tu aprobación.":"Cambios solicitados registrados.");
      setEditorialNote("");onChanged();
    }catch(e){setEditorialMsg(e instanceof Error?e.message:"No se pudo registrar.");}
  }

  if(lesson.isLoading)return <p role="status" className="surface p-5">Cargando lección…</p>;
  if(!lesson.data)return <div className="surface p-5"><p>Esta lección todavía no tiene contenido redactado.</p><button type="button" className="btn-ghost mt-3" onClick={onBack}><ArrowLeft className="h-4 w-4"/> Volver</button></div>;
  const L=lesson.data;
  const myReviews=editorial.filter(e=>e.lesson_id===lessonId);
  const finished=(r:FinishResult)=>{void r;onChanged();};
  return <article className="space-y-5">
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn-ghost" onClick={onBack}><ArrowLeft className="h-4 w-4"/> Cursos</button>
      <span className="text-xs text-muted-foreground">{meta?.course_title} · {meta?.module} {meta?.module_title} · {L.level}</span>
    </div>
    <header className="surface rim p-5 sm:p-6">
      <p className="eyebrow text-learn">{meta?.course_title} · Lección</p>
      <h1 className="mt-1 font-display text-3xl leading-tight text-foreground sm:text-4xl">{L.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1"><Clock className="h-3.5 w-3.5"/> {L.estimated_minutes} min</span>
        <span className={"rounded-full border px-3 py-1 "+(L.status==="published"?"border-learn/50 text-learn":"border-gold/40 text-gold")}>{STATUS_LABEL[L.status]||L.status}</span>
        {row&&<span className="rounded-full border border-hairline px-3 py-1">{row.status==="mastered"?"Dominada":row.status==="completed"?"Completada":"En curso"}{typeof row.best_exit_pct==="number"?` · mejor ${row.best_exit_pct} %`:""}</span>}
        {reviewDue&&<span className="rounded-full border border-learn/50 bg-learn/10 px-3 py-1 text-learn">Repaso pendiente hoy</span>}
      </div>
      {L.status!=="published"&&<div className="mt-4 flex gap-3 rounded-2xl border border-gold/35 bg-gold/[0.06] p-3 text-sm">
        <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden/>
        <div><p className="font-semibold text-foreground">Borrador sin revisión académica humana</p>
          <p className="text-muted-foreground">{L.pilot?"Lección piloto del kit: aún no cumple el estándar ("+L.quality.gaps.join("; ")+").":"Redactada y validada automáticamente (estructura, longitud, claves). Necesita tu revisión antes de publicarse."}</p></div>
      </div>}
      {L.objectives.length>0&&<div className="mt-4"><p className="text-sm font-semibold text-foreground">Objetivos</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-platinum/85">{L.objectives.map(o=><li key={o}><InlineMd text={o}/></li>)}</ul></div>}
    </header>
    <div className="surface rim p-5 sm:p-7">
      <AcademyMarkdown md={L.body} evaluation={<div className="space-y-3">
        {L.exit.length>0?<>
          <p className="text-sm text-muted-foreground">{mode==="review"?"Toca repaso: responde de nuevo sin mirar la lección. Si aciertas ≥80 %, el siguiente repaso se espacia más.":"Responde sin mirar los ejemplos. Se corrige en el servidor; la lección se marca completada solo con ≥80 %."}</p>
          <AcademyQuiz key={quizKey} client={client} questions={L.exit} mode={mode} lessonId={lessonId} sessionId={quizKey} onFinished={finished} onAttempt={onChanged}/>
          <button type="button" className="btn-ghost" onClick={()=>setQuizKey(newId())}><RotateCcw className="h-4 w-4"/> Nuevo intento</button>
        </>:<p className="rounded-2xl border border-dashed border-hairline p-4 text-sm text-muted-foreground">Sin evaluación de salida todavía (lección piloto). Usa Practicar para ejercicios del banco.</p>}
      </div>}/>
    </div>
    <section className="surface rim p-5" aria-labelledby="cuaderno">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="cuaderno" className="text-base font-semibold text-foreground">Tu cuaderno de esta lección</h2>
        <span role="status" className="text-xs text-muted-foreground">{saveState==="saving"?<><Loader2 className="inline h-3 w-3 animate-spin"/> Guardando…</>:saveState==="saved"?<><CheckCircle2 className="inline h-3 w-3 text-learn"/> Guardado y sincronizado</>:saveState==="error"?"Sin guardar":"Se guarda solo"}</span>
      </div>
      <textarea className="mt-3 min-h-32 w-full rounded-2xl border border-hairline bg-obsidian p-3 text-base text-foreground" maxLength={20000}
        aria-label="Notas de la lección" placeholder="Apunta dudas, errores que has cometido o un ejemplo propio…" value={notes} disabled={!row}
        onChange={e=>{dirty.current=true;setNotes(e.target.value);setSaveState("idle");}} onBlur={()=>{if(dirty.current)void save(notes);}}/>
      {saveError&&<p role="alert" className="mt-2 text-sm text-gym">{saveError}</p>}
    </section>
    {L.status!=="published"&&<section className="surface rim p-5" aria-labelledby="editorial">
      <h2 id="editorial" className="flex items-center gap-2 text-base font-semibold text-foreground"><ShieldCheck className="h-4 w-4 text-learn"/> Revisión editorial</h2>
      <p className="mt-1 text-sm text-muted-foreground">Versión de contenido {L.content_version}. Registra si la has revisado o qué hay que cambiar; queda con fecha en tu historial. Publicar exige cambiar el estado en el repositorio.</p>
      <textarea className="mt-3 min-h-20 w-full rounded-2xl border border-hairline bg-obsidian p-3 text-base" maxLength={4000} placeholder="Comentario (opcional)" value={editorialNote} onChange={e=>setEditorialNote(e.target.value)}/>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className="btn-gold" onClick={()=>void editorialDecision("reviewed")}>He revisado esta versión</button>
        <button type="button" className="btn-ghost" onClick={()=>void editorialDecision("changes_requested")}>Pedir cambios</button>
      </div>
      {editorialMsg&&<p role="status" className="mt-2 text-sm">{editorialMsg}</p>}
      {myReviews.length>0&&<ul className="mt-3 space-y-1 text-xs text-muted-foreground">{myReviews.slice(0,5).map(e=><li key={e.created_at}>{new Date(e.created_at).toLocaleString("es-ES")} · v{e.content_version} · {e.decision==="reviewed"?"revisada":"cambios pedidos"}{e.comment?` — ${e.comment}`:""}</li>)}</ul>}
    </section>}
    {L.source_urls.length>0&&<p className="text-xs text-muted-foreground">Fuente del temario: {L.source_urls.map((u,i)=><a key={u} href={u} target="_blank" rel="noopener noreferrer" className="underline">{i?" · ":""}{new URL(u).hostname}</a>)} · Contenido {L.source_kind==="original"?"original":L.source_kind}.</p>}
  </article>;
}
