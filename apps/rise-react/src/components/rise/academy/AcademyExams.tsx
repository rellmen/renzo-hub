import {useEffect,useMemo,useRef,useState} from "react";
import type {SupabaseClient} from "@supabase/supabase-js";
import {ExternalLink,Loader2,Play,Send,Timer} from "lucide-react";
import {SectionCard} from "@/components/rise/primitives";
import {PROFILES,courseTitle,CATALOG} from "@/lib/academy/content";
import {newId,profileMax,profileSlots,scoreExam,type ExamProfile} from "@/lib/academy/engine.mjs";
import {saveExam,startExam,type ExamRow} from "@/lib/academy/records.mjs";

// UOC 2026: específica 180 min para dos materias; Castellano + Inglés 105 min en total (reparto orientativo 60/45).
const DEFAULT_MIN:Record<string,number>={matematicas:90,fisica:90,economia:90,castellano:60,comentario:90,ingles:45};

function sectionText(p:ExamProfile){
  return p.sections.map(s=>{
    if(typeof s.choose==="number")return `${s.label}: elegir ${s.choose} de ${s.available} (${s.points_each} p. c/u)`;
    if(typeof s.count==="number")return `${s.label}: ${s.count} × ${s.points_each} p.`;
    return `${s.label}: ${s.points} p.`;
  }).join(" · ");
}

export function AcademyExams({client,uid,exams,elective,onChanged}:{client:SupabaseClient|null;uid:string;exams:ExamRow[];elective:string;onChanged:()=>void}){
  const active=exams.find(e=>e.status==="in_progress");
  const order=["matematicas",elective,"castellano","comentario","ingles",elective==="fisica"?"economia":"fisica"];
  const profiles=[...PROFILES.profiles].sort((a,b)=>order.indexOf(a.course)-order.indexOf(b.course));
  const [error,setError]=useState<string|null>(null);
  const [busy,setBusy]=useState<string|null>(null);
  async function begin(p:ExamProfile){
    if(!client)return;
    setBusy(p.id);setError(null);
    try{
      const models=CATALOG.courses.find(c=>c.slug===p.course)?.models_url;
      await startExam(client,uid,{clientSessionId:newId(),profileId:p.id,course:p.course,sourceUrl:models,sourceLabel:"Modelo oficial elegido en la web de la Generalitat",durationMinutes:DEFAULT_MIN[p.course]||90});
      onChanged();
    }catch(e){setError(e instanceof Error?e.message:"No se pudo iniciar.");}
    finally{setBusy(null);}
  }
  return <div className="space-y-6">
    <p className="rounded-2xl border border-gold/35 bg-gold/[0.06] p-4 text-sm text-platinum/85">
      Los simulacros usan los <strong>exámenes oficiales 2024–2026 enlazados</strong> (no se copian aquí) y tu <strong>autocorrección</strong> con la estructura del perfil 2026.
      No es una nota oficial ni una predicción. {PROFILES.global_notice}
    </p>
    {active&&<ExamRunner key={active.id} client={client} uid={uid} exam={active} onChanged={onChanged}/>}
    {error&&<p role="alert" className="text-sm text-gym">{error}</p>}
    <div className="grid gap-4 md:grid-cols-2">
      {profiles.map(p=><SectionCard key={p.id} eyebrow={courseTitle(p.course)+(p.course===elective?" · tu específica":"")} title={`Perfil ${PROFILES.year} · máx. ${profileMax(p)} p.`} accent="var(--learn)">
        <p className="text-sm text-platinum/85">{sectionText(p)}</p>
        {p.penalties&&<p className="mt-2 text-xs text-muted-foreground">Penalizaciones declaradas: {Object.entries(p.penalties).map(([k,v])=>`${k.replace(/_/g," ")} ${v}`).join(" · ")}</p>}
        {p.grading&&<p className="mt-2 text-xs text-muted-foreground">{p.grading}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <a className="btn-ghost" href={CATALOG.courses.find(c=>c.slug===p.course)?.models_url||p.official_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4"/> Modelos oficiales</a>
          <button type="button" className="btn-gold" disabled={!!active||busy===p.id||!client} onClick={()=>void begin(p)}>{busy===p.id?<Loader2 className="h-4 w-4 animate-spin"/>:<Play className="h-4 w-4"/>} Iniciar simulacro</button>
        </div>
      </SectionCard>)}
    </div>
    <SectionCard eyebrow="Historial" title="Simulacros entregados" accent="var(--learn)">
      {exams.filter(e=>e.status==="submitted").length===0?<p className="text-sm text-muted-foreground">Sin simulacros entregados todavía.</p>:
      <ul className="divide-y divide-hairline">{exams.filter(e=>e.status==="submitted").map(e=><li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
        <span>{courseTitle(e.course)} · {e.submitted_at?new Date(e.submitted_at).toLocaleDateString("es-ES"):""}</span>
        <span className="font-semibold text-foreground">{e.total_score} / 10 <span className="text-xs font-normal text-muted-foreground">(autocorrección)</span></span>
      </li>)}</ul>}
    </SectionCard>
  </div>;
}

function ExamRunner({client,uid,exam,onChanged}:{client:SupabaseClient|null;uid:string;exam:ExamRow;onChanged:()=>void}){
  const profile=PROFILES.profiles.find(p=>p.id===exam.profile_id);
  const slots=useMemo(()=>profile?profileSlots(profile):[],[profile]);
  const [row,setRow]=useState(exam);
  const [scores,setScores]=useState<Record<string,string>>(()=>Object.fromEntries(Object.entries(exam.scores||{}).filter(([k])=>k!=="_penalty").map(([k,v])=>[k,String(v)])));
  const [penalty,setPenalty]=useState<string>(String((exam.scores as Record<string,unknown>)?.["_penalty"]??""));
  const [notes,setNotes]=useState(exam.notes||"");
  const [now,setNow]=useState(()=>Date.now());
  const [state,setState]=useState<string>("");
  const dirty=useRef(false);const rowRef=useRef(row);rowRef.current=row;
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);
  const elapsed=Math.max(0,Math.floor((now-new Date(exam.started_at).getTime())/1000));
  const remaining=exam.duration_minutes*60-elapsed;
  const total=profile?scoreExam(profile,scores,Number(String(penalty||"0").replace(",","."))):null;
  const payload=()=>({...Object.fromEntries(Object.entries(scores).filter(([,v])=>v!=="").map(([k,v])=>[k,Number(String(v).replace(",","."))])),_penalty:Number(String(penalty||"0").replace(",","."))||0});
  useEffect(()=>{
    if(!dirty.current||!client)return;
    const t=setTimeout(async()=>{
      try{setState("Guardando…");const next=await saveExam(client,uid,rowRef.current,{scores:payload(),notes});setRow(next);dirty.current=false;setState("Guardado");}
      catch(e){setState(e instanceof Error?e.message:"No se pudo guardar");}
    },1200);
    return()=>clearTimeout(t);
  },[scores,penalty,notes]); // eslint-disable-line react-hooks/exhaustive-deps
  async function submit(){
    if(!client||total===null)return;
    setState("Entregando…");
    try{await saveExam(client,uid,rowRef.current,{scores:payload(),notes,total:Math.min(10,total),submit:true});dirty.current=false;onChanged();}
    catch(e){setState(e instanceof Error?e.message:"No se pudo entregar");}
  }
  const fmt=(s:number)=>`${s<0?"+":""}${Math.floor(Math.abs(s)/60)}:${String(Math.abs(s)%60).padStart(2,"0")}`;
  if(!profile)return <p className="text-sm text-gym">Perfil de examen desconocido: {exam.profile_id}</p>;
  return <SectionCard eyebrow={"Simulacro en curso · "+courseTitle(exam.course)} title="Corrige con la rúbrica oficial" accent="var(--gold)"
    action={<span className={"inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold "+(remaining<0?"border-gym text-gym":"border-hairline")} aria-live="off"><Timer className="h-4 w-4"/>{remaining>=0?fmt(remaining):"Tiempo superado "+fmt(remaining)}</span>}>
    <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-platinum/85">
      <li>Abre un modelo oficial y resuélvelo en papel, con el tiempo en marcha (el cronómetro avisa pero no te bloquea).</li>
      <li>Abre la corrección oficial del mismo año y puntúa cada pregunta que elegiste.</li>
      <li>Entrega: la nota queda guardada y ya no se puede editar.</li>
    </ol>
    {exam.source_url&&<a className="btn-ghost mb-4" href={exam.source_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4"/> Abrir modelos oficiales</a>}
    <div className="grid gap-3 sm:grid-cols-2">
      {slots.map(s=><label key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-hairline p-3 text-sm">
        <span>{s.label} <span className="text-muted-foreground">(máx. {s.max})</span></span>
        <input inputMode="decimal" className="min-h-11 w-20 rounded-lg border border-hairline bg-obsidian px-2 text-right text-base" value={scores[s.id]??""}
          onChange={e=>{dirty.current=true;setScores(x=>({...x,[s.id]:e.target.value}));}} aria-label={s.label}/>
      </label>)}
      <label className="flex items-center justify-between gap-3 rounded-xl border border-hairline p-3 text-sm">
        <span>Penalizaciones (faltas, test erróneo)</span>
        <input inputMode="decimal" className="min-h-11 w-20 rounded-lg border border-hairline bg-obsidian px-2 text-right text-base" value={penalty} onChange={e=>{dirty.current=true;setPenalty(e.target.value);}} aria-label="Penalizaciones"/>
      </label>
    </div>
    <textarea className="mt-3 min-h-24 w-full rounded-2xl border border-hairline bg-obsidian p-3 text-base" placeholder="¿Qué modelo hiciste (año/convocatoria)? Errores a repasar…" value={notes} onChange={e=>{dirty.current=true;setNotes(e.target.value);}}/>
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <p className="font-display text-2xl text-foreground">{total===null?"Revisa las puntuaciones":`${Math.min(10,total)} / 10`}</p>
      <button type="button" className="btn-gold" disabled={total===null} onClick={()=>void submit()}><Send className="h-4 w-4"/> Entregar</button>
      <span role="status" className="text-xs text-muted-foreground">{state}</span>
    </div>
  </SectionCard>;
}
