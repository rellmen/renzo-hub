import {describe,it,expect,vi} from "vitest";
import {START_DAY,CHAPTERS,FUTURE_STAGES,allTasks,dayOffset,pathMetrics,tasksForWeek,weekForDate,weekStart,setPathTask,loadPathProgress} from "../lib/career-path.mjs";

const uid="22222222-2222-4222-8222-222222222222";
describe("Career / DataLab roadmap 2026–2032",()=>{
 it("starts 26 October 2026, keeps six chapters of four weeks and official exam week",()=>{
  expect(START_DAY).toBe("2026-10-26");
  expect(CHAPTERS).toHaveLength(6);
  expect(FUTURE_STAGES).toHaveLength(6);
  expect(weekStart(0)).toBe("2026-10-26");
  expect(weekStart(23)).toBe("2027-04-05");
  expect(dayOffset(weekStart(23),6)).toBe("2027-04-11");
  expect(weekForDate("2026-10-24")).toBe(0);
  expect(weekForDate("2027-04-11")).toBe(23);
 });
 it("generates 264 unique tasks across 24 weeks without creating false credit",()=>{
  const items=allTasks(),ids=new Set(items.map(t=>t.id));
  expect(items).toHaveLength(264);
  expect(ids.size).toBe(264);
  expect(items.every(t=>t.day>="2026-10-26"&&t.day<="2027-04-11")).toBe(true);
  expect(pathMetrics([])).toEqual({done:0,total:264,percent:0,completeWeeks:0});
 });
 it("respects the weekly study budget, the Sunday review and the Friday off",()=>{
  const tasks=tasksForWeek(0);
  expect(tasks.reduce((s,t)=>s+t.minutes,0)).toBe(750); // 12h subjects + 30min review
  const totals=Object.fromEntries(["Matemáticas","Economía","Castellano","Comentario de texto","Inglés","Revisión semanal"].map(subject=>[subject,tasks.filter(t=>t.subject===subject).reduce((s,t)=>s+t.minutes,0)]));
  expect(totals).toEqual({"Matemáticas":240,"Economía":180,"Castellano":120,"Comentario de texto":90,"Inglés":90,"Revisión semanal":30});
  expect(tasks.some(t=>t.weekday===4)).toBe(false);
  expect(tasks.filter(t=>t.weekday===6).some(t=>t.subject==="Revisión semanal")).toBe(true);
 });
 it("only credits persisted rows with matching roadmap task IDs; no global XP",()=>{
  const first=tasksForWeek(0)[0];
  const rows=[{id:"a",owner_id:uid,status:"completed",updated_at:"2026-10-26T00:00:00Z",payload:{taskId:first.id}},
   {id:"b",owner_id:uid,status:"completed",updated_at:"2026-10-26T00:00:00Z",payload:{taskId:"invented"}}];
  expect(pathMetrics(rows).done).toBe(1);
  expect(pathMetrics(rows).percent).toBe(0);
  expect(pathMetrics(rows).completeWeeks).toBe(0);
 });
 it("disallows ticking future tasks without saving anything",async()=>{
  vi.useFakeTimers();
  try{
   vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
   let touched=false;
   const client={from:()=>{touched=true;return {};}};
   await expect(setPathTask(client,uid,tasksForWeek(23)[0],true)).rejects.toThrow("Todavía no");
   expect(touched).toBe(false);
  }finally{vi.useRealTimers();}
 });
 it("rejects cross-account rows and keeps user_id scoping in the read",async()=>{
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
