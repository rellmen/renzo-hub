import {describe,it,expect,vi} from "vitest";
import {
 normalizePriority,sortPriorityTasks,validatePriorityInput,parsePriorityProposal,uniquePriorityProposals,
 createPriorityTask,patchPriorityTask
} from "../lib/priority-records.mjs";

const uid="22222222-2222-4222-8222-222222222222";
const item=(title:string,urgency:string,dueDate:string,status="Backlog")=>({id:title,title,urgency,dueDate,status,_cloudUpdatedAt:"2026-10-27T00:00:00Z"});
describe("RISE PRIORITY · orden y plazos",()=>{
 it("prioriza P0 y vencidas, mantiene completadas al final",()=>{
   const tasks=[item("media","P2","2026-10-27"),item("emergencia","P0","2026-10-28"),
    item("vencida","P0","2026-10-26"),item("terminada","P0","2026-10-20","Completed")];
   expect(sortPriorityTasks(tasks,"2026-10-27").map(x=>x.title)).toEqual(["vencida","emergencia","media","terminada"]);
 });
 it("muestra P1 a las tareas High existentes sin inventar deadline",()=>{
   expect(normalizePriority({priority:"High"})).toMatchObject({urgency:"P1",dueDate:"",origin:"manual"});
 });
 it("rechaza días inventados y acepta vencimientos no obligatorios",()=>{
   expect(()=>validatePriorityInput({title:"Tarea",dueDate:"2026-02-30"})).toThrow();
   expect(validatePriorityInput({title:"  Estudiar ",urgency:"P2",dueDate:"2026-11-08"})).toMatchObject({title:"Estudiar",dueDate:"2026-11-08"});
 });
});
describe("Importación revisada de asistentes",()=>{
 it("solo acepta JSON estructurado y evita propuestas repetidas",()=>{
   const payload=JSON.stringify({tasks:[{title:"SQL",urgency:"P2",dueDate:"2026-11-08",origin:"claude"},
     {title:"SQL",urgency:"P2",dueDate:"2026-11-08",origin:"chatgpt"}, {title:"CV",urgency:"P1"}]});
   expect(uniquePriorityProposals(parsePriorityProposal(payload),[item("Otra","P2","")])).toHaveLength(2);
   expect(()=>parsePriorityProposal("Haz esto ahora")).toThrow();
   expect(()=>parsePriorityProposal(JSON.stringify({tasks:Array(11).fill({title:"x"})}))).toThrow();
 });
 it("un JSON importado no guarda registros por sí solo",()=>{
   const p=parsePriorityProposal(JSON.stringify({tasks:[{title:"Revisar CV"}]}));
   expect(p[0].title).toBe("Revisar CV");
 });
});
describe("Supabase: restricciones al actualizar",()=>{
 it("usa usuario + dominio + tipo + CAS y preserva el payload",async()=>{
   const calls:any[]=[];
   const query:any={update(v:any){calls.push(["update",v]);return this;},eq(k:string,v:any){calls.push(["eq",k,v]);return this;},
     select(v:string){calls.push(["select",v]);return this;},maybeSingle(){return Promise.resolve({data:{id:"task"},error:null});}};
   const client={from:vi.fn(()=>query)};
   await patchPriorityTask(client,uid,{...item("SQL","P2","2026-11-08"),otherField:"preserved"},{status:"Completed"});
   expect(client.from).toHaveBeenCalledWith("hub_records");
   expect(calls).toContainEqual(["eq","owner_id",uid]);
   expect(calls).toContainEqual(["eq","domain","work"]);
   expect(calls).toContainEqual(["eq","record_type","renzo_task"]);
   expect(calls).toContainEqual(["eq","updated_at","2026-10-27T00:00:00Z"]);
   expect(calls[0][1].payload.otherField).toBe("preserved");
 });
 it("inserta sólo tras una acción explícita y sin marcar completada",async()=>{
   const calls:any[]=[];
   const query:any={insert(v:any){calls.push(v);return this;},select(){return this;},single(){return Promise.resolve({data:{id:"new"},error:null});}};
   await createPriorityTask({from:()=>query},uid,{title:"Presentar IVA",urgency:"P0",deadlineType:"real",dueDate:"2026-10-31"});
   expect(calls[0].record_type).toBe("renzo_task");
   expect(calls[0].source).toBe("manual");
   expect(calls[0].payload.status).toBe("Backlog");
   expect(calls[0].payload.deadlineType).toBe("real");
 });
});
