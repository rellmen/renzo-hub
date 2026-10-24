import {describe,expect,it} from "vitest";
import {readFileSync,readdirSync} from "node:fs";
import {join} from "node:path";
import {render,screen} from "@testing-library/react";
import {parseBlocks,parseInline} from "@/lib/academy/markdown.mjs";
import {bandFor,courseProgress,daysUntil,dueReviews,nextLessonFor,profileMax,profileSlots,progressMap,scoreExam,skillMastery,todayPlan,weeklyPlan,academyEnvironmentAllowed} from "@/lib/academy/engine.mjs";
import {CATALOG,BANK,PROFILES} from "@/lib/academy/content";
import {AcademyMarkdown} from "@/components/rise/academy/AcademyMarkdown";
import {APPS,searchApps} from "@/lib/apps";

const dir=join(__dirname,"..","content","academia");

describe("Academia · contenido público",()=>{
  it("no incluye claves de corrección en ningún archivo del bundle",()=>{
    const files=["catalog.json","bank.json","exam-profiles.json",...readdirSync(join(dir,"lessons")).map(f=>"lessons/"+f)];
    for(const f of files){
      const t=readFileSync(join(dir,f),"utf8");
      expect(t,f).not.toMatch(/"(key|correct_choice_id|accepted|explanation_md|grading_private|correct_value)"/);
    }
  });
  it("informa estados editoriales reales: nada publicado y 120 lecciones del temario",()=>{
    expect(CATALOG.stats.lessons_total).toBe(120);
    expect(CATALOG.stats.by_status["published"]).toBe(0);
    expect(CATALOG.stats.by_status["planned"]!+CATALOG.stats.by_status["draft"]!).toBe(120);
    expect(CATALOG.stats.meets_standard).toBeGreaterThanOrEqual(10);
    expect(BANK.length).toBe(56);
    expect(CATALOG.elective.chosen).toBe("economia");
    expect(CATALOG.elective.confirmed).toBe(false);
  });
  it("cada lección con contenido al estándar tiene 5 preguntas de salida y una pregunta evaluable por servidor",()=>{
    for(const f of readdirSync(join(dir,"lessons"))){
      const l=JSON.parse(readFileSync(join(dir,"lessons",f),"utf8"));
      if(l.quality.meets_standard){expect(l.exit.length,f).toBeGreaterThanOrEqual(5);expect(l.body).toContain("::evaluacion");}
    }
  });
});

describe("Academia · motor",()=>{
  it("bandas 0–59 rescate, 60–79 práctica, ≥80 dominio",()=>{
    expect(bandFor(59.9)?.id).toBe("rescate");expect(bandFor(60)?.id).toBe("practica");expect(bandFor(80)?.id).toBe("dominio");expect(bandFor(null)).toBeNull();
  });
  it("cuenta días hasta el examen sin depender de la hora",()=>{
    expect(daysUntil("2027-04-10",new Date(2027,3,9,23,59))).toBe(1);
    expect(daysUntil("2027-04-17",new Date(2026,9,24,1))).toBe(175);
    expect(daysUntil("mal")).toBeNull();
  });
  it("la siguiente lección salta las completadas y no muestra borradores si el modo revisión está apagado",()=>{
    const progress=progressMap([{lesson_id:"matematicas-m00-l01",status:"completed",revision:2}]);
    expect(nextLessonFor(CATALOG,"matematicas",progress,{showDrafts:true})?.lesson.id).toBe("matematicas-m00-l02");
    expect(nextLessonFor(CATALOG,"matematicas",progress,{showDrafts:false})).toBeNull();
  });
  it("el plan del día pone primero los repasos vencidos y nunca oculta una materia obligatoria",()=>{
    const p=todayPlan(CATALOG,{reviews:[{lesson_id:"castellano-c01-l01",step:0,due_on:"2026-10-23"}],prefs:null,now:new Date(2026,9,24)});
    expect(p.due.map(d=>d.lesson_id)).toEqual(["castellano-c01-l01"]);
    expect([...p.next.map(n=>n.course),...p.blocked.map(b=>b.course)].sort()).toEqual(["castellano","comentario","economia","ingles","matematicas"]);
    expect(dueReviews([{lesson_id:"x",step:0,due_on:"2026-10-25"}],new Date(2026,9,24))).toEqual([]);
  });
  it("dominio por habilidad usa los últimos 10 intentos",()=>{
    const a=[...Array(12)].map((_,i)=>({question_id:"q",lesson_id:"l",course:"matematicas",context:"practice",is_correct:i<10,skill_ids:["s"],created_at:`2026-10-${String(10+i).padStart(2,"0")}T00:00:00Z`}));
    const m=skillMastery(a).get("s")!;
    expect(m.n).toBe(10);expect(m.correct).toBe(8);expect(m.pct).toBe(80);
  });
  it("reparto semanal de 600 min = 10 h según el plan de 24 semanas",()=>{
    const w=weeklyPlan(600,"economia");
    expect(w.find(x=>x.id==="matematicas")?.minutes).toBe(240);
    expect(w.find(x=>x.id==="economia")?.minutes).toBe(120);
    expect(w.reduce((n,x)=>n+x.minutes,0)).toBe(600);
  });
  it("progreso por materia cuenta solo lecciones completadas o dominadas",()=>{
    const c=courseProgress(CATALOG,[{lesson_id:"matematicas-m00-l01",status:"in_progress",revision:1},{lesson_id:"matematicas-m00-l02",status:"mastered",revision:3}]);
    expect(c.find(x=>x.slug==="matematicas")).toMatchObject({done:1,mastered:1,total:56});
  });
  it("perfiles 2026 suman 10 puntos y la autocorrección rechaza valores fuera de rango",()=>{
    for(const p of PROFILES.profiles)expect(profileMax(p),p.id).toBe(10);
    const math=PROFILES.profiles.find(p=>p.id==="math_2026_cat_ref")!;
    const slots=profileSlots(math);
    expect(slots).toHaveLength(5);
    expect(scoreExam(math,{[slots[0]!.id]:"1,5",[slots[4]!.id]:4})).toBe(5.5);
    expect(scoreExam(math,{[slots[0]!.id]:2})).toBeNull();
    expect(scoreExam(math,{[slots[4]!.id]:4},0.3)).toBe(3.7);
  });
  it("Academia queda fuera de producción salvo bandera explícita",()=>{
    expect(academyEnvironmentAllowed({hostEnvironment:"production"})).toBe(false);
    expect(academyEnvironmentAllowed({hostEnvironment:"production",flag:true})).toBe(true);
    expect(academyEnvironmentAllowed({hostEnvironment:"staging"})).toBe(true);
    expect(academyEnvironmentAllowed({releaseTarget:"production"})).toBe(false);
  });
});

describe("Academia · Markdown seguro",()=>{
  it("parsea bloques de ejemplo, solución, tablas, listas numeradas y evaluación",()=>{
    const b=parseBlocks("## 1. Hola\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n4. cuatro\n5. cinco\n\n:::solucion Ver\n1. x\n:::\n\n::evaluacion\n");
    expect(b.map(x=>x.type)).toEqual(["heading","table","list","callout","evaluation"]);
    expect(b[2]).toMatchObject({ordered:true,start:4});
  });
  it("no convierte HTML en marcado y solo enlaza https",()=>{
    const {container}=render(<AcademyMarkdown md={"Texto <img src=x onerror=alert(1)> y [malo](javascript:alert(1)) y [bueno](https://rae.es) con $x^2$"}/>);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("a")?.getAttribute("href")).toBe("https://rae.es");
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(parseInline("\\*literal\\*")).toEqual([{t:"text",v:"*literal*"}]);
  });
  it("renderiza pistas y soluciones plegadas",()=>{
    render(<AcademyMarkdown md={":::pista Primera pista\nPiensa.\n:::"}/>);
    expect(screen.getByText("Primera pista").closest("details")).not.toBeNull();
  });
});

describe("Academia · navegación",()=>{
  it("está registrada y se encuentra por alias",()=>{
    expect(APPS.find(a=>a.id==="academia")).toMatchObject({kind:"live",to:"/academia"});
    expect(searchApps("uoc").map(a=>a.id)).toContain("academia");
  });
});
