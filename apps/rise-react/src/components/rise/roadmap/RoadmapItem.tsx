import {useState} from "react";
import {Link} from "@tanstack/react-router";
import {CheckCircle2,ChevronDown,Clock3,LockKeyhole,Sparkles} from "lucide-react";
import {localDate,type StepState} from "@/lib/career-path.mjs";

type Item={id:string;kind?:"session"|"exam"|undefined;source?:string|undefined;day?:string|undefined;due?:string|undefined;subject?:string|undefined;minutes?:number|undefined;title:string;detail:string;steps:StepState[];done:boolean;doneSteps:number;totalSteps:number};
const fmtDay=(d:string)=>new Date(d+"T12:00:00Z").toLocaleDateString("es-ES",{timeZone:"UTC",weekday:"short",day:"numeric",month:"short"});
const ACADEMY_COURSE:Record<string,string>={math:"matematicas",physics:"fisica",spanish:"castellano",comment:"comentario",english:"ingles"};

/** Tarea (o hito) con sus subtareas marcables. */
export function RoadmapItem({item,busy,disabled,onStep,onAll,open:openDefault=false,showDay=false}:{item:Item;busy:boolean;disabled:boolean;
  onStep:(stepId:string,done:boolean)=>void;onAll:(done:boolean)=>void;open?:boolean;showDay?:boolean}){
  const [open,setOpen]=useState(openDefault);
  const future=!!item.day&&item.day>localDate();
  const locked=disabled||future||busy;
  const label=(item.subject?item.subject+" · ":"")+item.title;
  const course=item.kind==="session"&&item.source?ACADEMY_COURSE[item.source]:undefined;
  return <li className="py-3">
    <div className="flex items-start gap-3">
      <input type="checkbox" checked={item.done} disabled={locked} aria-label={"Completar "+label}
        onChange={e=>onAll(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--gold)]"/>
      <button type="button" className="min-w-0 flex-1 text-left" aria-expanded={open} onClick={()=>setOpen(x=>!x)}>
        <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <span className={"text-sm font-medium "+(item.done?"text-gold":"text-foreground")}>{label}</span>
          <span className="inline-flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            {!!item.minutes&&<span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5"/>{item.minutes} min</span>}
            <span className="tabular-nums">{item.doneSteps}/{item.totalSteps}</span>
            <ChevronDown className={"h-4 w-4 transition-transform "+(open?"rotate-180":"")}/>
          </span>
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{showDay&&item.day?fmtDay(item.day)+" · ":""}{item.due?"Fecha límite "+fmtDay(item.due)+" · ":""}{item.detail}</span>
        {future&&<span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><LockKeyhole className="h-3 w-3"/>Se puede marcar ese día</span>}
      </button>
    </div>
    {open&&<ul className="ml-8 mt-2 space-y-1.5 border-l border-hairline pl-3">
      {item.steps.map(s=><li key={s.id} className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={s.done} disabled={locked||s.isAuto} aria-label={s.label}
          onChange={e=>onStep(s.id,e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--gold)]"/>
        <span className={"min-w-0 "+(s.done?"text-platinum/70 line-through decoration-gold/60":"")}>{s.label}
          {s.isAuto&&<span className="ml-1 inline-flex items-center gap-1 text-[11px] text-learn no-underline"><Sparkles className="h-3 w-3"/>hecho en Academia</span>}</span>
      </li>)}
      {course&&!item.done&&<li><Link to="/academia" search={{v:"cursos",curso:course}} className="text-xs text-learn underline">Abrir {item.subject} en Academia</Link></li>}
      {item.done&&<li className="inline-flex items-center gap-1 text-[11px] text-gold"><CheckCircle2 className="h-3 w-3"/>Guardado en tu cuenta</li>}
    </ul>}
  </li>;
}
