import {describe,it,expect,vi} from "vitest";
import {
 normalizePriority,sortPriorityTasks,validatePriorityInput,parsePriorityProposal,uniquePriorityProposals,
 createPriorityTask,patchPriorityTask,findPriorityTask,persistProposal,reviewPriorityProposals,proposalBlockers,
 reopenStatusFor,riseToday,PriorityConflictError,WORK_LOAD_LIMIT,type Urgency,type PriorityTask
} from "../lib/priority-records.mjs";
import {loadWorkRecords} from "../lib/work-records.mjs";

const uid="22222222-2222-4222-8222-222222222222";
const stamp="2026-10-27T00:00:00Z";
const item=(title:string,urgency:Urgency,dueDate:string,status="Backlog"):PriorityTask=>
 ({id:title,title,urgency,dueDate,status,_cloudUpdatedAt:stamp});

// Minimal chainable Supabase double: records every call; `result` decides what the terminal call resolves to.
type Call=[string,...unknown[]];
function fakeClient(results:Array<{data:unknown;error:null|{message:string;code?:string}}>){
 const calls:Call[]=[];
 const next=()=>Promise.resolve(results.shift()??{data:null,error:null});
 const query={
  insert(v:unknown){calls.push(["insert",v]);return query;},
  update(v:unknown){calls.push(["update",v]);return query;},
  select(v?:unknown){calls.push(["select",v]);return query;},
  eq(k:string,v:unknown){calls.push(["eq",k,v]);return query;},
  single(){calls.push(["single"]);return next();},
  maybeSingle(){calls.push(["maybeSingle"]);return next();},
 };
 return {calls,client:{from:vi.fn((table:string)=>{calls.push(["from",table]);return query;})}};
}
const row=(over:Record<string,unknown>={})=>({id:"33333333-3333-4333-8333-333333333333",title:"SQL",status:"Backlog",
 updated_at:"2026-10-27T10:00:00Z",owner_id:uid,domain:"work",record_type:"renzo_task",occurred_at:stamp,
 payload:{id:"33333333-3333-4333-8333-333333333333",title:"SQL",status:"Backlog",priority:"Normal",...over}});

describe("RISE PRIORITY · orden y plazos",()=>{
 it("prioriza P0 y vencidas, mantiene completadas al final",()=>{
   const tasks=[item("media","P2","2026-10-27"),item("emergencia","P0","2026-10-28"),
    item("vencida","P0","2026-10-26"),item("terminada","P0","2026-10-20","Completed")];
   expect(sortPriorityTasks(tasks,"2026-10-27").map(x=>x.title)).toEqual(["vencida","emergencia","media","terminada"]);
 });
 it("dentro de un nivel: vencidas, fecha ascendente, sin fecha al final y empate por título; una P3 vencida no sube",()=>{
   const tasks=[item("b sin fecha","P2",""),item("a sin fecha","P2",""),item("pronto","P2","2026-10-30"),
    item("hoy","P2","2026-10-27"),item("vencida","P2","2026-10-01"),item("p3 vencida","P3","2026-01-01")];
   expect(sortPriorityTasks(tasks,"2026-10-27").map(x=>x.title))
    .toEqual(["vencida","hoy","pronto","a sin fecha","b sin fecha","p3 vencida"]);
 });
 it("muestra P1 a las tareas High/Strategic existentes sin inventar deadline",()=>{
   expect(normalizePriority({priority:"High"})).toMatchObject({urgency:"P1",dueDate:"",origin:"manual",why:""});
   expect(normalizePriority({priority:"Strategic"}).urgency).toBe("P1");
   expect(normalizePriority({priority:"Normal"}).urgency).toBe("P2");
 });
});

describe("Fechas civiles en Europe/Amsterdam",()=>{
 it("usa el día de Ámsterdam alrededor de medianoche, no el del dispositivo ni UTC",()=>{
   expect(riseToday(new Date("2026-10-24T21:59:00Z"))).toBe("2026-10-24"); // 23:59 CEST
   expect(riseToday(new Date("2026-10-24T22:00:00Z"))).toBe("2026-10-25"); // 00:00 CEST
 });
 it("sigue el cambio de hora de octubre y de marzo",()=>{
   expect(riseToday(new Date("2026-10-25T22:59:00Z"))).toBe("2026-10-25"); // 23:59 CET, tras el cambio
   expect(riseToday(new Date("2026-10-25T23:00:00Z"))).toBe("2026-10-26");
   expect(riseToday(new Date("2026-03-28T23:00:00Z"))).toBe("2026-03-29"); // 00:00 CET, noche del cambio
   expect(riseToday(new Date("2026-03-29T21:59:00Z"))).toBe("2026-03-29"); // 23:59 CEST
 });
 it("acepta bisiestos reales y rechaza días inventados, sufijos y tipos raros sin reinterpretarlos",()=>{
   const ok={title:"Tarea",why:"motivo"};
   expect(validatePriorityInput({...ok,dueDate:"2028-02-29"}).dueDate).toBe("2028-02-29");
   for(const dueDate of ["2026-02-29","2026-02-30","2026-11-08T00:00","2026-11-08 ","2026-1-8","08/11/2026"])
    expect(()=>validatePriorityInput({...ok,dueDate}),dueDate).toThrow();
   expect(()=>validatePriorityInput({...ok,dueDate:20261108 as never})).toThrow();
 });
});

describe("Validación estricta del contrato",()=>{
 const base={title:"Estudiar",why:"Preparar entrevista"};
 it("rechaza enums inválidos en lugar de convertirlos a valores por defecto",()=>{
   expect(()=>validatePriorityInput({...base,urgency:"P9" as never})).toThrow(/prioridad/i);
   expect(()=>validatePriorityInput({...base,deadlineType:"urgente" as never})).toThrow();
   expect(()=>validatePriorityInput({...base,origin:"gemini" as never})).toThrow();
 });
 it("rechaza tipos inesperados y textos demasiado largos en vez de recortarlos",()=>{
   expect(()=>validatePriorityInput(null as never)).toThrow();
   expect(()=>validatePriorityInput({title:42 as never,why:"x"})).toThrow();
   expect(()=>validatePriorityInput({...base,title:"x".repeat(181)})).toThrow(/180/);
   expect(()=>validatePriorityInput({...base,why:"x".repeat(401)})).toThrow(/400/);
 });
 it("exige motivo en altas y asignaciones de prioridad",()=>{
   expect(()=>validatePriorityInput({title:"Sin motivo"})).toThrow(/motivo|por qué/i);
   expect(()=>validatePriorityInput({title:"Sin motivo",why:"   "})).toThrow();
   expect(validatePriorityInput({title:"  Estudiar ",why:" Entrevista ",dueDate:"2026-11-08"}))
    .toMatchObject({title:"Estudiar",why:"Entrevista",dueDate:"2026-11-08",urgency:"P2",deadlineType:"interna"});
 });
 it("un plazo externo exige fecha, evidencia y comprobación humana",()=>{
   expect(()=>validatePriorityInput({...base,deadlineType:"real"})).toThrow(/externo/i);
   expect(()=>validatePriorityInput({...base,deadlineType:"real",dueDate:"2026-10-31"})).toThrow(/externo/i);
   expect(()=>validatePriorityInput({...base,deadlineType:"real",dueDate:"2026-10-31",evidenceSummary:"Carta de Hacienda"})).toThrow();
   expect(validatePriorityInput({...base,deadlineType:"real",dueDate:"2026-10-31",evidenceSummary:"Carta de Hacienda",
    evidenceCheckedAt:"2026-10-27T17:00:00.000Z"})).toMatchObject({deadlineType:"real",evidenceSummary:"Carta de Hacienda"});
 });
 it("solo admite referencias de fuente como texto breve o https",()=>{
   expect(validatePriorityInput({...base,sourceRef:"Conversación del 27-10"}).sourceRef).toBe("Conversación del 27-10");
   expect(validatePriorityInput({...base,sourceRef:"https://example.org/plazo"}).sourceRef).toBe("https://example.org/plazo");
   expect(()=>validatePriorityInput({...base,sourceRef:"javascript://alert(1)"})).toThrow();
   expect(()=>validatePriorityInput({...base,sourceRef:"http://example.org"})).toThrow();
   expect(()=>validatePriorityInput({...base,proposalId:"id con espacios"})).toThrow();
 });
});

describe("Importación revisada de asistentes",()=>{
 it("solo acepta JSON estructurado y evita propuestas repetidas",()=>{
   const payload=JSON.stringify({tasks:[{title:"SQL",urgency:"P2",dueDate:"2026-11-08",origin:"claude"},
     {title:"SQL",urgency:"P2",dueDate:"2026-11-08",origin:"chatgpt"}, {title:"CV",urgency:"P1"}]});
   expect(uniquePriorityProposals(parsePriorityProposal(payload),[item("Otra","P2","")])).toHaveLength(2);
 });
 it("rechaza JSON roto, null, array raíz, 0/11 tareas, exceso de tamaño, enums y campos no admitidos",()=>{
   const bad=["Haz esto ahora","null","[]",JSON.stringify([{title:"x"}]),JSON.stringify({tasks:[]}),
    JSON.stringify({tasks:Array(11).fill({title:"x"})}),JSON.stringify({tasks:[null]}),JSON.stringify({tasks:"x"}),
    JSON.stringify({tasks:[{title:"x",urgency:"urgente"}]}),JSON.stringify({tasks:[{title:"x",run:"rm -rf"}]}),
    JSON.stringify({tasks:[{title:"x"}],execute:true}),"x".repeat(15001)];
   for(const raw of bad)expect(()=>parsePriorityProposal(raw),raw.slice(0,40)).toThrow();
 });
 it("acepta el protocolo ampliado y no se fía de la fecha de comprobación que manda el asistente",()=>{
   const [p]=parsePriorityProposal(JSON.stringify({tasks:[{title:"Preparar SQL",urgency:"P2",dueDate:"2026-11-08",
    deadlineType:"interna",why:"Entrevistas",origin:"claude",proposalId:"ejemplo-sql-20261027-01",
    sourceRef:"Referencia manual",evidenceSummary:"Objetivo personal",evidenceCheckedAt:"2026-10-27T10:00:00Z"}]}));
   expect(p).toMatchObject({proposalId:"ejemplo-sql-20261027-01",sourceRef:"Referencia manual",evidenceSummary:"Objetivo personal",evidenceCheckedAt:""});
 });
 it("prepara la revisión con bloqueos, duplicados y UUID estable sin escribir nada",()=>{
   const raw=JSON.stringify({tasks:[
    {title:"Presentar IVA",urgency:"P0",deadlineType:"real",dueDate:"2026-10-31",why:"Multa",evidenceCheckedAt:"2026-10-27T10:00:00Z"},
    {title:"Sin motivo",urgency:"P3"},
    {title:"Existente",dueDate:"2026-11-01",why:"x"},
    {title:"  SIN MOTIVO ",urgency:"P3"}]});
   const review=reviewPriorityProposals(raw,[item("Existente","P2","2026-11-01")]);
   expect(review).toHaveLength(4);
   expect(new Set(review.map(r=>r.id)).size).toBe(4);
   for(const r of review)expect(r.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
   expect(review[0]!.claimedCheckedAt).toBe("2026-10-27T10:00:00Z");
   expect(proposalBlockers(review[0]!).join(" ")).toMatch(/externo/i);
   expect(proposalBlockers(review[1]!).join(" ")).toMatch(/motivo/i);
   expect(proposalBlockers(review[1]!).join(" ")).toMatch(/fecha/i);
   expect(proposalBlockers({...review[1]!,noDateConfirmed:true,input:{...review[1]!.input,why:"ok"}})).toEqual([]);
   expect(review[2]!.duplicateOf).toMatchObject({title:"Existente"});
   expect(review[2]!.selected).toBe(false);
   expect(review[3]!.duplicateOf).toBe("batch");
   expect(review[1]!.warnings.join(" ")).toMatch(/Origen no declarado/);
   expect(review[2]!.warnings.join(" ")).toMatch(/Prioridad no indicada|Origen/);
 });
});

describe("Supabase: altas, cambios y conflictos",()=>{
 it("usa usuario + dominio + tipo + CAS y preserva el payload y la prioridad Work",async()=>{
   const {client,calls}=fakeClient([{data:row(),error:null}]);
   await patchPriorityTask(client,uid,{...item("SQL","P2","2026-11-08"),priority:"Strategic",otherField:"preserved",
     project:"Data",_local:true} as PriorityTask,{status:"Completed"});
   expect(client.from).toHaveBeenCalledWith("hub_records");
   expect(calls).toContainEqual(["eq","owner_id",uid]);
   expect(calls).toContainEqual(["eq","domain","work"]);
   expect(calls).toContainEqual(["eq","record_type","renzo_task"]);
   expect(calls).toContainEqual(["eq","updated_at",stamp]);
   const sent=(calls.find(c=>c[0]==="update")![1] as {payload:Record<string,unknown>}).payload;
   expect(sent).toMatchObject({otherField:"preserved",priority:"Strategic",project:"Data",status:"Completed",reopenStatus:"Backlog"});
   expect(sent).not.toHaveProperty("_cloudUpdatedAt");
   expect(sent).not.toHaveProperty("_local");
 });
 it("cambiar solo el estado no persiste la prioridad deducida al leer",async()=>{
   const {client,calls}=fakeClient([{data:row(),error:null}]);
   await patchPriorityTask(client,uid,{id:"t",title:"Antigua",status:"Today",priority:"High",_cloudUpdatedAt:stamp},{status:"Completed"});
   const sent=(calls.find(c=>c[0]==="update")![1] as {payload:Record<string,unknown>}).payload;
   expect(sent).not.toHaveProperty("urgency");
   expect(sent["priority"]).toBe("High");
 });
 it("al editar exige motivo y guarda la evidencia aparte sin tocar la prioridad Work",async()=>{
   const {client,calls}=fakeClient([{data:row(),error:null}]);
   await expect(patchPriorityTask(client,uid,{id:"t",title:"Antigua",status:"Today",priority:"High",_cloudUpdatedAt:stamp},{urgency:"P0"}))
    .rejects.toThrow(/motivo|por qué/i);
   await patchPriorityTask(client,uid,{id:"t",title:"Antigua",status:"Today",priority:"High",_cloudUpdatedAt:stamp},
    {urgency:"P0",why:"Bloquea la nómina",deadlineType:"real",dueDate:"2026-10-31",evidenceSummary:"Correo de SD Worx",
     evidenceCheckedAt:"2026-10-27T17:00:00.000Z"});
   const sent=(calls.find(c=>c[0]==="update")![1] as {payload:Record<string,unknown>}).payload;
   expect(sent).toMatchObject({urgency:"P0",priority:"High",why:"Bloquea la nómina",
    proposalEvidence:{evidenceSummary:"Correo de SD Worx",evidenceCheckedAt:"2026-10-27T17:00:00.000Z"}});
   expect(sent).not.toHaveProperty("evidenceSummary");
 });
 it("reabrir devuelve la tarea a su estado anterior, o a Today si no se conoce",()=>{
   expect(reopenStatusFor({status:"Completed",reopenStatus:"Waiting"})).toBe("Waiting");
   expect(reopenStatusFor({status:"Completed"})).toBe("Today");
   expect(reopenStatusFor({status:"Completed",reopenStatus:"Completed"})).toBe("Today");
 });
 it("cero filas actualizadas es conflicto con la versión remota, nunca éxito",async()=>{
   const {client}=fakeClient([{data:null,error:null},{data:row({title:"Cambiada en el móvil"}),error:null}]);
   const err=await patchPriorityTask(client,uid,item("SQL","P2",""),{status:"Completed"}).catch(e=>e);
   expect(err).toBeInstanceOf(PriorityConflictError);
   expect(err.remote).toMatchObject({title:"SQL",_cloudUpdatedAt:"2026-10-27T10:00:00Z"});
 });
 it("si la tarea ya no existe lo dice, en vez de hablar de conflicto",async()=>{
   const {client}=fakeClient([{data:null,error:null},{data:null,error:null}]);
   await expect(patchPriorityTask(client,uid,item("SQL","P2",""),{status:"Completed"})).rejects.toThrow(/ya no existe/);
 });
 it("inserta sólo tras una acción explícita, con UUID estable y sin marcar completada",async()=>{
   const id="44444444-4444-4444-8444-444444444444";
   const {client,calls}=fakeClient([{data:row(),error:null}]);
   await createPriorityTask(client,uid,{title:"Presentar IVA",urgency:"P0",deadlineType:"real",dueDate:"2026-10-31",
    why:"Evitar recargo",evidenceSummary:"Carta",evidenceCheckedAt:"2026-10-27T17:00:00.000Z"},{id});
   const sent=calls.find(c=>c[0]==="insert")![1] as {payload:Record<string,unknown>}&Record<string,unknown>;
   expect(sent).toMatchObject({id,owner_id:uid,record_type:"renzo_task",domain:"work",source:"manual"});
   expect(sent["payload"]).toMatchObject({id,status:"Backlog",deadlineType:"real",priority:"High"});
   await expect(createPriorityTask(client,uid,{title:"x",why:"y"},{id:"no-uuid"})).rejects.toThrow();
 });
 it("una respuesta vacía no confirma el alta",async()=>{
   const {client}=fakeClient([{data:null,error:null}]);
   await expect(createPriorityTask(client,uid,{title:"Tarea",why:"Motivo"})).rejects.toThrow(/confirm/i);
 });
 it("un error de Supabase no se presenta como guardado",async()=>{
   const {client}=fakeClient([{data:null,error:{message:"permission denied"}}]);
   await expect(createPriorityTask(client,uid,{title:"Tarea",why:"Motivo"})).rejects.toThrow(/permission denied/);
 });
});

describe("Reintento de propuestas sin duplicar",()=>{
 const id="55555555-5555-4555-8555-555555555555";
 const input={title:"Practicar JOIN",urgency:"P2" as const,dueDate:"",deadlineType:"interna" as const,why:"Entrevistas",origin:"claude" as const,
  proposalId:"",sourceRef:"",evidenceSummary:"",evidenceCheckedAt:""};
 it("tras una respuesta perdida consulta el UUID antes de reinsertar",async()=>{
   const {client,calls}=fakeClient([{data:row({title:"Practicar JOIN"}),error:null}]);
   const r=await persistProposal(client,uid,{id,input,attempted:true});
   expect(r.recovered).toBe(true);
   expect(calls.some(c=>c[0]==="insert")).toBe(false);
   expect(calls).toContainEqual(["eq","id",id]);
 });
 it("si nunca se intentó, inserta con su UUID; si la clave ya existe, recupera la fila",async()=>{
   const first=fakeClient([{data:row(),error:null}]);
   expect((await persistProposal(first.client,uid,{id,input,attempted:false})).recovered).toBe(false);
   expect((first.calls.find(c=>c[0]==="insert")![1] as {id:string}).id).toBe(id);
   const dup=fakeClient([{data:null,error:{message:"duplicate key value",code:"23505"}},{data:row(),error:null}]);
   expect((await persistProposal(dup.client,uid,{id,input,attempted:false})).recovered).toBe(true);
 });
 it("findPriorityTask filtra por propietario, dominio y tipo",async()=>{
   const {client,calls}=fakeClient([{data:null,error:null}]);
   expect(await findPriorityTask(client,uid,id)).toBe(null);
   expect(calls).toEqual(expect.arrayContaining([["eq","owner_id",uid],["eq","domain","work"],["eq","record_type","renzo_task"]]));
 });
});

describe("Límite de carga compartido con Work",()=>{
 it("Work carga como máximo WORK_LOAD_LIMIT tareas: el panel debe avisar si se alcanza",async()=>{
   const limits:number[]=[];
   const q:{select():unknown;eq():unknown;order():unknown;limit(n:number):Promise<unknown>}={select:()=>q,eq:()=>q,order:()=>q,
    limit:(n:number)=>{limits.push(n);return Promise.resolve({data:[],error:null});}};
   await loadWorkRecords({from:()=>q} as never,uid);
   expect(limits[0]).toBe(WORK_LOAD_LIMIT);
 });
});
