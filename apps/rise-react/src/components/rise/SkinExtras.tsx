import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState,type FormEvent} from "react";
import {AlertTriangle,Camera,Info,Trash2} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {deleteSkinPhoto,listSkinPhotos,loadSkinHistory,skinCompatibility,skinPhotoUrls,uploadSkinPhoto} from "@/lib/skin-extras.mjs";
import {preparePhoto} from "@/lib/legacy-gym/progress-photos.js";

export function SkinCompatibility({inventory,barrierFirst}:{inventory:Record<string,string>;barrierFirst:boolean}){
 const list=skinCompatibility(inventory,barrierFirst);
 return <SectionCard eyebrow="Compatibilidad" title={list.length?`${list.length} avisos`:"Sin conflictos detectados"} accent="var(--skin)">
  <p className="text-xs text-muted-foreground">Se basa solo en los productos marcados como disponibles y en las notas del catálogo original. No sustituye la indicación de un profesional.</p>
  {list.length>0&&<ul className="mt-3 space-y-2">{list.map((w,i)=><li key={i} className={"flex gap-2 rounded-xl border p-3 text-xs "+(w.level==="conflict"?"border-gym/50":"border-hairline")}>
   {w.level==="info"?<Info className="h-4 w-4 shrink-0 text-muted-foreground"/>:<AlertTriangle className={"h-4 w-4 shrink-0 "+(w.level==="conflict"?"text-gym":"text-gold")}/>}<span>{w.text}</span></li>)}</ul>}
 </SectionCard>;
}

export function SkinHistoryAndPhotos(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [confirm,setConfirm]=useState<string|null>(null);
 useEffect(()=>setConfirm(null),[uid]);
 const history=useQuery({queryKey:["skin-history",uid],enabled:!!client&&!!uid,queryFn:()=>loadSkinHistory(client,uid),staleTime:60000});
 const photos=useQuery({queryKey:["skin-photos",uid],enabled:!!client&&!!uid,queryFn:()=>listSkinPhotos(client,uid),staleTime:60000});
 const paths=(photos.data||[]).slice(0,20).map(p=>p.path);
 const urls=useQuery({queryKey:["skin-photo-urls",uid,paths.join("|")],enabled:!!client&&!!uid&&paths.length>0,queryFn:()=>skinPhotoUrls(client,uid,paths),staleTime:240000,refetchInterval:240000});
 const run=useMutation({mutationFn:(op:()=>Promise<unknown>)=>op(),onSuccess:async()=>{setConfirm(null);await qc.invalidateQueries({queryKey:["skin-photos",uid]});}});
 const upload=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=e.currentTarget;const file=new FormData(f).get("file") as File|null;
  run.mutate(async()=>{if(!file?.size)throw Error("Selecciona una imagen.");await uploadSkinPhoto(client,uid,await preparePhoto(file));f.reset();});};
 return <div className="grid gap-5 lg:grid-cols-2">
  <SectionCard eyebrow="Historial · 30 días" title="Rutinas registradas" accent="var(--skin)">
   {history.error&&<p role="alert" className="text-sm text-gym">No se pudo cargar el historial.</p>}
   {history.data&&!history.data.length&&<p className="text-sm text-muted-foreground">Sin rutinas registradas en los últimos 30 días.</p>}
   <ul className="divide-y divide-hairline">{(history.data||[]).map(d=><li key={d.day} className="py-2 text-sm">
    <div className="flex justify-between gap-2"><span>{new Date(d.day+"T12:00:00").toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"})}</span>
     <span className="text-xs text-muted-foreground">AM {d.am} pasos · PM {d.pm} pasos</span></div>
    {d.note&&<p className="mt-1 whitespace-pre-wrap text-xs text-platinum/80">{d.note}</p>}
   </li>)}</ul>
   <p className="mt-2 text-xs text-muted-foreground">Solo lectura. Las etiquetas de planes antiguos no están versionadas; se muestra el número de pasos marcados.</p>
  </SectionCard>
  <SectionCard eyebrow="Fotos · privadas" title={`${(photos.data||[]).length} fotos`} accent="var(--skin)">
   <form className="flex flex-wrap items-end gap-3" onSubmit={upload}>
    <label className="block flex-1 text-xs text-muted-foreground">Imagen (JPG, PNG o WebP)<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 py-2 text-sm text-foreground"/></label>
    <button type="submit" className="btn-gold min-h-11" disabled={run.isPending}><Camera className="h-4 w-4"/>{run.isPending?"Subiendo…":"Subir"}</button>
   </form>
   <p className="mt-2 text-xs text-muted-foreground">Se reduce y se eliminan metadatos antes de subir. Solo accesible con tu sesión.</p>
   {(photos.error||run.error)&&<p role="alert" className="mt-2 text-sm text-gym">{run.error instanceof Error?run.error.message:"No se pudieron cargar las fotos."}</p>}
   <ul className="mt-3 grid grid-cols-3 gap-2">{(photos.data||[]).slice(0,20).map(p=><li key={p.path} className="overflow-hidden rounded-xl border border-hairline">
    {urls.data?.[p.path]?<img src={urls.data[p.path]} alt={"Foto de piel "+p.created} className="aspect-square w-full object-cover" loading="lazy"/>:<div className="grid aspect-square place-items-center text-[11px] text-muted-foreground">…</div>}
    <div className="flex items-center justify-between p-1.5 text-[10px] text-muted-foreground"><span>{p.created||"—"}</span>
     {confirm===p.path?<button type="button" className="text-gym underline" disabled={run.isPending} onClick={()=>run.mutate(()=>deleteSkinPhoto(client,uid,p.path))}>Confirmar</button>
      :<button type="button" aria-label="Eliminar foto" onClick={()=>{run.reset();setConfirm(p.path);}}><Trash2 className="h-3.5 w-3.5"/></button>}</div>
   </li>)}</ul>
  </SectionCard>
 </div>;
}
