import {createFileRoute} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState,type FormEvent} from "react";
import {Newspaper,RefreshCw,ExternalLink,ShieldCheck,Plus,Search} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {PageHeader,SectionCard} from "@/components/rise/primitives";
import {pageHead} from "@/lib/seo";
import {NEWS_SOURCES,filterBriefs,loadBriefs,safeUrl,saveBrief} from "@/lib/news-briefs.mjs";
export const Route=createFileRoute("/news")({
 head:()=>pageHead("News","Resúmenes de noticias guardados en tu cuenta."),
 component:News
});
const field="mt-2 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground";
function News(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [source,setSource]=useState("all");
 const [text,setText]=useState("");
 const [adding,setAdding]=useState(false);
 useEffect(()=>{setSource("all");setText("");setAdding(false);},[uid]);
 const q=useQuery({queryKey:["news-briefs",uid],enabled:!!client&&!!uid,staleTime:60000,refetchOnWindowFocus:true,
  queryFn:()=>loadBriefs(client!,uid)});
 const save=useMutation({mutationFn:(v:Record<string,string>)=>saveBrief(client,uid,v),
  onSuccess:async()=>{setAdding(false);await qc.invalidateQueries({queryKey:["news-briefs",uid]});}});
 const submit=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();save.mutate(Object.fromEntries(new FormData(e.currentTarget)) as Record<string,string>);};
 const rows=q.data?filterBriefs(q.data,{source,text}):[];
 return <div className="space-y-6">
  <PageHeader eyebrow="INFORMACIÓN · HISTORIAL PRIVADO" title="News"
   subtitle="Resumen de noticias registrado en tu cuenta de Rise. No se muestran titulares ni acontecimientos inventados."/>
  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-platinum/75">
   <span><ShieldCheck className="mr-2 inline h-4 w-4 text-gold"/>Datos guardados en Supabase</span>
   <div className="flex gap-2">
    <button type="button" className="btn-ghost" onClick={()=>{save.reset();setAdding(a=>!a);}}><Plus className="h-4 w-4"/>Añadir resumen</button>
    <button type="button" className="btn-ghost" disabled={q.isFetching} onClick={()=>void q.refetch()}>
     <RefreshCw className={"h-4 w-4 "+(q.isFetching?"animate-spin":"")}/>Actualizar</button>
   </div>
  </div>
  {adding&&<SectionCard eyebrow="Nuevo" title="Guardar resumen privado" accent="var(--gold)">
   <form className="space-y-3" onSubmit={submit}>
    <div className="grid gap-3 sm:grid-cols-2">
     <label className="block text-xs text-muted-foreground">Fuente<select name="source" className={field} defaultValue="Claude">{NEWS_SOURCES.map(s=><option key={s}>{s}</option>)}</select></label>
     <label className="block text-xs text-muted-foreground">Fecha<input name="brief_date" type="date" required className={field}/></label>
    </div>
    <label className="block text-xs text-muted-foreground">Título<input name="title" required maxLength={160} className={field}/></label>
    <label className="block text-xs text-muted-foreground">Contenido<textarea name="content" required maxLength={60000} rows={10} className={field+" py-2"}/></label>
    <label className="block text-xs text-muted-foreground">Enlace original (opcional, https)<input name="source_url" type="url" className={field}/></label>
    <button type="submit" className="btn-gold min-h-11" disabled={save.isPending}>{save.isPending?"Guardando…":"Guardar privado"}</button>
    {save.error&&<p role="alert" className="text-sm text-gym">{save.error instanceof Error?save.error.message:"No se pudo guardar."}</p>}
   </form>
  </SectionCard>}
  <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por fuente">
   {["all",...NEWS_SOURCES].map(s=><button key={s} type="button" aria-pressed={source===s} onClick={()=>setSource(s)}
    className={"rounded-full border px-3 py-1.5 text-xs "+(source===s?"border-gold text-gold":"border-hairline text-platinum/75")}>{s==="all"?"Todos":s}</button>)}
   <label className="relative ml-auto min-w-[200px] flex-1 sm:flex-none"><span className="sr-only">Buscar</span>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
    <input value={text} onChange={e=>setText(e.target.value)} placeholder="Buscar en resúmenes" className="min-h-10 w-full rounded-xl border border-hairline bg-obsidian pl-9 pr-3 text-sm text-foreground"/></label>
  </div>
  {q.isLoading&&<p role="status" className="surface p-4">Cargando noticias guardadas…</p>}
  {q.error&&<p role="alert" className="surface border border-gym/40 p-4 text-gym">No se pudo recuperar el historial de noticias.</p>}
  {q.data&&!rows.length&&<SectionCard eyebrow="Historial" title={q.data.length?"Sin coincidencias":"Sin resúmenes guardados"}><p className="text-sm text-muted-foreground">{q.data.length?"Ningún resumen coincide con el filtro.":"No hay noticias archivadas para esta cuenta."}</p></SectionCard>}
  {rows.map(item=><SectionCard key={item.id} eyebrow={item.brief_date||"Fecha sin identificar"} title={item.title||"Resumen sin título"} accent="var(--projects)">
   <details><summary className="cursor-pointer text-xs text-gold">Leer resumen</summary>
    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-platinum/85">{item.content||"Sin contenido archivado"}</p></details>
   <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
    <span><Newspaper className="mr-1 inline h-4 w-4"/>{item.source||"Fuente no identificada"}</span>
    {safeUrl(item.source_url)&&<a href={safeUrl(item.source_url)!} target="_blank" rel="noopener noreferrer" className="text-gold underline"><ExternalLink className="mr-1 inline h-4 w-4"/>Consultar fuente</a>}
   </div>
  </SectionCard>)}
 </div>;
}
