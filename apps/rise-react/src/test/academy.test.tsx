import {describe,expect,it,vi} from "vitest";
import {readFileSync,readdirSync} from "node:fs";
import {join} from "node:path";
import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {parseBlocks,parseInline} from "@/lib/academy/markdown.mjs";
import {bandFor,courseProgress,daysUntil,dueReviews,nextLessonFor,profileMax,profileSlots,progressMap,scoreExam,skillMastery,todayPlan,weeklyPlan,academyEnvironmentAllowed} from "@/lib/academy/engine.mjs";
import {CATALOG,BANK,PROFILES,MOCKS,mockMax} from "@/lib/academy/content";
import {AcademyMocks} from "@/components/rise/academy/AcademyMocks";
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
  it("informa estados editoriales reales: nada publicado y 131 lecciones del temario (con Llengua catalana)",()=>{
    expect(CATALOG.stats.lessons_total).toBe(131);
    expect(CATALOG.stats.by_status["published"]).toBe(0);
    expect(CATALOG.stats.by_status["planned"]!+CATALOG.stats.by_status["draft"]!).toBe(131);
    const cat=CATALOG.courses.find(c=>c.slug==="catalan")!;
    expect(cat.role).toBe("general");
    expect(cat.modules.flatMap(m=>m.lessons).every(l=>l.has_content&&l.meets_standard)).toBe(true);
    expect(CATALOG.stats.meets_standard).toBeGreaterThanOrEqual(10);
    expect(BANK.length).toBe(56);
    expect(CATALOG.elective.chosen).toBe("economia"); // opción 2, 01-11-2026
    expect(CATALOG.elective.confirmed).toBe(true);
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
    expect([...p.next.map(n=>n.course),...p.blocked.map(b=>b.course)].sort()).toEqual(["castellano","catalan","comentario","economia","ingles","matematicas"]);
    const legacy=todayPlan(CATALOG,{prefs:{elective:"fisica"} as never,now:new Date(2026,9,24)});
    expect([...legacy.next.map(n=>n.course),...legacy.blocked.map(b=>b.course)]).toContain("fisica");
    expect(dueReviews([{lesson_id:"x",step:0,due_on:"2026-10-25"}],new Date(2026,9,24))).toEqual([]);
  });
  it("dominio por habilidad usa los últimos 10 intentos",()=>{
    const a=[...Array(12)].map((_,i)=>({question_id:"q",lesson_id:"l",course:"matematicas",context:"practice",is_correct:i<10,skill_ids:["s"],created_at:`2026-10-${String(10+i).padStart(2,"0")}T00:00:00Z`}));
    const m=skillMastery(a).get("s")!;
    expect(m.n).toBe(10);expect(m.correct).toBe(8);expect(m.pct).toBe(80);
  });
  it("reparto semanal por defecto = 13 h del roadmap (opción 2, con catalán)",()=>{
    const w=weeklyPlan(780);
    expect(Object.fromEntries(w.map(x=>[x.id,x.minutes]))).toEqual({matematicas:210,economia:180,catalan:90,castellano:90,comentario:90,ingles:90,repaso:30});
    expect(weeklyPlan(0).reduce((n,x)=>n+x.minutes,0)).toBe(780);
    expect(weeklyPlan(780,"fisica").find(x=>x.id==="fisica")?.minutes).toBe(180);
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

describe("Academia · simulacros",()=>{
  it("el bundle de simulacros no contiene claves, soluciones ni rúbricas",()=>{
    const t=readFileSync(join(dir,"mocks.json"),"utf8");
    expect(t).not.toMatch(/"(key|solution_md|rubric_md|correct|units|display|tol_abs|tol_rel|accepted)"/);
  });
  it("hay un simulacro por materia de la ruta y cada uno vale 10 puntos",()=>{
    expect(MOCKS.map(m=>m.course).sort()).toEqual(["castellano","comentario","economia","fisica","ingles","matematicas"]);
    expect(MOCKS.find(m=>m.course==="economia")!.sections[0]!.choose).toBe(4);
    for(const m of MOCKS)expect(mockMax(m),m.mock_id).toBe(10);
    expect(MOCKS.find(m=>m.course==="fisica")!.sections.flatMap(s=>s.groups.flatMap(g=>g.items)).filter(i=>i.kind==="numeric").every(i=>i.unit_required)).toBe(true);
  });
  const base={client_session_id:"c",content_version:1,duration_minutes:90,answers:{},chosen:{},revision:1,submitted_at:null,late_answers_ignored:false,auto_score:null,result:null,self_scores:null,total_score:null,graded_at:null};
  it("no deja elegir más cuestiones de las permitidas",()=>{
    const now=new Date();
    const s={...base,id:"s1",mock_id:"s1-matematicas",course:"matematicas",status:"in_progress" as const,started_at:now.toISOString(),deadline_at:new Date(now.getTime()+3600e3).toISOString(),server_now:now.toISOString()};
    render(<AcademyMocks client={null} mocks={[s]} available elective="fisica" onChanged={()=>{}}/>);
    const boxes=screen.getAllByRole("checkbox",{name:"Elegir"});
    expect(boxes).toHaveLength(8);
    for(const b of boxes.slice(0,4))fireEvent.click(b);
    expect(boxes[4]).toBeDisabled();
    expect(screen.getByText(/Elegidas: 4 de 4/)).toBeInTheDocument();
    expect(screen.getByRole("timer")).toBeInTheDocument();
  });
  it("al agotarse el tiempo entrega sola con lo que hay en pantalla",async()=>{
    const rpc=vi.fn().mockResolvedValue({data:{auto_score:0},error:null});
    const past=new Date(Date.now()-1000).toISOString();
    const s={...base,id:"s2",mock_id:"s1-ingles",course:"ingles",status:"in_progress" as const,started_at:past,deadline_at:past,server_now:new Date().toISOString(),answers:{e1:{choice:"b"}}};
    const onChanged=vi.fn();
    render(<AcademyMocks client={{rpc} as never} mocks={[s]} available elective="fisica" onChanged={onChanged}/>);
    await waitFor(()=>expect(rpc).toHaveBeenCalledWith("academy_mock_submit",{p_session_id:"s2",p_answers:{e1:{choice:"b"}},p_chosen:{}}));
    await waitFor(()=>expect(onChanged).toHaveBeenCalled());
  });
  it("la autocorrección rechaza notas fuera de rango y aplica la penalización de palabras en la vista previa",()=>{
    const result={session_id:"s3",mock_id:"s1-comentario",auto_score:3,open_max:7,late_answers_ignored:false,needs_self_score:true,
      groups:[{section_id:"p1",group_id:"b1",chosen:true,auto_score:3,auto_max:3,open_max:0},{section_id:"p1",group_id:"b2",chosen:true,auto_score:0,auto_max:0,open_max:3},{section_id:"p2",group_id:"oa",chosen:true,auto_score:0,auto_max:0,open_max:4}],
      items:{q21:{group_id:"b2",kind:"open" as const,status:"open" as const,max:1,solution_md:"s",rubric_md:"r"},
        ea:{group_id:"oa",kind:"open" as const,status:"open" as const,max:4,solution_md:"s",rubric_md:"r",word_count:120,word_min:150,word_max:200,word_penalty:0.5}}};
    const s={...base,id:"s3",mock_id:"s1-comentario",course:"comentario",status:"submitted" as const,started_at:"2026-10-24T10:00:00Z",deadline_at:"2026-10-24T11:30:00Z",submitted_at:"2026-10-24T11:00:00Z",auto_score:3,result};
    render(<AcademyMocks client={null} mocks={[s]} available elective="fisica" onChanged={()=>{}}/>);
    fireEvent.click(screen.getByRole("button",{name:/Autocorregir/}));
    const inputs=screen.getAllByRole("textbox",{name:/Tu nota/});
    fireEvent.change(inputs[0]!,{target:{value:"1"}});
    fireEvent.change(inputs[1]!,{target:{value:"3"}});
    expect(screen.getByRole("button",{name:/Guardar mi nota \(6,5\)/})).toBeInTheDocument();
    fireEvent.change(inputs[1]!,{target:{value:"5"}});
    expect(screen.getByText(/fuera de rango/)).toBeInTheDocument();
    expect(screen.getByText(/120 palabras · fuera de 150–200: −0,5/)).toBeInTheDocument();
  });
});
