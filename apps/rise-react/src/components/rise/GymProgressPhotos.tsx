import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useEffect,useState,type FormEvent} from "react";
import {Camera,Trash2} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {PHOTO_POSES,daysBetween,deleteProgressPhoto,listProgressPhotos,preparePhoto,signedProgressPhotoUrls,uploadProgressPhoto,type ProgressPhoto} from "@/lib/legacy-gym/progress-photos.js";

type Pose=keyof typeof PHOTO_POSES;
const today=()=>new Date().toLocaleDateString("sv-SE");
const fmt=(d:string)=>new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"});
const span=(n:number)=>n<14?`${n} días`:n<=112?`${Math.round(n/7)} semanas`:`${Math.round(n/30.4)} meses`;
const field="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-sm text-foreground";

export function GymProgressPhotos(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [pose,setPose]=useState<Pose>("front");
 const [pair,setPair]=useState<{before:string;after:string}>({before:"",after:""});
 const [confirm,setConfirm]=useState<string|null>(null);
 useEffect(()=>{setPair({before:"",after:""});setConfirm(null);},[uid,pose]);
 const key=["gym-photos",uid];
 const list=useQuery({queryKey:key,enabled:!!client&&!!uid,queryFn:()=>listProgressPhotos(client,uid),staleTime:60000});
 const photos=(list.data||[]).filter(p=>p.pose===pose);
 const paths=photos.slice(0,24).map(p=>p.path);
 // Enlaces firmados de 5 minutos; se renuevan antes de caducar. Nunca URLs públicas.
 const urls=useQuery({queryKey:["gym-photo-urls",uid,paths.join("|")],enabled:!!client&&!!uid&&paths.length>0,
  queryFn:()=>signedProgressPhotoUrls(client,uid,paths,300),staleTime:240000,refetchInterval:240000});
 const run=useMutation({mutationFn:(op:()=>Promise<unknown>)=>op(),onSuccess:async()=>{setConfirm(null);await qc.invalidateQueries({queryKey:key});}});
 const upload=(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();const f=e.currentTarget;const data=new FormData(f);
  const file=data.get("file") as File|null;const date=String(data.get("date")||"");const p=String(data.get("pose")||"front") as Pose;
  run.mutate(async()=>{if(!file||!file.size)throw Error("Elige una foto.");if(date>today())throw Error("La fecha no puede ser futura.");
   const ready=await preparePhoto(file);await uploadProgressPhoto(client,uid,ready,{date,pose:p});setPose(p);f.reset();});};
 const map=urls.data||{};
 const before=photos.find(p=>p.path===pair.before),after=photos.find(p=>p.path===pair.after);
 return <SectionCard eyebrow="Fotos de progreso · privadas" title={`${(list.data||[]).length} fotos`} accent="var(--gym)">
  <p className="text-xs text-muted-foreground">Solo tú puedes verlas. Se reducen a 1600 px y se reencodan sin metadatos de ubicación antes de subir. Misma luz, distancia y pose cada 2–4 semanas.</p>
  <form className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end" onSubmit={upload}>
   <label className="block text-xs text-muted-foreground">Foto<input name="file" type="file" accept="image/*" required className={field+" py-2"}/></label>
   <label className="block text-xs text-muted-foreground">Fecha<input name="date" type="date" defaultValue={today()} max={today()} required className={field}/></label>
   <label className="block text-xs text-muted-foreground">Pose<select name="pose" defaultValue={pose} className={field}>{Object.entries(PHOTO_POSES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
   <button type="submit" className="btn-gold min-h-11" disabled={run.isPending}><Camera className="h-4 w-4"/>{run.isPending?"Subiendo…":"Subir"}</button>
  </form>
  <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Pose">{(Object.keys(PHOTO_POSES) as Pose[]).map(k=><button key={k} type="button" role="tab" aria-selected={pose===k} onClick={()=>setPose(k)}
   className={"rounded-full border px-3 py-1.5 text-xs "+(pose===k?"border-gym text-gym":"border-hairline text-platinum/75")}>{PHOTO_POSES[k]}</button>)}</div>
  {list.error&&<p role="alert" className="mt-3 text-sm text-gym">No se pudieron listar tus fotos privadas.</p>}
  {run.error&&<p role="alert" className="mt-3 text-sm text-gym">{run.error instanceof Error?run.error.message:"No se pudo completar."}</p>}
  {list.data&&!photos.length&&<p className="mt-3 text-sm text-muted-foreground">Sin fotos en esta pose.</p>}
  {photos.length>=2&&<div className="mt-4 rounded-xl border border-hairline p-3">
   <p className="text-xs text-muted-foreground">Comparar antes / después</p>
   <div className="mt-2 grid gap-3 sm:grid-cols-2">
    {(["before","after"] as const).map(side=><label key={side} className="block text-xs text-muted-foreground">{side==="before"?"Antes":"Después"}
     <select className={field} value={pair[side]} onChange={e=>setPair(p=>({...p,[side]:e.target.value}))}><option value="">Elegir…</option>{photos.map(p=><option key={p.path} value={p.path}>{fmt(p.date)}</option>)}</select></label>)}
   </div>
   {before&&after&&before.path!==after.path&&<div className="mt-3">
    <p className="text-xs text-gold">{span(daysBetween(before.date,after.date))} de diferencia</p>
    <div className="mt-2 grid grid-cols-2 gap-2">{[before,after].map(p=><figure key={p.path} className="overflow-hidden rounded-xl border border-hairline">
     {map[p.path]?<img src={map[p.path]} alt={`${PHOTO_POSES[p.pose]} ${fmt(p.date)}`} className="aspect-[3/4] w-full object-cover" loading="lazy"/>:<div className="grid aspect-[3/4] place-items-center text-xs text-muted-foreground">Cargando…</div>}
     <figcaption className="p-2 text-center text-[11px] text-muted-foreground">{fmt(p.date)}</figcaption></figure>)}</div>
   </div>}
  </div>}
  {photos.length>0&&<ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">{photos.slice(0,24).map((p:ProgressPhoto)=><li key={p.path} className="overflow-hidden rounded-xl border border-hairline">
   {map[p.path]?<img src={map[p.path]} alt={`${PHOTO_POSES[p.pose]} ${fmt(p.date)}`} className="aspect-[3/4] w-full object-cover" loading="lazy"/>:<div className="grid aspect-[3/4] place-items-center text-[11px] text-muted-foreground">…</div>}
   <div className="flex items-center justify-between gap-1 p-1.5 text-[10px] text-muted-foreground"><span>{fmt(p.date)}</span>
    {confirm===p.path?<button type="button" className="text-gym underline" disabled={run.isPending} onClick={()=>run.mutate(()=>deleteProgressPhoto(client,uid,p.path))}>Confirmar</button>
     :<button type="button" aria-label="Eliminar foto" onClick={()=>{run.reset();setConfirm(p.path);}}><Trash2 className="h-3.5 w-3.5"/></button>}</div>
  </li>)}</ul>}
 </SectionCard>;
}
