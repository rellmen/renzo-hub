import {createFileRoute} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";
import {Newspaper,RefreshCw,ExternalLink,ShieldCheck} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
export const Route=createFileRoute("/news")({
 head:()=>pageHead("News","Resúmenes de noticias guardados en tu cuenta."),
 component:News
});
type Brief={id:string;title:string|null;source:string|null;brief_date:string|null;content:string|null;source_url:string|null};
function safeUrl(value:string|null|undefined){
 try{if(!value)return null;const u=new URL(value);return u.protocol==="https:"||u.protocol==="http:"?u.href:null;}
 catch{return null;}
}
function News(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const q=useQuery({queryKey:["news-briefs",uid],enabled:!!client&&!!uid,staleTime:60000,refetchOnWindowFocus:true,
  queryFn:async()=>{
   const {data,error}=await client!.from("news_briefs")
    .select("id,title,source,brief_date,content,source_url").eq("user_id",uid)
    .order("brief_date",{ascending:false}).limit(300);
   if(error)throw Error("No se pudieron cargar todos los briefings.");
   return(data||[]) as Brief[];
  }});
 return <div className="space-y-6">
  <PageHeader eyebrow="INFORMACIÓN · HISTORIAL PRIVADO" title="News"
   subtitle="Resumen de noticias registrado en tu cuenta de RISE HUB. No se muestran titulares ni acontecimientos inventados."/>
  <div className="flex items-center justify-between gap-3 text-xs text-platinum/75">
   <span><ShieldCheck className="mr-2 inline h-4 w-4 text-gold"/>Datos guardados en Supabase</span>
   <button type="button" className="btn-ghost" disabled={q.isFetching} onClick={()=>void q.refetch()}>
    <RefreshCw className={"h-4 w-4 "+(q.isFetching?"animate-spin":"")}/>Actualizar</button>
  </div>
  {q.isLoading&&<p role="status" className="surface p-4">Cargando noticias guardadas…</p>}
  {q.error&&<p role="alert" className="surface border border-gym/40 p-4 text-gym">No se pudo recuperar el historial de noticias.</p>}
  {q.data&&!q.data.length&&<SectionCard eyebrow="Historial" title="Sin resúmenes guardados"><p className="text-sm text-muted-foreground">No hay noticias archivadas para esta cuenta.</p></SectionCard>}
  {q.data?.map(item=><SectionCard key={item.id} eyebrow={item.brief_date||"Fecha sin identificar"} title={item.title||"Resumen sin título"} accent="var(--projects)">
   <p className="whitespace-pre-wrap text-sm leading-relaxed text-platinum/85">{item.content||"Sin contenido archivado"}</p>
   <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
    <span><Newspaper className="mr-1 inline h-4 w-4"/>{item.source||"Fuente no identificada"}</span>
    {safeUrl(item.source_url)&&<a href={safeUrl(item.source_url)!} target="_blank" rel="noopener noreferrer" className="text-gold underline"><ExternalLink className="mr-1 inline h-4 w-4"/>Consultar fuente</a>}
   </div>
  </SectionCard>)}
 </div>;
}
