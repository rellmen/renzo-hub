import {useMemo,useState} from "react";
import type {SupabaseClient} from "@supabase/supabase-js";
import {Dices,Stethoscope} from "lucide-react";
import {SectionCard} from "@/components/rise/primitives";
import {AcademyQuiz} from "./AcademyQuiz";
import {InlineMd} from "./AcademyMarkdown";
import {BANK,CATALOG,type PublicQuestion} from "@/lib/academy/content";
import {newId,wordCount} from "@/lib/academy/engine.mjs";

function shuffle<T>(a:T[]):T[]{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j]!,b[i]!];}return b;}
const KEY="risehub.academia.essay.";
function readLocal(id:string){try{return localStorage.getItem(KEY+id)||"";}catch{return "";}}
function writeLocal(id:string,v:string){try{localStorage.setItem(KEY+id,v);}catch{/* almacenamiento no disponible */}}

export function AcademyPractice({client,elective,onChanged}:{client:SupabaseClient|null;elective:string;onChanged:()=>void}){
  const order=["matematicas",elective,"castellano","comentario","ingles",elective==="fisica"?"economia":"fisica"];
  const [course,setCourse]=useState(order[0]!);
  const [run,setRun]=useState<{id:string;mode:"practice"|"diagnostic";qs:PublicQuestion[]}|null>(null);
  const pool=useMemo(()=>BANK.filter(q=>q.course===course),[course]);
  const gradable=pool.filter(q=>q.kind!=="essay");
  const essays=pool.filter(q=>q.kind==="essay");
  return <div className="space-y-6">
    <div role="tablist" aria-label="Materia" className="flex flex-wrap gap-2">
      {order.map(c=><button key={c} type="button" role="tab" aria-selected={course===c} onClick={()=>{setCourse(c);setRun(null);}}
        className={"min-h-11 rounded-full border px-4 text-sm font-semibold "+(course===c?"border-learn/60 bg-learn/15 text-foreground":"border-hairline text-muted-foreground")}>
        {CATALOG.courses.find(x=>x.slug===c)?.title}</button>)}
    </div>
    <SectionCard eyebrow="Banco de preguntas originales (borrador)" title={`${gradable.length} preguntas corregibles · ${essays.length} redacciones`} accent="var(--learn)">
      <p className="text-sm text-muted-foreground">El banco inicial es pequeño y está en borrador: sirve para detectar huecos, no para predecir tu nota. Las preguntas de salida de cada lección no aparecen aquí para no gastarlas.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-gold" disabled={!gradable.length} onClick={()=>setRun({id:newId(),mode:"diagnostic",qs:gradable})}><Stethoscope className="h-4 w-4"/> Diagnóstico completo ({gradable.length})</button>
        <button type="button" className="btn-ghost" disabled={!gradable.length} onClick={()=>setRun({id:newId(),mode:"practice",qs:shuffle(gradable).slice(0,5)})}><Dices className="h-4 w-4"/> Tanda de 5 al azar</button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">En el diagnóstico usa «No lo sé» siempre que no estés seguro: así el plan detecta el prerrequisito real.</p>
    </SectionCard>
    {run&&<AcademyQuiz key={run.id} client={client} questions={run.qs} mode={run.mode} onAttempt={onChanged}/>}
    {essays.map(q=><EssayPractice key={q.id} q={q}/>)}
  </div>;
}

function EssayPractice({q}:{q:PublicQuestion}){
  const [text,setText]=useState(()=>readLocal(q.id));
  const [showModel,setShowModel]=useState(false);
  const n=wordCount(text);const [min,max]=Array.isArray(q.words)&&q.words.length===2?q.words as [number,number]:[0,0];
  const rubric=q.rubric&&typeof q.rubric==="object"?Object.entries(q.rubric as Record<string,unknown>):[];
  return <SectionCard eyebrow="Redacción · autocorrección con rúbrica" title={<InlineMd text={q.prompt_md}/>} accent="var(--gold)">
    <textarea className="min-h-40 w-full rounded-2xl border border-hairline bg-obsidian p-3 text-base" value={text} aria-label="Tu redacción"
      onChange={e=>{setText(e.target.value);writeLocal(q.id,e.target.value);}}/>
    <p className={"mt-1 text-xs "+(min&&(n<min||n>max)?"text-gym":"text-muted-foreground")}>{n} palabras{min?` · objetivo ${min}–${max}`:""} · borrador guardado solo en este dispositivo</p>
    {rubric.length>0&&<ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{rubric.map(([k,v])=><li key={k}><strong>{k}</strong>: {String(v)}</li>)}</ul>}
    {q.model_md&&<div className="mt-3">
      {showModel?<p className="rounded-xl border border-hairline bg-foreground/[0.03] p-3 text-sm"><InlineMd text={q.model_md}/></p>
        :<button type="button" className="btn-ghost" disabled={min>0&&n<min} onClick={()=>setShowModel(true)}>{min>0&&n<min?`Escribe al menos ${min} palabras para ver el modelo`:"Ver respuesta modelo"}</button>}
    </div>}
    <p className="mt-2 text-xs text-muted-foreground">La corrección de redacciones es orientativa: no sustituye a un tribunal.</p>
  </SectionCard>;
}
