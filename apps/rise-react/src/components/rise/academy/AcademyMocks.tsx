import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import type {SupabaseClient} from "@supabase/supabase-js";
import {Check,CircleDashed,ClipboardCheck,Loader2,Minus,Play,Send,Timer,X} from "lucide-react";
import {SectionCard} from "@/components/rise/primitives";
import {AcademyMarkdown,InlineMd} from "./AcademyMarkdown";
import {MOCKS,courseTitle,mockMax,type MockDef,type MockItem} from "@/lib/academy/content";
import {newId} from "@/lib/academy/engine.mjs";
import {saveMock,selfScoreMock,startMock,submitMock,type MockAnswer,type MockItemResult,type MockSession} from "@/lib/academy/records.mjs";

type Answers=Record<string,MockAnswer>;
type Chosen=Record<string,string[]>;
const fmtPts=(n:number|null|undefined)=>n===null||n===undefined?"–":String(Math.round(n*100)/100).replace(".",",");
const words=(t:string|undefined)=>(t||"").trim().split(/\s+/).filter(w=>/[\p{L}\p{N}]/u.test(w)).length;

function summary(m:MockDef){
  return m.sections.map(s=>s.choose?`${s.label}: ${s.choose} de ${s.groups.length}`:`${s.label}`).join(" · ");
}

export function AcademyMocks({client,mocks,available,elective,onChanged}:{client:SupabaseClient|null;mocks:MockSession[];available:boolean;elective:string;onChanged:()=>void}){
  const active=mocks.find(s=>s.status==="in_progress");
  const [open,setOpen]=useState<string|null>(null);
  const [busy,setBusy]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);
  const order=["matematicas",elective,"catalan","castellano","comentario","ingles"];
  const defs=[...MOCKS].sort((a,b)=>order.indexOf(a.course)-order.indexOf(b.course));
  const openSession=mocks.find(s=>s.id===open)||null;
  async function begin(def:MockDef){
    if(!client)return;
    setBusy(def.mock_id);setError(null);
    try{await startMock(client,{clientSessionId:newId(),mockId:def.mock_id});onChanged();}
    catch(e){setError(e instanceof Error?e.message:"No se pudo iniciar.");}
    finally{setBusy(null);}
  }
  if(!available)return <p className="rounded-2xl border border-gold/35 bg-gold/[0.06] p-4 text-sm">Los simulacros con corrección automática aún no están instalados en este entorno.</p>;
  if(active){
    const def=MOCKS.find(m=>m.mock_id===active.mock_id);
    return def?<MockRunner key={active.id} client={client} def={def} session={active} onChanged={onChanged}/>:<p role="alert" className="text-sm text-gym">Simulacro desconocido: {active.mock_id}</p>;
  }
  if(openSession){
    const def=MOCKS.find(m=>m.mock_id===openSession.mock_id);
    return def?<MockReview key={openSession.id+openSession.status} client={client} def={def} session={openSession} onBack={()=>setOpen(null)} onChanged={onChanged}/>:null;
  }
  const done=mocks.filter(s=>s.status!=="in_progress");
  return <div className="space-y-4">
    <p className="rounded-2xl border border-learn/35 bg-learn/[0.05] p-4 text-sm text-platinum/85">
      Simulacros <strong>originales</strong> con la estructura y el nivel de los modelos 2024–2025. El <strong>cronómetro lo marca el servidor</strong>; lo objetivo se corrige
      automáticamente con las penalizaciones oficiales y lo abierto lo puntúas tú con la rúbrica, que solo aparece al entregar. No es una nota oficial.
    </p>
    {error&&<p role="alert" className="text-sm text-gym">{error}</p>}
    <div className="grid gap-4 md:grid-cols-2">
      {defs.map(d=>{const last=done.find(s=>s.mock_id===d.mock_id);
        return <SectionCard key={d.mock_id} eyebrow={courseTitle(d.course)+(d.course===elective?" · tu específica":"")} title={d.title} accent="var(--learn)">
          <p className="text-sm text-platinum/85">{d.duration_minutes} min · máx. {fmtPts(mockMax(d))} p. · {summary(d)}</p>
          {last&&<p className="mt-2 text-xs text-muted-foreground">Último: {last.status==="graded"?`${fmtPts(last.total_score)} / 10`:"pendiente de autocorrección"}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-gold" disabled={!client||busy!==null} onClick={()=>void begin(d)}>
              {busy===d.mock_id?<Loader2 className="h-4 w-4 animate-spin"/>:<Play className="h-4 w-4"/>} Empezar ({d.duration_minutes} min)</button>
            {last&&<button type="button" className="btn-ghost" onClick={()=>setOpen(last.id)}><ClipboardCheck className="h-4 w-4"/> {last.status==="graded"?"Ver corrección":"Autocorregir"}</button>}
          </div>
        </SectionCard>;})}
    </div>
    <SectionCard eyebrow="Historial" title="Entregados y notas" accent="var(--learn)">
      {done.length===0?<p className="text-sm text-muted-foreground">Todavía no has entregado ninguno.</p>:
      <ul className="divide-y divide-hairline">{done.map(s=>{const d=MOCKS.find(m=>m.mock_id===s.mock_id);
        return <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
          <button type="button" className="min-h-11 text-left underline-offset-2 hover:underline" onClick={()=>setOpen(s.id)}>{d?.title||s.mock_id} · {s.submitted_at?new Date(s.submitted_at).toLocaleDateString("es-ES"):""}</button>
          <span className="font-semibold text-foreground">{s.status==="graded"?`${fmtPts(s.total_score)} / 10`:<span className="text-gold">Falta autocorregir</span>}
            {s.late_answers_ignored&&<span className="ml-2 text-xs font-normal text-gym">entregado fuera de tiempo</span>}</span>
        </li>;})}</ul>}
    </SectionCard>
  </div>;
}

function useServerClock(serverNow:string|undefined){
  const offset=useRef(0);
  useEffect(()=>{if(serverNow){const t=new Date(serverNow).getTime();if(Number.isFinite(t))offset.current=t-Date.now();}},[serverNow]);
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);
  return now+offset.current;
}

function MockRunner({client,def,session,onChanged}:{client:SupabaseClient|null;def:MockDef;session:MockSession;onChanged:()=>void}){
  const [answers,setAnswers]=useState<Answers>(()=>session.answers||{});
  const [chosen,setChosen]=useState<Chosen>(()=>session.chosen||{});
  const [revision,setRevision]=useState(session.revision);
  const [state,setState]=useState("");
  const [serverNow,setServerNow]=useState<string|undefined>(session.server_now);
  const [confirming,setConfirming]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [conflict,setConflict]=useState(false);
  const dirty=useRef(false);const revRef=useRef(revision);revRef.current=revision;
  const latest=useRef({answers,chosen});latest.current={answers,chosen};
  const now=useServerClock(serverNow);
  const remaining=Math.floor((new Date(session.deadline_at).getTime()-now)/1000);
  const versionMismatch=session.content_version!==def.content_version;

  const submit=useCallback(async()=>{
    if(!client||submitting)return;
    setSubmitting(true);setState("Entregando…");
    try{await submitMock(client,{sessionId:session.id,answers:latest.current.answers,chosen:latest.current.chosen});dirty.current=false;onChanged();}
    catch(e){setState(e instanceof Error?e.message:"No se pudo entregar.");setSubmitting(false);}
  },[client,session.id,onChanged,submitting]);

  useEffect(()=>{
    if(!dirty.current||!client||conflict)return;
    const t=setTimeout(async()=>{
      try{setState("Guardando…");const r=await saveMock(client,{sessionId:session.id,revision:revRef.current,answers,chosen});
        setRevision(r.revision);setServerNow(r.server_now);dirty.current=false;setState("Guardado");}
      catch(e){
        if(e instanceof Error&&e.name==="MockTimeUp"){void submit();return;}
        const msg=e instanceof Error?e.message:"No se pudo guardar";
        if(/otro dispositivo/.test(msg))setConflict(true);
        setState(msg);
      }
    },1200);
    return()=>clearTimeout(t);
  },[answers,chosen]); // eslint-disable-line react-hooks/exhaustive-deps

  const autoSent=useRef(false);
  useEffect(()=>{if(remaining<=0&&!autoSent.current&&!conflict){autoSent.current=true;void submit();}},[remaining,conflict,submit]);

  const setAns=(id:string,patch:MockAnswer)=>{dirty.current=true;setAnswers(a=>({...a,[id]:{...a[id],...patch}}));};
  const toggle=(sec:string,gid:string,limit:number)=>{
    dirty.current=true;
    setChosen(c=>{const cur=c[sec]||[];if(cur.includes(gid))return {...c,[sec]:cur.filter(x=>x!==gid)};if(cur.length>=limit)return c;return {...c,[sec]:[...cur,gid]};});
  };
  const mm=Math.max(0,remaining);
  const clock=`${Math.floor(mm/60)}:${String(mm%60).padStart(2,"0")}`;
  const missingChoice=def.sections.filter(s=>s.choose&&(chosen[s.id]||[]).length<s.choose);

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-hairline bg-ink/80 p-3">
      <p className="text-sm font-semibold text-foreground">{def.title}</p>
      <span role="status" className="text-xs text-muted-foreground">{state}</span>
    </div>
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 lg:bottom-6 lg:right-6">
      <span className={"inline-flex items-center gap-1.5 rounded-full border bg-ink/95 px-4 py-2 font-mono text-base font-semibold shadow-lg backdrop-blur "+(remaining<=300?"border-gym text-gym":"border-gold/60 text-foreground")}
        role="timer" aria-label={`Quedan ${clock}`}><Timer className="h-4 w-4"/>{clock}</span>
    </div>
    {versionMismatch&&<p role="alert" className="rounded-2xl border border-gold/40 p-3 text-sm">El simulacro se actualizó después de empezarlo. Entrega y vuelve a empezar para usar la versión nueva.</p>}
    {conflict&&<p role="alert" className="rounded-2xl border border-gym/40 p-3 text-sm text-gym">Este simulacro se guardó desde otro dispositivo. Pulsa «Actualizar» arriba para seguir con la última versión (lo que ves aquí no se ha guardado).</p>}
    {def.intro_md&&<AcademyMarkdown md={def.intro_md}/>}
    {def.data_md&&<div className="rounded-2xl border border-hairline p-3 text-sm"><InlineMd text={def.data_md}/></div>}
    {def.text_md&&<details open className="rounded-2xl border border-hairline bg-obsidian/60">
      <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold">Texto</summary>
      <div className="border-t border-hairline px-4 py-3"><AcademyMarkdown md={def.text_md}/></div></details>}
    {def.sections.map(sec=><section key={sec.id} className="space-y-3" aria-labelledby={`sec-${sec.id}`}>
      <h3 id={`sec-${sec.id}`} className="pt-2 font-display text-xl text-foreground">{sec.label}</h3>
      {sec.instructions_md&&<p className="text-sm text-platinum/85"><InlineMd text={sec.instructions_md}/></p>}
      {sec.choose&&<p className="text-xs text-muted-foreground">Elegidas: {(chosen[sec.id]||[]).length} de {sec.choose}. Solo puntúan las que marques como elegidas.</p>}
      {sec.groups.map(g=>{const isChosen=!sec.choose||(chosen[sec.id]||[]).includes(g.id);const full=!!sec.choose&&(chosen[sec.id]||[]).length>=sec.choose&&!isChosen;
        return <div key={g.id} className={"rounded-2xl border p-4 "+(isChosen?"border-learn/40 bg-learn/[0.03]":"border-hairline opacity-80")}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{g.label} <span className="font-normal text-muted-foreground">· {fmtPts(g.points)} p.</span></p>
            {sec.choose&&<label className={"inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm "+(isChosen?"border-learn bg-learn/15":"border-hairline")}>
              <input type="checkbox" className="h-5 w-5" checked={isChosen} disabled={full} onChange={()=>toggle(sec.id,g.id,sec.choose!)}/> Elegir</label>}
          </div>
          {g.stem_md&&<div className="mb-3"><AcademyMarkdown md={g.stem_md}/></div>}
          <ol className="space-y-3">{g.items.map(it=><li key={it.id}><ItemInput it={it} a={answers[it.id]} onChange={p=>setAns(it.id,p)}/></li>)}</ol>
        </div>;})}
    </section>)}
    <div className="rounded-2xl border border-gold/40 bg-gold/[0.05] p-4">
      {missingChoice.length>0&&<p className="mb-2 text-sm text-gold">Te faltan cuestiones por elegir en: {missingChoice.map(s=>s.label).join(", ")}. Puedes entregar igual, pero lo no elegido no puntúa.</p>}
      {!confirming?<button type="button" className="btn-gold" disabled={submitting||conflict} onClick={()=>setConfirming(true)}><Send className="h-4 w-4"/> Entregar</button>:
      <div className="flex flex-wrap items-center gap-2"><span className="text-sm">¿Entregar ahora? No podrás cambiar respuestas.</span>
        <button type="button" className="btn-gold" disabled={submitting} onClick={()=>void submit()}>{submitting?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>} Sí, entregar</button>
        <button type="button" className="btn-ghost" onClick={()=>setConfirming(false)}>Seguir</button></div>}
      <p className="mt-2 text-xs text-muted-foreground">Al llegar a 0:00 se entrega solo. Tras el límite (+2 min de margen) el servidor no acepta cambios y corrige lo último guardado.</p>
    </div>
  </div>;
}

function ItemInput({it,a,onChange,disabled=false}:{it:MockItem;a:MockAnswer|undefined;onChange:(p:MockAnswer)=>void;disabled?:boolean}){
  const pts=/\[/.test(it.prompt_md)?null:<span className="whitespace-nowrap text-xs text-muted-foreground"> [{fmtPts(it.points)} p.{it.penalty>0&&it.kind==="multiple_choice"?` · fallo −${fmtPts(it.penalty)}`:""}]</span>;
  return <div className="space-y-2">
    <div className="text-[15px] text-foreground"><InlineMd text={it.prompt_md}/>{pts}</div>
    {it.kind==="multiple_choice"&&<fieldset className="grid gap-2" disabled={disabled}><legend className="sr-only">Opciones</legend>
      {it.choices?.map(c=><label key={c.id} className={"flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm "+(a?.choice===c.id?"border-learn/60 bg-learn/[0.08]":"border-hairline")}>
        <input type="radio" name={it.id} checked={a?.choice===c.id} className="h-4 w-4 accent-[var(--learn)]" onChange={()=>onChange({choice:c.id})}/>
        <span className="min-w-0 flex-1"><InlineMd text={c.text}/></span></label>)}
      {a?.choice&&<button type="button" className="justify-self-start text-xs text-muted-foreground underline" onClick={()=>onChange({choice:""})}>Dejar en blanco</button>}
    </fieldset>}
    {it.kind==="numeric"&&<div className="flex flex-wrap items-center gap-2">
      <input aria-label="Valor" className="min-h-11 w-36 rounded-xl border border-hairline bg-obsidian px-3 text-base" inputMode="text" autoComplete="off" autoCapitalize="off" spellCheck={false}
        disabled={disabled} placeholder={it.unit_required?"Ej.: 1,6e-13":"Ej.: 2,5 u 8/3"} value={a?.value||""} onChange={e=>onChange({value:e.target.value})}/>
      {it.unit_required?<input aria-label="Unidad" className="min-h-11 w-28 rounded-xl border border-hairline bg-obsidian px-3 text-base" autoComplete="off" autoCapitalize="off" spellCheck={false}
        disabled={disabled} placeholder="Unidad" value={a?.unit||""} onChange={e=>onChange({unit:e.target.value})}/>:it.unit_label&&<span className="text-sm text-muted-foreground">{it.unit_label}</span>}
    </div>}
    {it.kind==="short_text"&&<input aria-label="Respuesta" className="min-h-11 w-full max-w-xs rounded-xl border border-hairline bg-obsidian px-3 text-base" autoComplete="off" autoCapitalize="off"
      disabled={disabled} value={a?.text||""} onChange={e=>onChange({text:e.target.value})}/>}
    {it.kind==="open"&&<div>
      <textarea aria-label="Respuesta abierta" className="min-h-28 w-full rounded-2xl border border-hairline bg-obsidian p-3 text-base" disabled={disabled}
        placeholder={it.words?"Escribe tu texto aquí":"Escribe tu desarrollo (o resuélvelo en papel y anota aquí el resultado)"} value={a?.text||""} onChange={e=>onChange({text:e.target.value})}/>
      {it.words&&<p className={"text-xs "+(words(a?.text)<it.words[0]||words(a?.text)>it.words[1]?"text-gold":"text-muted-foreground")}>{words(a?.text)} palabras · objetivo {it.words[0]}–{it.words[1]}</p>}
    </div>}
  </div>;
}

const STATUS:Record<MockItemResult["status"],{label:string;cls:string;Icon:typeof Check}>={
  correct:{label:"Correcta",cls:"border-learn text-learn",Icon:Check},
  wrong:{label:"Incorrecta",cls:"border-gym text-gym",Icon:X},
  blank:{label:"En blanco",cls:"border-hairline text-muted-foreground",Icon:Minus},
  unit:{label:"Valor correcto, unidad incorrecta (−0,5)",cls:"border-gold text-gold",Icon:CircleDashed},
  open:{label:"Autocorrección",cls:"border-gold text-gold",Icon:ClipboardCheck},
  not_chosen:{label:"No elegida",cls:"border-hairline text-muted-foreground",Icon:Minus},
};

function answerText(a:MockAnswer|undefined){
  if(!a)return "—";
  if(a.choice)return a.choice;
  if(a.value)return a.value+(a.unit?" "+a.unit:"");
  return a.text?.trim()?a.text:"—";
}

function MockReview({client,def,session,onBack,onChanged}:{client:SupabaseClient|null;def:MockDef;session:MockSession;onBack:()=>void;onChanged:()=>void}){
  const res=session.result;
  const graded=session.status==="graded";
  const [scores,setScores]=useState<Record<string,string>>(()=>Object.fromEntries(Object.entries(session.self_scores||{}).map(([k,v])=>[k,String(v.given).replace(".",",")])));
  const [state,setState]=useState("");
  const [busy,setBusy]=useState(false);
  const openItems=useMemo(()=>Object.entries(res?.items||{}).filter(([,r])=>r.status==="open"),[res]);
  const parsed=Object.fromEntries(openItems.map(([id,r])=>{const v=Number(String(scores[id]??"0").replace(",","."));return [id,Number.isFinite(v)&&v>=0&&v<=r.max?v:NaN];}));
  const invalid=Object.values(parsed).some(v=>Number.isNaN(v));
  const penalty=(_id:string,r:MockItemResult)=>r.word_penalty&&r.word_count!==undefined&&r.word_min!==undefined&&r.word_max!==undefined&&(r.word_count<r.word_min||r.word_count>r.word_max)?r.word_penalty:0;
  const preview=(res?.auto_score||0)+openItems.reduce((a,[id,r])=>a+Math.max(0,(parsed[id]||0)-penalty(id,r)),0);
  async function save(){
    if(!client||invalid)return;
    setBusy(true);setState("Guardando…");
    try{await selfScoreMock(client,{sessionId:session.id,scores:Object.fromEntries(Object.entries(parsed).map(([k,v])=>[k,Number(v)]))});onChanged();}
    catch(e){setState(e instanceof Error?e.message:"No se pudo guardar.");}
    finally{setBusy(false);}
  }
  if(!res)return <p className="text-sm">Sin resultado.</p>;
  const itemDef=(id:string)=>{for(const s of def.sections)for(const g of s.groups)for(const it of g.items)if(it.id===id)return it;return null;};
  return <div className="space-y-4">
    <button type="button" className="btn-ghost" onClick={onBack}>← Volver a simulacros</button>
    <SectionCard eyebrow={courseTitle(def.course)} title={def.title} accent="var(--gold)">
      <p className="font-display text-3xl text-foreground">{graded?`${fmtPts(session.total_score)} / 10`:`${fmtPts(preview)} / 10`}</p>
      <p className="mt-1 text-sm text-muted-foreground">Automático: {fmtPts(res.auto_score)} · abierto: hasta {fmtPts(res.open_max)} {graded?"· calificado":"· pendiente de tu autocorrección"}</p>
      {res.late_answers_ignored&&<p className="mt-2 text-sm text-gym">Entregado fuera de tiempo: se corrigió lo guardado antes del límite.</p>}
    </SectionCard>
    {def.sections.map(sec=><section key={sec.id} className="space-y-3">
      <h3 className="pt-2 font-display text-xl text-foreground">{sec.label}</h3>
      {sec.groups.map(g=>{const gr=res.groups.find(x=>x.group_id===g.id);
        return <div key={g.id} className={"rounded-2xl border p-4 "+(gr?.chosen?"border-hairline":"border-hairline opacity-70")}>
          <p className="mb-2 text-sm font-semibold text-foreground">{g.label} · {gr?.chosen?`automático ${fmtPts(gr.auto_score)} de ${fmtPts(gr.auto_max)}${gr.open_max?` + abierto hasta ${fmtPts(gr.open_max)}`:""}`:"no elegida"}</p>
          {g.stem_md&&<div className="mb-3 text-sm"><AcademyMarkdown md={g.stem_md}/></div>}
          <ul className="space-y-3">{g.items.map(it=>{const r=res.items[it.id];if(!r)return null;const st=STATUS[r.status];const d=itemDef(it.id);
            return <li key={it.id} className="rounded-xl border border-hairline bg-ink/50 p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><InlineMd text={it.prompt_md}/></div>
                <span className={"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs "+st.cls}><st.Icon className="h-3 w-3"/>{st.label}{r.score!==undefined?` · ${fmtPts(r.score)}`:""}</span></div>
              <p className="mt-2 text-xs text-muted-foreground">Tu respuesta: {d?.kind==="multiple_choice"?(d.choices?.find(c=>c.id===session.answers[it.id]?.choice)?.text||"—"):answerText(session.answers[it.id])}
                {r.correct&&<> · Correcta: {d?.kind==="multiple_choice"?<InlineMd text={d.choices?.find(c=>c.id===r.correct)?.text||r.correct}/>:r.correct}</>}</p>
              <div className="mt-2 rounded-lg bg-foreground/[0.03] p-2"><InlineMd text={r.solution_md}/></div>
              {r.rubric_md&&<p className="mt-2 text-xs"><strong>Rúbrica:</strong> <InlineMd text={r.rubric_md}/></p>}
              {r.status==="open"&&<div className="mt-2 flex flex-wrap items-center gap-2">
                {r.word_count!==undefined&&<span className={"text-xs "+(penalty(it.id,r)?"text-gym":"text-muted-foreground")}>{r.word_count} palabras{penalty(it.id,r)?` · fuera de ${r.word_min}–${r.word_max}: −${fmtPts(r.word_penalty)} (lo aplica el servidor)`:""}</span>}
                <label className="ml-auto flex items-center gap-2 text-xs">Tu nota (0 a {fmtPts(r.max)})
                  <input inputMode="decimal" className="min-h-11 w-20 rounded-lg border border-hairline bg-obsidian px-2 text-right text-base" disabled={graded}
                    value={graded?fmtPts(session.self_scores?.[it.id]?.given??0):(scores[it.id]??"")} aria-invalid={Number.isNaN(parsed[it.id])}
                    onChange={e=>setScores(s=>({...s,[it.id]:e.target.value}))}/></label>
              </div>}
            </li>;})}</ul>
        </div>;})}
    </section>)}
    {!graded&&<div className="rounded-2xl border border-gold/40 bg-gold/[0.05] p-4">
      <p className="text-sm">Puntúa cada respuesta abierta con su rúbrica. Lo que dejes vacío cuenta 0. Una vez guardada, la nota no cambia.</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-gold" disabled={busy||invalid||!client} onClick={()=>void save()}>{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<ClipboardCheck className="h-4 w-4"/>} Guardar mi nota ({fmtPts(Math.min(10,preview))})</button>
        {invalid&&<span className="text-xs text-gym">Revisa: alguna nota está fuera de rango.</span>}
        <span role="status" className="text-xs text-muted-foreground">{state}</span>
      </div>
    </div>}
  </div>;
}
