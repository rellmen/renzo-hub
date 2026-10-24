import {createFileRoute,Link} from "@tanstack/react-router";
import {useState} from "react";
import {CheckCircle2,LayoutGrid,Search,ShieldCheck} from "lucide-react";
import {PageHeader} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
export const Route=createFileRoute("/apps")({
 head:()=>pageHead("Todas las microapps","Acceso rápido a los módulos reales de RISE HUB Nocturne."),
 component:AllApps
});
const CATALOG=[
 {name:"Centro de mando",group:"Sistema",path:"/",status:"React · lectura real"},
 {name:"Ares AI",group:"Inteligencia",path:"/ares",status:"React · consultas autorizadas"},
 {name:"SelfLearn",group:"Aprendizaje",path:"/aprender",status:"React · avance y FSRS"},
 {name:"Gym",group:"Bienestar",path:"/gym",status:"React · sesiones"},
 {name:"Body",group:"Bienestar",path:"/body",status:"React · mediciones"},
 {name:"Food",group:"Bienestar",path:"/food",status:"React · registros básicos"},
 {name:"Skin Routine",group:"Bienestar",path:"/piel",status:"React · rutinas"},
 {name:"My Finance",group:"Finanzas",path:"/dinero",status:"React · importación y gestión; QA real pendiente"},
 {name:"Nóminas",group:"Finanzas",path:"/nominas",status:"React · historial y PDF"},
 {name:"Shift Tracker",group:"Trabajo",path:"/turnos",status:"React · calendario"},
 {name:"Proyectos",group:"Trabajo",path:"/proyectos",status:"React · tareas"},
 {name:"Notas",group:"Trabajo",path:"/notas",status:"React · notas"},
 {name:"Migración y copias",group:"Sistema",path:"/migracion",status:"React · auditoría"},
 {name:"News",group:"Sistema",path:"/news",status:"React · historial"},
 {name:"Gastos",group:"Finanzas",path:"/gastos",status:"React · categorías; importación en Money"},
 {name:"Car",group:"Finanzas",path:"/car",status:"React · banco, documentos y pendientes"},
 {name:"Career / Data Lab",group:"Trabajo",path:"/career",status:"React · perfil; cursos y portafolio pendientes"},
 {name:"Quest / RPG",group:"Aprendizaje",path:"/quest",status:"React · XP histórico; misiones pendientes"},
 {name:"Agent Monitor",group:"Inteligencia",path:"/agentes",status:"React · eventos reales"},
 {name:"AI Inbox",group:"Inteligencia",path:"/inbox",status:"React · capturas y adjuntos privados"},
 {name:"Ajustes",group:"Sistema",path:"/ajustes",status:"React · cuenta"}
] as const;
function AllApps(){
 const [term,setTerm]=useState("");
 const search=term.trim().toLocaleLowerCase("es-ES");
 const groups=["Inteligencia","Aprendizaje","Trabajo","Finanzas","Bienestar","Sistema"];
 const shown=CATALOG.filter(x=>!search||x.name.toLocaleLowerCase("es-ES").includes(search)||x.group.toLocaleLowerCase("es-ES").includes(search));
 return <div className="space-y-6">
  <PageHeader eyebrow="RISE HUB · ACCESO UNIVERSAL" title="Todas tus microapps"
   subtitle="Busca cualquier herramienta. Todas abren de forma nativa en Nocturne; no se inventan estados."/>
  <label className="surface flex min-h-14 items-center gap-3 px-4"><Search className="h-5 w-5 text-gold"/>
   <input type="search" aria-label="Buscar microapps" value={term} onChange={e=>setTerm(e.target.value)}
    placeholder="Buscar por nombre o categoría…" className="w-full bg-transparent text-sm text-foreground outline-none"/>
  </label>
  {groups.map(g=>{
   const rows=shown.filter(x=>x.group===g);
   if(!rows.length)return null;
   return <section key={g} className="space-y-3">
    <h2 className="eyebrow text-platinum/80">{g}</h2>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rows.map(x=>{
     return <div key={x.name} className="surface flex flex-col justify-between gap-3 rounded-2xl p-4">
      <div>
       <h3 className="font-display text-xl">{x.name}</h3>
       <p className="mt-2 text-xs text-muted-foreground">{x.status}</p>
      </div>
      <div className="flex flex-wrap gap-2">
       {"path" in x&&x.path?<Link to={x.path} className="btn-gold inline-flex min-h-11 items-center gap-2">
        <LayoutGrid className="h-4 w-4"/>Abrir</Link>:null}
      </div>
     </div>;
    })}</div>
   </section>;
  })}
  {!shown.length&&<p className="surface p-5 text-sm">No hay una microapp con ese nombre. Prueba con otra palabra.</p>}
  <p className="flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0"/>La versión clásica está retirada y se conserva solo como respaldo. <CheckCircle2 className="h-4 w-4 shrink-0"/>No se crean datos de demostración.</p>
 </div>;
}
