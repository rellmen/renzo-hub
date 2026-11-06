import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {act,cleanup,fireEvent,render,screen,waitFor,within} from "@testing-library/react";
import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import type {ReactNode} from "react";
import type {PriorityTask} from "@/lib/priority-records.mjs";

const A="22222222-2222-4222-8222-222222222222",B="66666666-6666-4666-8666-666666666666";
const mocks=vi.hoisted(()=>({load:vi.fn(),persist:vi.fn(),patch:vi.fn(),create:vi.fn(),auth:{user:{id:""} as {id:string}|null,client:{} as object|null}}));
vi.mock("@tanstack/react-router",()=>({Link:({to,children,...props}:{to:string;children:ReactNode})=><a href={to} {...props}>{children}</a>}));
vi.mock("@/lib/auth/AuthProvider",()=>({useAuth:()=>mocks.auth}));
vi.mock("@/lib/work-records.mjs",async orig=>({...await orig<object>(),loadWorkRecords:mocks.load}));
vi.mock("@/lib/priority-records.mjs",async orig=>({...await orig<object>(),persistProposal:mocks.persist,patchPriorityTask:mocks.patch,createPriorityTask:mocks.create}));
import {PriorityBoard} from "../components/rise/PriorityBoard";
import {PriorityConflictError} from "../lib/priority-records.mjs";

const task=(over:Partial<PriorityTask>={}):PriorityTask=>({id:"77777777-7777-4777-8777-777777777777",title:"Tarea sintética",status:"Today",
 priority:"Normal",urgency:"P1",why:"Motivo sintético",dueDate:"",_cloudUpdatedAt:"2026-10-27T10:00:00Z",...over});
let tasks:PriorityTask[]=[];
function mount(){
 const qc=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
 const view=render(<QueryClientProvider client={qc}><PriorityBoard/></QueryClientProvider>);
 return {...view,rerenderBoard:()=>view.rerender(<QueryClientProvider client={qc}><PriorityBoard/></QueryClientProvider>)};
}
const writes=()=>mocks.persist.mock.calls.length+mocks.patch.mock.calls.length+mocks.create.mock.calls.length;
async function openImport(json:unknown){
 fireEvent.click(await screen.findByRole("button",{name:/Importar propuesta/}));
 fireEvent.change(screen.getByLabelText("JSON de tareas sugeridas"),{target:{value:typeof json==="string"?json:JSON.stringify(json)}});
 fireEvent.click(screen.getByRole("button",{name:"Revisar propuestas"}));
}
const proposal=(title:string,extra:Record<string,unknown>={})=>({title,urgency:"P2",dueDate:"2026-11-08",why:"Motivo "+title,origin:"claude",...extra});

beforeEach(()=>{
 vi.clearAllMocks();tasks=[task()];
 mocks.auth={user:{id:A},client:{}};
 mocks.load.mockImplementation(async()=>({tasks,projects:[]}));
 mocks.persist.mockImplementation(async(_c:unknown,_u:unknown,{id}:{id:string})=>({task:{id},recovered:false}));
 Object.defineProperty(navigator,"onLine",{value:true,configurable:true});
});
afterEach(cleanup);

describe("RISE PRIORITY · Home",()=>{
 it("muestra prioridad con texto, estado Work y motivo pendiente en tareas antiguas",async()=>{
   const {urgency:_u,why:_w,...legacy}=task({priority:"High",title:"Antigua sin motivo"});
   tasks=[legacy as PriorityTask];
   mount();
   const li=(await screen.findByText("Antigua sin motivo")).closest("li")!;
   expect(within(li).getByText("P1 · Alta")).toBeInTheDocument();
   expect(within(li).getByText("Hoy")).toBeInTheDocument();
   expect(within(li).getByText("Motivo pendiente de definir")).toBeInTheDocument();
   expect(writes()).toBe(0);
 });
 it("sin sesión no permite escribir",async()=>{
   mocks.auth={user:null,client:null};
   mount();
   expect(screen.getByText("Inicia sesión para administrar tus tareas.")).toBeInTheDocument();
   expect(screen.getByRole("button",{name:/Nueva tarea/})).toBeDisabled();
   expect(screen.getByRole("button",{name:/Importar propuesta/})).toBeDisabled();
   expect(mocks.load).not.toHaveBeenCalled();
 });
 it("avisa del límite de carga en lugar de presentar totales completos",async()=>{
   tasks=Array.from({length:300},(_,i)=>task({id:String(i),title:"T"+i}));
   mount();
   expect(await screen.findByRole("note")).toHaveTextContent("Se muestran las 300 tareas modificadas más recientemente");
 });
 it("una nueva tarea exige motivo antes de llamar al servidor y conserva el borrador",async()=>{
   mount();
   fireEvent.click(await screen.findByRole("button",{name:/Nueva tarea/}));
   fireEvent.change(screen.getByLabelText("Tarea"),{target:{value:"Borrador importante"}});
   fireEvent.submit(screen.getByLabelText("Tarea").closest("form")!);
   expect(await screen.findByText(/motivo obligatorio/)).toBeInTheDocument();
   expect(mocks.create).not.toHaveBeenCalled();
   expect(screen.getByLabelText("Tarea")).toHaveValue("Borrador importante");
 });
 it("sin conexión no confirma nada y mantiene el formulario",async()=>{
   Object.defineProperty(navigator,"onLine",{value:false,configurable:true});
   mount();
   fireEvent.click(await screen.findByRole("button",{name:/Nueva tarea/}));
   fireEvent.change(screen.getByLabelText("Tarea"),{target:{value:"Offline"}});
   fireEvent.change(screen.getByLabelText(/Por qué es importante/),{target:{value:"Motivo"}});
   fireEvent.click(screen.getByRole("button",{name:"Guardar"}));
   expect(await screen.findByText(/Sin conexión: no se ha guardado nada/)).toBeInTheDocument();
   expect(mocks.create).not.toHaveBeenCalled();
   expect(screen.getByLabelText("Tarea")).toHaveValue("Offline");
 });
 it("en conflicto conserva el borrador, muestra la versión remota y reaplica solo al pulsar",async()=>{
   const remote=task({title:"Cambiada en el móvil",_cloudUpdatedAt:"2026-10-27T11:00:00Z"});
   mocks.patch.mockRejectedValueOnce(new PriorityConflictError(remote)).mockResolvedValueOnce(remote);
   mount();
   fireEvent.click(await screen.findByRole("button",{name:"Editar"}));
   fireEvent.change(screen.getByLabelText("Tarea"),{target:{value:"Mi versión"}});
   fireEvent.click(screen.getByRole("button",{name:"Guardar"}));
   expect(await screen.findByText(/cambió en otro dispositivo\. Tu borrador sigue aquí/)).toBeInTheDocument();
   expect(screen.getByText(/«Cambiada en el móvil»/)).toBeInTheDocument();
   expect(screen.getByLabelText("Tarea")).toHaveValue("Mi versión");
   expect(mocks.patch).toHaveBeenCalledTimes(1);
   fireEvent.click(screen.getByRole("button",{name:"Guardar mi borrador sobre la versión nueva"}));
   await waitFor(()=>expect(mocks.patch).toHaveBeenCalledTimes(2));
   expect(mocks.patch.mock.calls[1]![2]._cloudUpdatedAt).toBe("2026-10-27T11:00:00Z");
   expect(mocks.patch.mock.calls[1]![3]).toMatchObject({title:"Mi versión"});
 });
 it("reabrir una completada la devuelve a su estado previo",async()=>{
   tasks=[task({status:"Completed",reopenStatus:"Waiting",title:"Hecha"})];
   mocks.patch.mockResolvedValue(task());
   mount();
   fireEvent.click(await screen.findByRole("button",{name:/Ver todas/}));
   expect(screen.getByText("Al reabrirla vuelve a «En espera».")).toBeInTheDocument();
   fireEvent.click(screen.getByLabelText("Reabrir: Hecha"));
   await waitFor(()=>expect(mocks.patch).toHaveBeenCalledTimes(1));
   expect(mocks.patch.mock.calls[0]![3]).toEqual({status:"Waiting"});
 });
 it("al cambiar de cuenta no quedan borradores de la anterior",async()=>{
   const view=mount();
   fireEvent.click(await screen.findByRole("button",{name:/Nueva tarea/}));
   fireEvent.change(screen.getByLabelText("Tarea"),{target:{value:"Borrador privado de A"}});
   mocks.auth={user:{id:B},client:{}};
   view.rerenderBoard();
   expect(screen.queryByDisplayValue("Borrador privado de A")).not.toBeInTheDocument();
 });
});

describe("RISE PRIORITY · importación revisada",()=>{
 it("pegar, revisar y cancelar no escribe nada",async()=>{
   mount();
   await openImport({tasks:[proposal("Uno"),proposal("Dos")]});
   expect(await screen.findByText("Uno")).toBeInTheDocument();
   fireEvent.click(screen.getByRole("button",{name:"Cancelar sin guardar"}));
   expect(writes()).toBe(0);
 });
 it("JSON roto o con campos no admitidos muestra error y no escribe",async()=>{
   mount();
   await openImport('{"tasks":[{"title":"x","run":"rm -rf /"}]}');
   expect(await screen.findByRole("alert")).toHaveTextContent("Campo no admitido «run»");
   expect(writes()).toBe(0);
 });
 it("solo guarda la selección final, con las ediciones y cada una con su UUID",async()=>{
   mount();
   await openImport({tasks:[proposal("Para editar"),proposal("Para descartar"),proposal("Para desmarcar")]});
   fireEvent.click(within((await screen.findByText("Para descartar")).closest("li")!).getByRole("button",{name:/Descartar/}));
   expect(screen.queryByText("Para descartar")).not.toBeInTheDocument();
   fireEvent.click(screen.getByLabelText("Incluir propuesta: Para desmarcar"));
   const card=screen.getByText("Para editar").closest("li")!;
   fireEvent.click(within(card).getByRole("button",{name:"Editar"}));
   fireEvent.change(within(card).getByLabelText("Tarea"),{target:{value:"Editada por mí"}});
   fireEvent.click(within(card).getByRole("button",{name:"Aplicar a la propuesta"}));
   expect(screen.getByText("Editada por mí")).toBeInTheDocument();
   fireEvent.click(screen.getByRole("button",{name:"Aprobar y guardar 1"}));
   await screen.findByText(/Guardada y confirmada/);
   expect(mocks.persist).toHaveBeenCalledTimes(1);
   const arg=mocks.persist.mock.calls[0]![2];
   expect(arg.input.title).toBe("Editada por mí");
   expect(arg.id).toMatch(/^[0-9a-f-]{36}$/);
   expect(arg.attempted).toBe(false);
 });
 it("un plazo externo sin comprobar bloquea el guardado hasta convertirlo en interno",async()=>{
   mount();
   await openImport({tasks:[proposal("IVA",{deadlineType:"real",evidenceCheckedAt:"2026-10-27T09:00:00Z"})]});
   expect(await screen.findByText(/no cuenta como revisión/)).toBeInTheDocument();
   expect(screen.getByText(/Plazo externo sin comprobar/)).toBeInTheDocument();
   expect(screen.getByRole("button",{name:"Aprobar y guardar 1"})).toBeDisabled();
   fireEvent.click(screen.getByRole("button",{name:"Convertir en objetivo interno"}));
   expect(screen.getByRole("button",{name:"Aprobar y guardar 1"})).toBeEnabled();
 });
 it("una propuesta sin fecha queda bloqueada hasta confirmar que se guarda sin fecha",async()=>{
   mount();
   await openImport({tasks:[proposal("Sin fecha",{dueDate:undefined})]});
   expect(await screen.findByText(/Elige una fecha o confirma/)).toBeInTheDocument();
   expect(screen.getByRole("button",{name:"Aprobar y guardar 1"})).toBeDisabled();
   fireEvent.click(screen.getByLabelText("Guardar sin fecha"));
   expect(screen.getByRole("button",{name:"Aprobar y guardar 1"})).toBeEnabled();
 });
 it("un duplicado de una tarea existente no se selecciona ni la modifica",async()=>{
   tasks=[task({title:"SQL",dueDate:"2026-11-08"})];
   mount();
   await openImport({tasks:[proposal("sql")]});
   expect(await screen.findByText(/Posible duplicado de «SQL»/)).toBeInTheDocument();
   expect(screen.getByLabelText("Incluir propuesta: sql")).not.toBeChecked();
   expect(screen.getByRole("button",{name:"Aprobar y guardar 0"})).toBeDisabled();
 });
 it("fallo en la tercera: conserva las confirmadas y reintenta solo la pendiente consultando su UUID",async()=>{
   mocks.persist.mockImplementation(async(_c:unknown,_u:unknown,{id,input}:{id:string;input:{title:string}})=>{
     if(input.title==="Tres"&&mocks.persist.mock.calls.filter(c=>c[2].input.title==="Tres").length===1)throw Error("timeout de red");
     return {task:{id},recovered:false};
   });
   mount();
   await openImport({tasks:[proposal("Uno"),proposal("Dos"),proposal("Tres")]});
   fireEvent.click(await screen.findByRole("button",{name:"Aprobar y guardar 3"}));
   expect(await screen.findByText(/No guardada: timeout de red/)).toBeInTheDocument();
   expect(screen.getAllByText(/Guardada y confirmada/)).toHaveLength(2);
   fireEvent.click(screen.getByRole("button",{name:"Reintentar pendientes (1)"}));
   await waitFor(()=>expect(screen.getAllByText(/Guardada y confirmada/)).toHaveLength(3));
   const tres=mocks.persist.mock.calls.filter(c=>c[2].input.title==="Tres");
   expect(mocks.persist).toHaveBeenCalledTimes(4);
   expect(tres[0]![2].id).toBe(tres[1]![2].id);
   expect(tres[1]![2].attempted).toBe(true);
 });
 it("doble clic en aprobar no duplica altas",async()=>{
   let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});
   mocks.persist.mockImplementation(async(_c:unknown,_u:unknown,{id}:{id:string})=>{await gate;return {task:{id},recovered:false};});
   mount();
   await openImport({tasks:[proposal("Única")]});
   const approve=await screen.findByRole("button",{name:"Aprobar y guardar 1"});
   fireEvent.click(approve);fireEvent.click(approve);
   await act(async()=>{release();});
   await screen.findByText(/Guardada y confirmada/);
   expect(mocks.persist).toHaveBeenCalledTimes(1);
 });
});


describe("Revisión vigente en el formulario",()=>{
 it.each(["Fecha límite","Qué lo demuestra","Referencia (texto o enlace https, opcional)"])(
  "exige comprobar de nuevo al cambiar %s",async field=>{
   tasks=[task({deadlineType:"real",dueDate:"2026-10-31",proposalEvidence:{sourceRef:"Fuente",evidenceSummary:"Confirmación",
    evidenceCheckedAt:"2026-10-27T10:00:00Z"}})];
   mount();
   fireEvent.click(await screen.findByRole("button",{name:"Editar"}));
   const check=screen.getByRole("checkbox",{name:/He comprobado/});
   expect(check).toBeChecked();
   fireEvent.change(screen.getByLabelText(field),{target:{value:field==="Fecha límite"?"2026-11-01":"Nueva evidencia"}});
   expect(check).not.toBeChecked();
   fireEvent.click(screen.getByRole("button",{name:"Guardar"}));
   expect(await screen.findByText(/Un plazo externo necesita/)).toBeInTheDocument();
   expect(mocks.patch).not.toHaveBeenCalled();
   fireEvent.click(check);
   fireEvent.click(screen.getByRole("button",{name:"Guardar"}));
   await waitFor(()=>expect(mocks.patch).toHaveBeenCalledTimes(1));
 });
 it("bloquea un duplicado creado al editar una propuesta y permite corregirlo",async()=>{
   tasks=[task({title:"Existente",dueDate:"2026-11-08",status:"Completed"})];
   mount();
   await openImport({tasks:[proposal("Nueva")]});
   const card=(await screen.findByText("Nueva")).closest("li")!;
   fireEvent.click(within(card).getByRole("button",{name:"Editar"}));
   fireEvent.change(within(card).getByLabelText("Tarea"),{target:{value:"existente"}});
   fireEvent.click(within(card).getByRole("button",{name:"Aplicar a la propuesta"}));
   expect(screen.getByRole("button",{name:"Aprobar y guardar 1"})).toBeDisabled();
   expect(within(card).getByText(/duplicad/i)).toBeInTheDocument();
   expect(writes()).toBe(0);
   fireEvent.click(within(card).getByRole("button",{name:"Editar"}));
   fireEvent.change(within(card).getByLabelText("Tarea"),{target:{value:"Distinta"}});
   fireEvent.click(within(card).getByRole("button",{name:"Aplicar a la propuesta"}));
   expect(screen.getByRole("button",{name:"Aprobar y guardar 1"})).toBeEnabled();
 });
});


describe("Duplicados que cambian durante la revisión",()=>{
 it("revalida una coincidencia que llega al actualizar Work",async()=>{
   mount();
   await openImport({tasks:[proposal("Nueva")]});
   expect(await screen.findByRole("button",{name:"Aprobar y guardar 1"})).toBeEnabled();
   tasks=[task({title:"Nueva",dueDate:"2026-11-08"})];
   fireEvent.click(screen.getByRole("button",{name:"Actualizar prioridades"}));
   await waitFor(()=>expect(screen.getByRole("button",{name:"Aprobar y guardar 1"})).toBeDisabled());
   expect(writes()).toBe(0);
 });
 it("no permite seleccionar dos coincidencias del lote; desmarcar una desbloquea",async()=>{
   mount();
   await openImport({tasks:[proposal("Repetida"),proposal("repetida")]});
   fireEvent.click(await screen.findByLabelText("Incluir propuesta: repetida"));
   expect(screen.getByRole("button",{name:"Aprobar y guardar 2"})).toBeDisabled();
   fireEvent.click(screen.getByLabelText("Incluir propuesta: repetida"));
   expect(screen.getByRole("button",{name:"Aprobar y guardar 1"})).toBeEnabled();
 });
});

describe("RISE PRIORITY · presentación del foco y progreso",()=>{
 it("resalta el primer pendiente y cuenta solo las tareas realmente completadas",async()=>{
   tasks=[
     task({id:"88888888-8888-4888-8888-888888888888",title:"Entrega urgente",urgency:"P0",dueDate:"2026-10-29"}),
     task({id:"99999999-9999-4999-8999-999999999999",title:"Completada",urgency:"P1",status:"Completed"})
   ];
   mount();
   const progress=await screen.findByRole("progressbar",{name:"Progreso de prioridades"});
   expect(progress).toHaveAttribute("aria-valuenow","50");
   expect(screen.getByText("Empieza por: Entrega urgente")).toBeInTheDocument();
   expect(screen.getByRole("checkbox",{name:"Completar: Entrega urgente"})).not.toBeChecked();
   expect(screen.getByText("ORDEN DE EJECUCIÓN")).toBeInTheDocument();
   expect(writes()).toBe(0);
 });
});
