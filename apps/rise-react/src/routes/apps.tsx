import {createFileRoute,Link} from "@tanstack/react-router";
import {useState} from "react";
import {ShieldCheck} from "lucide-react";
import {PageHeader} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {HUBS} from "@/lib/hubs";
import {requireApp,normalize} from "@/lib/apps";

export const Route=createFileRoute("/apps")({
 head:()=>pageHead("Todas las apps","Los 7 hubs de RISE HUB y sus apartados."),
 component:AllApps
});

/** Catálogo generado desde lib/hubs.ts: si se añade una app a un hub, aparece aquí sola. */
function AllApps(){
 const [term,setTerm]=useState("");
 const q=normalize(term);
 const match=(...xs:string[])=>!q||xs.some(x=>normalize(x).includes(q));
 const shown=HUBS.map(h=>({hub:h,apps:h.sections.map(s=>({...s,app:requireApp(s.appId)}))
  .filter(x=>match(h.label,x.label,x.app.label,x.app.blurb,...x.app.aliases))})).filter(x=>x.apps.length);
 return <div className="space-y-6">
  <PageHeader eyebrow="RISE HUB · 7 HUBS" title="Todas tus apps"
   subtitle="Cada apartado vive dentro de un hub. Las pestañas de arriba te mueven dentro del hub sin volver al menú."/>
  <label className="surface flex min-h-14 items-center gap-3 px-4">
   <span className="sr-only">Buscar</span>
   <input type="search" aria-label="Buscar apps" value={term} onChange={e=>setTerm(e.target.value)}
    placeholder="Buscar por nombre o hub…" className="w-full bg-transparent text-base text-foreground outline-none sm:text-sm"/>
  </label>
  {shown.map(({hub,apps})=><section key={hub.id} className="space-y-3">
   <h2 className="eyebrow flex items-center gap-2 text-platinum/80"><hub.icon className="h-4 w-4" style={{color:hub.accent}}/>{hub.label}<span className="font-normal normal-case text-muted-foreground">· {hub.blurb}</span></h2>
   <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{apps.map(({appId,label,app})=>
    <li key={appId}>{app.kind==="live"&&<Link to={app.to} className="surface flex min-h-16 items-center gap-3 rounded-2xl p-4 transition hover:border-gold/40">
     <app.icon className="h-5 w-5 shrink-0" style={{color:app.accent}}/>
     <span className="min-w-0"><span className="block font-semibold text-foreground">{label}</span><span className="block truncate text-xs text-muted-foreground">{app.blurb}</span></span>
    </Link>}</li>)}</ul>
  </section>)}
  {!shown.length&&<p className="surface p-5 text-sm">No hay ninguna app con ese nombre. Prueba con otra palabra.</p>}
  <p className="flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0"/>Classic sigue solo como respaldo. No se crean datos de demostración.</p>
 </div>;
}
