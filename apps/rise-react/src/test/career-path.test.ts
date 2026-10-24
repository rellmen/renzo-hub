import {describe,it,expect,vi} from "vitest";
import {START_DAY,CHAPTERS,FUTURE_STAGES,BOSSES,MILESTONES,allTasks,dayOffset,pathMetrics,tasksForWeek,tasksForDay,weekForDate,weekStart,
  setPathTask,saveItemSteps,loadPathProgress,itemState,autoSteps,todayView,studyWindow,findItem} from "../lib/career-path.mjs";

const uid="22222222-2222-4222-8222-222222222222";
const row=(taskId:string,steps:string[],status="open")=>({id:"r-"+taskId,owner_id:uid,status,updated_at:"2026-10-26T00:00:00Z",payload:{taskId,steps}});

describe("Roadmap 2026–2032 · estructura",()=>{
 it("empieza el 26-10-2026 con 6 fases de 4 semanas y los exámenes del 10 y 17 de abril",()=>{
  expect(START_DAY).toBe("2026-10-26");
  expect(CHAPTERS).toHaveLength(6);
  expect(FUTURE_STAGES).toHaveLength(6);
  expect(BOSSES.map(m=>m.day)).toEqual(["2027-04-10","2027-04-17"]);
  expect(weekStart(23)).toBe("2027-04-05");
  expect(dayOffset(weekStart(23),6)).toBe("2027-04-11");
  expect(weekForDate("2026-10-24")).toBe(0);
 });
 it("264 sesiones + 2 exámenes con IDs únicos y cada tarea con subtareas",()=>{
  const items=allTasks();
  expect(items).toHaveLength(266);
  expect(new Set(items.map(t=>t.id)).size).toBe(266);
  expect(items.every(t=>t.steps.length>=2)).toBe(true);
  expect(new Set(MILESTONES.map(m=>m.id)).size).toBe(MILESTONES.length);
  expect(MILESTONES.every(m=>m.steps.length>=2&&/^\d{4}-\d{2}-\d{2}$/.test(m.due))).toBe(true);
 });
 it("semana de 12 h + 30 min con Física en lugar de Economía y viernes libre",()=>{
  const tasks=tasksForWeek(0);
  expect(tasks.reduce((s,t)=>s+t.minutes,0)).toBe(750);
  const totals=Object.fromEntries(["Matemáticas","Física","Castellano","Comentario de texto","Inglés","Revisión semanal"].map(x=>[x,tasks.filter(t=>t.subject===x).reduce((s,t)=>s+t.minutes,0)]));
  expect(totals).toEqual({"Matemáticas":240,"Física":180,"Castellano":120,"Comentario de texto":90,"Inglés":90,"Revisión semanal":30});
  expect(allTasks().some(t=>t.subject==="Economía")).toBe(false);
  expect(tasks.some(t=>t.weekday===4)).toBe(false);
  expect(BOSSES[1]!.title).toMatch(/Física/);
 });
});

describe("Subtareas y progreso",()=>{
 const math=tasksForDay("2026-10-26")[0]!;
 it("una tarea se completa cuando todos sus pasos están hechos, guardados o automáticos",()=>{
  expect(math.subject).toBe("Matemáticas");
  expect(itemState(math,row(math.id,["practica"])).doneSteps).toBe(1);
  expect(itemState(math,row(math.id,["practica","errores"])).done).toBe(false);
  const auto=autoSteps(math,[{lesson_id:"matematicas-m00-l01",status:"completed",completed_at:new Date(2026,9,26,18).toISOString()}]);
  expect([...auto]).toEqual(["leccion"]);
  expect(itemState(math,row(math.id,["practica","errores"]),auto).done).toBe(true);
  // Una lección de otro día u otra materia no cuenta.
  expect(autoSteps(math,[{lesson_id:"matematicas-m00-l01",status:"completed",completed_at:new Date(2026,9,25,18).toISOString()}]).size).toBe(0);
  expect(autoSteps(math,[{lesson_id:"fisica-f00-l01",status:"completed",completed_at:new Date(2026,9,26,18).toISOString()}]).size).toBe(0);
 });
 it("solo acredita filas con IDs del roadmap y mide el KPI de sesiones vencidas",()=>{
  const rows=[row(math.id,["leccion","practica","errores"]),row("inventada",["x"],"completed")];
  const m=pathMetrics(rows,{today:"2026-10-27"});
  expect(m.done).toBe(1);
  expect(m.due).toBe(2);
  expect(m.dueDone).toBe(1);
  expect(m.sessionRate).toBe(50);
  expect(pathMetrics([],{today:"2026-10-24"}).sessionRate).toBe(null);
 });
 it("Inicio: tareas de hoy, atrasadas de la semana y próximo hito",()=>{
  const before=todayView([],{today:"2026-10-24"});
  expect(before.beforeStart).toBe(true);
  expect(before.todayItems).toHaveLength(0);
  expect(before.nextDay).toBe("2026-10-26");
  expect(before.nextItems.map(t=>t.subject)).toEqual(["Matemáticas"]);
  expect(before.nextMilestone?.id).toBe("h-tablero");
  const wed=todayView([row(math.id,["leccion","practica","errores"])],{today:"2026-10-28"});
  expect(wed.todayItems.map(t=>t.subject)).toEqual(["Matemáticas"]);
  expect(wed.overdue.map(t=>t.subject)).toEqual(["Física"]);
  expect(wed.weekDone).toBe(1);
 });
 it("franja de estudio según turno (roadmap §8)",()=>{
  expect(studyWindow("Morning Shift","2026-10-26").deep).toBe("16:30–18:00");
  expect(studyWindow("Evening Shift","2026-10-26").deep).toBe("09:00–10:30");
  expect(studyWindow("Morning Shift","2026-10-31").label).toBe("Fin de semana");
 });
});

describe("Guardado",()=>{
 it("no permite marcar tareas futuras ni toca la base de datos",async()=>{
  vi.useFakeTimers();
  try{
   vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
   let touched=false;
   const client={from:()=>{touched=true;return {};}};
   await expect(setPathTask(client,uid,tasksForWeek(23)[0]!,true)).rejects.toThrow("Todavía no");
   expect(touched).toBe(false);
  }finally{vi.useRealTimers();}
 });
 it("los hitos se pueden marcar antes de su fecha límite y filtra pasos desconocidos",async()=>{
  let inserted:any=null;
  const client={from:()=>({insert(v:any){inserted=v;return this;},select(){return this;},async single(){return{data:{...inserted,updated_at:"x"},error:null};}})};
  const h=findItem("h-asml")!;
  await saveItemSteps(client,uid,h,["pedir","inventado"]);
  expect(inserted.payload.steps).toEqual(["pedir"]);
  expect(inserted.status).toBe("open");
  expect(inserted.record_type).toBe("career_path_tick");
 });
 it("rechaza filas de otra cuenta y filtra por propietario",async()=>{
  const calls:string[]=[];
  const client={from:(table:string)=>{calls.push(table);return{
   select(){return this;},eq(field:string,value:string){calls.push(field+"="+value);return this;},
   order(){return this;},async range(){return{data:[{id:"a",owner_id:"33333333-3333-4333-8333-333333333333"}],error:null};}
  };}};
  await expect(loadPathProgress(client,uid)).rejects.toThrow("otra cuenta");
  expect(calls).toContain("owner_id="+uid);
  expect(calls).toContain("record_type=career_path_tick");
 });
});
