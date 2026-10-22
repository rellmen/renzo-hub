import {createFileRoute} from "@tanstack/react-router";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useMemo,useState,type FormEvent} from "react";
import {BookOpen,Check,FilePenLine,Plus,RefreshCw,ShieldCheck,Trash2,X} from "lucide-react";
import {pageHead} from "@/lib/seo";
import {PageHeader,SectionCard,EmptyState} from "@/components/rise/primitives";
import {useAuth} from "@/lib/auth/AuthProvider";
import {createRecords,type HubNote} from "@/lib/legacy-records.mjs";

export const Route=createFileRoute("/notas")({
  head:()=>pageHead("Notas","Notas personales reales y privadas de RISE HUB."),
  component:Notes
});
type Input={title:string;body:string};
const EMPTY:Input={title:"",body:""};
function humanError(error:unknown){return error instanceof Error?error.message:"No se pudo sincronizar la nota.";}
function Notes(){
  const {client,user}=useAuth();
  const uid=user?.id||"";
  const qc=useQueryClient();
  const [input,setInput]=useState<Input>(EMPTY);
  const [edit,setEdit]=useState<HubNote|null>(null);
  const [confirmId,setConfirmId]=useState<string|null>(null);
  const store=useMemo(()=>client&&uid?createRecords(client,()=>({id:uid}),{domain:"personal",type:"note"}):null,[client,uid]);
  const key=["notes",uid];
  const notes=useQuery({
    queryKey:key,enabled:!!store,
    queryFn:async()=>{if(!store)throw Error("Sesión no disponible.");return store.list({limit:200});},
    staleTime:15000,refetchOnWindowFocus:true
  });
  const save=useMutation({
    mutationFn:async()=>{
      if(!store)throw Error("Inicia sesión antes de guardar.");
      const title=input.title.trim().slice(0,200);
      const body=input.body.trim().slice(0,5000);
      if(!title)throw Error("El título es obligatorio.");
      if(edit){
        // Preserve additional legacy payload fields on edits.
        return store.update(edit.id,{title,payload:{...(edit.payload||{}),body}});
      }
      return store.add({title,payload:{body}});
    },
    onSuccess:async()=>{setInput(EMPTY);setEdit(null);await qc.invalidateQueries({queryKey:key});}
  });
  const remove=useMutation({
    mutationFn:async(id:string)=>{
      if(!store)throw Error("La sesión ha terminado.");
      await store.remove(id);
    },
    onSuccess:async()=>{setConfirmId(null);await qc.invalidateQueries({queryKey:key});}
  });
  function chooseEdit(note:HubNote){
    setEdit(note);setInput({title:note.title||"",body:String(note.payload?.body||"")});
    setConfirmId(null);
  }
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();save.mutate();}
  return <div className="space-y-6">
    <PageHeader eyebrow="NOTAS · ÁREA PRIVADA" title="Ideas que permanecen."
      subtitle="Captura, consulta y organiza tus notas reales. Los registros se guardan en tu cuenta de Supabase."/>
    <p className="flex items-center gap-2 text-xs text-platinum/75">
      <ShieldCheck className="h-4 w-4 text-gold"/> Las notas de esta pantalla están protegidas por la misma cuenta y las políticas de RLS de RISE HUB.
    </p>
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <SectionCard eyebrow={edit?"Modificar":"Nueva nota"} title={edit?"Editar nota existente":"Escribe algo importante"} accent="var(--projects)">
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-2 text-xs text-muted-foreground">Título
            <input required maxLength={200} autoComplete="off" value={input.title}
              onChange={e=>setInput(v=>({...v,title:e.target.value}))}
              className="min-h-12 w-full rounded-xl border border-input bg-obsidian px-4 text-sm text-foreground"
              placeholder="Título de la nota"/>
          </label>
          <label className="block space-y-2 text-xs text-muted-foreground">Contenido
            <textarea rows={7} maxLength={5000} value={input.body}
              onChange={e=>setInput(v=>({...v,body:e.target.value}))}
              className="min-h-44 w-full rounded-xl border border-input bg-obsidian p-4 text-sm text-foreground"
              placeholder="Tu idea, reflexión o referencia…"/>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-gold" disabled={save.isPending}>
              {save.isPending?"Guardando…":<><Check className="h-4 w-4"/> {edit?"Actualizar nota":"Guardar nota"}</>}
            </button>
            {edit&&<button type="button" className="btn-ghost"
              onClick={()=>{setEdit(null);setInput(EMPTY);}}><X className="h-4 w-4"/>Cancelar edición</button>}
          </div>
          {save.error&&<p role="alert" className="text-sm text-gym">{humanError(save.error)}</p>}
        </form>
      </SectionCard>
      <SectionCard eyebrow="Tu archivo" title="Notas guardadas" accent="var(--projects)"
        action={<button type="button" className="btn-ghost min-h-10 px-3"
          onClick={()=>void notes.refetch()} disabled={notes.isFetching}>
          <RefreshCw className={"h-4 w-4 "+(notes.isFetching?"animate-spin":"")}/> Actualizar
        </button>}>
        {notes.isLoading&&<p role="status" className="text-sm text-muted-foreground">Cargando tus notas…</p>}
        {notes.error&&<p role="alert" className="rounded-xl border border-gym/40 p-4 text-sm text-gym">
          No se pudieron cargar las notas: {humanError(notes.error)}.
        </p>}
        {notes.data?.length===0&&<EmptyState icon={<BookOpen className="h-5 w-5"/>}
          title="Todavía no hay notas" text="Las notas privadas aparecerán aquí cuando las guardes."/>}
        {notes.data&&notes.data.length>0&&<ul className="space-y-3">
          {notes.data.map(n=><li key={n.id} className="rounded-2xl border border-hairline bg-raised p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                {n.occurred_at?new Date(n.occurred_at).toLocaleDateString("es-ES",{dateStyle:"medium"}):"Sin fecha"}
              </p>
              <span className="rounded-full border border-hairline px-2 py-0.5 text-[10px] text-platinum/70">Privada</span>
            </div>
            <h3 className="mt-2 break-words font-display text-xl">{n.title||"Sin título"}</h3>
            {n.payload?.body&&<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-platinum/80">{String(n.payload.body)}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn-ghost min-h-10 px-3" disabled={save.isPending||remove.isPending}
                onClick={()=>chooseEdit(n)}><FilePenLine className="h-4 w-4"/> Editar</button>
              <button type="button" disabled={remove.isPending}
                className={"btn-ghost min-h-10 px-3 "+(confirmId===n.id?"border-gym/40 text-gym":"")}
                onClick={()=>{
                  if(confirmId!==n.id){setConfirmId(n.id);return;}
                  remove.mutate(n.id);
                }}><Trash2 className="h-4 w-4"/>
                {confirmId===n.id?"Confirmar eliminación":"Eliminar"}
              </button>
            </div>
          </li>)}
        </ul>}
        {remove.error&&<p role="alert" className="mt-4 text-sm text-gym">{humanError(remove.error)}</p>}
        {notes.data&&notes.data.length>=200&&<p className="mt-4 text-xs text-muted-foreground">
          Mostrando hasta 200 registros. El histórico completo deberá incorporar paginación.
        </p>}
      </SectionCard>
    </div>
  </div>;
}
