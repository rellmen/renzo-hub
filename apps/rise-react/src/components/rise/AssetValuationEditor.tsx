import {useEffect,useState} from "react";
import {useMutation,useQueryClient} from "@tanstack/react-query";
import {Plus,ShieldCheck} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {saveAssetValuation} from "@/lib/asset-valuations.mjs";

const dateToday=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
export function AssetValuationEditor(){
 const {client,user}=useAuth(),uid=user?.id||"";const qc=useQueryClient();
 const [kind,setKind]=useState<"investment"|"debt">("investment");
 const [name,setName]=useState(""),[value,setValue]=useState(""),[date,setDate]=useState(dateToday());
 const [message,setMessage]=useState("");
 useEffect(()=>{setKind("investment");setName("");setValue("");setDate(dateToday());setMessage("");},[uid]);
 const mutation=useMutation({mutationFn:async()=>{
  if(!client||!uid)throw Error("Inicia sesión para guardar la valoración.");
  return saveAssetValuation(client,uid,{kind,name,value,date});
 },onSuccess:async()=>{
  setMessage("Valoración guardada como un nuevo registro histórico. Ninguna valoración anterior se ha modificado.");
  setValue("");await qc.invalidateQueries({queryKey:["money-real",uid]});
 }});
 return <SectionCard eyebrow="MY FINANCE · PATRIMONIO" title="Registrar inversión o deuda" accent="var(--money)">
  <p className="text-sm text-platinum/80">Registra el valor actual de una inversión o lo que queda pendiente de una deuda. Cada actualización crea un dato histórico y nunca modifica tus movimientos bancarios.</p>
  <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();setMessage("");mutation.mutate();}}>
   <label className="text-xs text-muted-foreground">Tipo
    <select value={kind} onChange={e=>setKind(e.target.value as "investment"|"debt")} className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground">
     <option value="investment">Inversión</option><option value="debt">Deuda pendiente</option>
    </select>
   </label>
   <label className="text-xs text-muted-foreground">Nombre
    <input value={name} maxLength={60} required onChange={e=>setName(e.target.value)} placeholder="Cuenta de inversión o préstamo"
     className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground"/>
   </label>
   <label className="text-xs text-muted-foreground">Valor actual en euros
    <input value={value} required inputMode="decimal" onChange={e=>setValue(e.target.value)} placeholder="0,00"
     className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground"/>
   </label>
   <label className="text-xs text-muted-foreground">Fecha de valoración
    <input type="date" value={date} required max={dateToday()} onChange={e=>setDate(e.target.value)}
     className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground"/>
   </label>
   <div className="flex flex-col gap-2 sm:col-span-2">
    <button type="submit" className="btn-gold min-h-11 self-start" disabled={mutation.isPending||!uid}>
     <Plus className="h-4 w-4"/>{mutation.isPending?"Guardando…":"Guardar nueva valoración"}</button>
    {mutation.error&&<p role="alert" className="text-sm text-gym">{mutation.error instanceof Error?mutation.error.message:"No se pudo guardar."}</p>}
    {message&&<p role="status" className="text-sm text-money">{message}</p>}
   </div>
  </form>
  <p className="mt-3 flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0"/>No es una conexión bancaria. Una deuda se introduce por el capital que falta por devolver.</p>
 </SectionCard>;
}
