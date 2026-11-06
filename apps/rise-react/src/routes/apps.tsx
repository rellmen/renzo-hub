import {createFileRoute,Link} from "@tanstack/react-router";
import {useState} from "react";
import {PageHeader} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {HUBS} from "@/lib/hubs";
import {requireApp,normalize} from "@/lib/apps";

export const Route=createFileRoute("/apps")({
 head:()=>pageHead("Todas las apps","Los 7 hubs de Rise y sus apartados."),
 component:AllApps
});

/** Catálogo generado desde lib/hubs.ts: si se añade una app a un hub, aparece aquí sola. */
function AllApps(){
 const [term,setTerm]=useState("");
 const q=normalize(term);
 const match=(...xs:string[])=>!q||xs.some(x=>normalize(x).includes(q));
 const shown=HUBS.map(h=>({hub:h,apps:h.sections.map(s=>({...s,app:requireApp(s.appId)}))
  .filter(x=>match(h.label,x.label,x.app.label,x.app.blurb,...x.app.aliases))})).filter(x=>x.apps.length);
 return <div className="space-y-5">
  <PageHeader eyebrow="AJUSTES · CATÁLOGO" title="Todas tus apps"/>
  <label className="surface flex min-h-14 items-center gap-3 px-4">
   <span className="sr-only">Buscar</span>
   <input type="search" aria-label="Buscar apps" value={term} onChange={e=>setTerm(e.target.value)}
    placeholder="Buscar por nombre o hub…" className="w-full bg-transparent text-base text-foreground outline-none sm:text-sm"/>
  </label>
  {shown.map(({hub,apps})=><section key={hub.id} className="space-y-3">
   <h2 className="eyebrow flex items-center gap-2 text-platinum/80"><hub.icon className="h-4 w-4" style={{color:hub.accent}}/>{hub.label}<span className="font-normal normal-case text-muted-foreground">· {hub.blurb}</span></h2>
   <ul className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-3">{apps.map(({appId,label,app})=>
    <li key={appId}>{app.kind==="live"&&<Link to={app.to} className="surface flex min-h-14 items-center gap-3 rounded-2xl p-3 transition hover:border-gold/40 sm:p-4">
     <app.icon className="h-5 w-5 shrink-0" style={{color:app.accent}}/>
     <span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">{label}</span><span className="hidden truncate text-xs text-muted-foreground sm:block">{app.blurb}</span></span>
    </Link>}</li>)}</ul>
  </section>)}
  {!shown.length&&<p className="surface p-5 text-sm">No hay ninguna app con ese nombre. Prueba con otra palabra.</p>}
  
 </div>;
}
