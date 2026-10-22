import {useQuery} from "@tanstack/react-query";
import {ExternalLink,GitBranch,RefreshCw,ShieldCheck} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";

type GithubItem={sha?:string;number?:number;title:string;url?:string;date?:string};
type GithubSources={
 repository:string;branch:string;commits:GithubItem[];pullRequests:GithubItem[];issues:GithubItem[];
 available:{commits:boolean;pullRequests:boolean;issues:boolean}
};
type SourceResult={source:string;checkedAt:string;github:GithubSources;
 vercel:{project:string;environment:string;deploymentBranch:string|null;deploymentCommit:string|null;scope:string};
 limitations:string};
const safeLink=(url:string|undefined)=>{
 if(!url)return null;
 try{const u=new URL(url);return u.protocol==="https:"&&u.hostname==="github.com"&&
  u.pathname.startsWith("/rellmen/renzo-hub/")?url:null;}catch{return null;}
};
async function fetchSources(token:string):Promise<SourceResult>{
 const res=await fetch("/api/ares-sources",{method:"GET",headers:{Authorization:"Bearer "+token},
  credentials:"same-origin",cache:"no-store"});
 const data=await res.json().catch(()=>null);
 if(!res.ok)throw Error(typeof data?.error==="string"?data.error:"Estado de desarrollo no disponible.");
 if(!data?.github||!data.vercel)throw Error("El servidor no ha devuelto una respuesta verificable.");
 return data as SourceResult;
}
export function AresDevelopmentSources(){
 const {session,user}=useAuth();
 const token=session?.access_token||"",uid=user?.id||"";
 const query=useQuery({queryKey:["ares-development-sources",uid],enabled:!!token&&!!uid,
  queryFn:()=>fetchSources(token),staleTime:90_000,refetchOnWindowFocus:false,retry:false});
 const info=query.data,gh=info?.github;
 return <SectionCard eyebrow="ARES · DESARROLLO" title="GitHub y despliegue" accent="var(--ares)">
  <p className="text-sm text-platinum/80">Actividad pública del repositorio y versión del servidor actual. Esta consulta no tiene permisos de escritura ni utiliza agentes externos.</p>
  <button className="btn-ghost mt-3 min-h-11" type="button" disabled={query.isFetching}
   onClick={()=>void query.refetch()}><RefreshCw className={"h-4 w-4 "+(query.isFetching?"animate-spin":"")}/>Actualizar estado</button>
  {query.isLoading&&<p role="status" className="mt-3 text-xs">Comprobando las fuentes de desarrollo…</p>}
  {query.error&&<p role="alert" className="mt-3 text-xs text-gym">{query.error instanceof Error?query.error.message:"Información no disponible."}</p>}
  {info&&<>
   <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><GitBranch className="h-4 w-4"/>
    {info.vercel.project} · {info.vercel.deploymentBranch||info.vercel.environment||"Entorno desconocido"}
    {info.vercel.deploymentCommit?" · "+info.vercel.deploymentCommit.slice(0,8):""}
   </p>
   {gh?.available.commits&&gh.commits.length>0&&<div className="mt-4 space-y-2">
    <h3 className="text-sm font-semibold">Últimos commits públicos</h3>
    <ul className="space-y-2">{gh.commits.slice(0,5).map(item=><li key={item.sha||item.title} className="text-xs">
     {safeLink(item.url)?<a href={safeLink(item.url)!} target="_blank" rel="noopener noreferrer" className="break-words text-gold underline">{item.title} <ExternalLink className="inline h-3 w-3"/></a>:
      <span className="break-words">{item.title}</span>}
    </li>)}</ul>
   </div>}
   {gh?.available.pullRequests&&<p className="mt-2 text-xs text-muted-foreground">{gh.pullRequests.length} PR públicas recientes en consulta; no representa porcentaje de migración.</p>}
   {!gh?.available.commits&&<p className="mt-3 text-xs text-muted-foreground">GitHub no está accesible desde el servidor. No se inventarán commits.</p>}
   <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0"/>
    Los commits y el estado del despliegue no demuestran por sí mismos que una funcionalidad esté terminada.</p>
  </>}
 </SectionCard>;
}
