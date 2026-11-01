import {useEffect,useMemo,useRef,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {Camera,Link2,ScanText,Sparkles,Trash2,Plus,Image as ImageIcon} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {parseReceiptText,matchBankTx,autoMatch,cleanItems,itemsSum,loadReceipts,uploadReceiptPhoto,saveReceipt,receiptPhotoUrl,type ReceiptRecord} from "@/lib/receipts.mjs";
import {compressPhoto,readOnDevice,blobToDataUrl,receiptAiStatus,askReceiptItems} from "@/lib/receipt-reader.mjs";

const eur=new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"});
type Line={name:string;qty:string;price:string};
type Draft={id:string;blob:Blob;url:string;pct:number;reading:boolean;text:string;store:string;date:string;total:string;lines:Line[];bankTxId:string;touchedBank:boolean;ai:string|null};
const num=(s:string)=>{const n=Number(String(s).replace(/\s/g,"").replace(",","."));return Number.isFinite(n)?n:NaN;};
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Amsterdam"}).format(new Date());

type BankItem={id:string;date:string;amount:number;name?:string;merchant?:string;bank?:string};
export function ReceiptsPanel({items,month}:{items:BankItem[];month:string}){
 const {client,user,session}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const receipts=useQuery({queryKey:["receipts",uid],enabled:!!client&&!!uid,queryFn:()=>loadReceipts(client!,uid),staleTime:15000});
 const aiOn=useQuery({queryKey:["receipt-ai"],queryFn:()=>receiptAiStatus(),staleTime:300000});
 const [draft,setDraft]=useState<Draft|null>(null);
 const [error,setError]=useState("");const [status,setStatus]=useState("");
 const [aiBusy,setAiBusy]=useState(false);const [consent,setConsent]=useState(false);const [needsCollection,setNeedsCollection]=useState(false);
 const [showText,setShowText]=useState(false);
 const fileRef=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{if(draft?.url)URL.revokeObjectURL(draft.url);},[draft?.url]);

 const linked=useMemo(()=>new Set((receipts.data||[]).map(r=>r.payload?.bank_tx_id).filter(Boolean) as string[]),[receipts.data]);
 const total=draft?num(draft.total):NaN;
 const cands=useMemo(()=>draft?matchBankTx({store:draft.store,date:draft.date,total},items,linked):[],[draft?.store,draft?.date,total,items,linked]);
 useEffect(()=>{if(draft&&!draft.touchedBank){const pick=autoMatch(cands);if(pick!==draft.bankTxId)setDraft(d=>d&&{...d,bankTxId:pick});}},[cands]);// eslint-disable-line react-hooks/exhaustive-deps

 const update=(p:Partial<Draft>)=>setDraft(d=>d&&{...d,...p});
 async function pick(file:File|undefined){
  setError("");setStatus("");setNeedsCollection(false);setConsent(false);setShowText(false);
  if(!file)return;
  try{
   const blob=await compressPhoto(file);
   const d:Draft={id:crypto.randomUUID(),blob,url:URL.createObjectURL(blob),pct:0,reading:true,text:"",store:"",date:today(),total:"",lines:[],bankTxId:"",touchedBank:false,ai:null};
   setDraft(d);
   const text=await readOnDevice(blob,pct=>setDraft(x=>x&&x.id===d.id?{...x,pct}:x));
   const read=parseReceiptText(text);
   setDraft(x=>x&&x.id===d.id?{...x,reading:false,text,store:read.store||x.store,date:read.date||x.date,total:read.total!=null?read.total.toFixed(2).replace(".",","):x.total}:x);
   if(read.total==null||!read.date)setStatus("No he leído todo con seguridad: revisa y completa los campos.");
  }catch(e){setError(e instanceof Error?e.message:"No se pudo leer la foto.");setDraft(x=>x&&{...x,reading:false});}
  finally{if(fileRef.current)fileRef.current.value="";}
 }
 async function readItems(allowCollection=false){
  if(!draft)return;setError("");setAiBusy(true);
  try{
   const r=await askReceiptItems(session?.access_token||"",await blobToDataUrl(draft.blob),{allowCollection});
   update({lines:r.items.map(i=>({name:i.name,qty:String(i.qty),price:i.price.toFixed(2).replace(".",",")})),ai:r.model+(r.privacy==="allow"?" (puede guardar datos)":"")});
   setNeedsCollection(false);
   setStatus(`Leídos ${r.items.length} productos. Revísalos: la IA puede equivocarse.`);
  }catch(e){
   if((e as {needsConsent?:boolean}).needsConsent)setNeedsCollection(true);
   setError(e instanceof Error?e.message:"No se pudieron leer los productos.");
  }finally{setAiBusy(false);}
 }
 const lines=draft?cleanItems(draft.lines.map(l=>({name:l.name,qty:num(l.qty),price:num(l.price)}))):[];
 const diff=draft&&lines.length&&Number.isFinite(total)?Math.round((itemsSum(lines)-total)*100)/100:0;
 const save=useMutation({mutationFn:async()=>{
  if(!client||!draft)throw Error("Sesión necesaria.");
  if(draft.lines.length!==lines.length)throw Error("Hay productos sin nombre o con precio no válido: corrígelos o bórralos.");
  const photo=await uploadReceiptPhoto(client,uid,draft.id,draft.blob);
  return saveReceipt(client,uid,{id:draft.id,store:draft.store,date:draft.date,total,items:lines,bankTxId:draft.bankTxId,photo,ai:draft.ai});
 },onSuccess:async r=>{setDraft(null);setStatus(`Ticket guardado: ${r.title}.`);await qc.invalidateQueries({queryKey:["receipts",uid]});},
  onError:e=>setError(e instanceof Error?e.message:"No se pudo guardar.")});
 const [photo,setPhoto]=useState<{id:string;url:string}|null>(null);
 useEffect(()=>()=>{if(photo)URL.revokeObjectURL(photo.url);},[photo]);
 async function openPhoto(r:ReceiptRecord){try{setPhoto({id:r.id,url:await receiptPhotoUrl(client!,uid,r)});}catch(e){setError(e instanceof Error?e.message:"No se pudo abrir la foto.");}}
 const monthRows=(receipts.data||[]).filter(r=>String(r.payload?.date||"").startsWith(month));
 const txName=(id:string|null)=>{const t=items.find(i=>i.id===id);return t?`${t.date} · ${t.merchant||t.name} · ${t.bank}`:"";};
 const field="mt-1 block min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground";

 return <SectionCard eyebrow="Justificantes" title="Tickets de compra" accent="var(--money)">
  <div id="tickets" data-testid="receipts" className="space-y-4">
   <p className="text-sm text-muted-foreground">Haz una foto del ticket. Tienda, fecha y total se leen en tu móvil, sin enviar la foto a nadie. Nada se guarda hasta que lo revises.</p>
   <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only" id="receipt-photo" aria-label="Foto del ticket" onChange={e=>void pick(e.target.files?.[0])}/>
   {!draft&&<label htmlFor="receipt-photo" className="btn-gold inline-flex min-h-11 cursor-pointer items-center gap-2 px-4"><Camera className="h-4 w-4"/>Añadir ticket</label>}
   {draft&&<div className="grid gap-4 rounded-2xl border border-hairline p-4 md:grid-cols-[180px_minmax(0,1fr)]">
    <img src={draft.url} alt="Foto del ticket" className="max-h-72 w-full rounded-xl object-contain md:max-h-96"/>
    <div className="min-w-0 space-y-3">
     {draft.reading&&<p role="status" className="text-sm"><ScanText className="mr-1 inline h-4 w-4"/>Leyendo en el móvil… {draft.pct}%</p>}
     <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-xs text-muted-foreground">Tienda<input className={field} value={draft.store} onChange={e=>update({store:e.target.value})} maxLength={80}/></label>
      <label className="text-xs text-muted-foreground">Fecha<input className={field} type="date" value={draft.date} max={today()} onChange={e=>update({date:e.target.value})}/></label>
      <label className="text-xs text-muted-foreground">Total (€)<input className={field} inputMode="decimal" value={draft.total} onChange={e=>update({total:e.target.value})} placeholder="0,00"/></label>
     </div>
     {!!draft.text&&<button type="button" className="text-xs text-gold underline" onClick={()=>setShowText(v=>!v)}>{showText?"Ocultar":"Ver"} texto leído</button>}
     {showText&&<pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-obsidian p-3 text-xs">{draft.text}</pre>}

     <fieldset className="min-w-0 rounded-xl border border-hairline p-3 text-sm">
      <legend className="px-1 text-xs text-muted-foreground"><Link2 className="mr-1 inline h-3 w-3"/>Movimiento del banco</legend>
      {!cands.length&&<p className="text-xs text-muted-foreground">{Number.isFinite(total)&&total>0?"Ningún cargo de ese importe entre el día anterior y 5 días después. Si aún no has importado el extracto, guárdalo sin enlazar.":"Escribe el total para buscarlo."}</p>}
      {cands.map(c=><label key={c.id} className="flex items-start gap-2 py-1"><input type="radio" name="bank" className="mt-1 shrink-0" checked={draft.bankTxId===c.id} onChange={()=>update({bankTxId:c.id,touchedBank:true})}/>
       <span className="min-w-0 break-words">{c.date} · {c.name} · {c.bank} · {eur.format(c.amount)}{c.sameStore?" · mismo comercio":""}</span></label>)}
      {!!cands.length&&<label className="flex items-center gap-2 py-1"><input type="radio" name="bank" checked={!draft.bankTxId} onChange={()=>update({bankTxId:"",touchedBank:true})}/>Sin enlazar</label>}
     </fieldset>

     <fieldset className="min-w-0 rounded-xl border border-hairline p-3 text-sm">
      <legend className="px-1 text-xs text-muted-foreground">Productos (opcional)</legend>
      {draft.lines.map((l,i)=><div key={i} className="grid grid-cols-[64px_96px_auto] items-center gap-2 border-b border-hairline py-2 last:border-0 sm:grid-cols-[minmax(0,1fr)_64px_96px_auto]">
       <input aria-label={"Producto "+(i+1)} className={field+" col-span-3 mt-0 sm:col-span-1"} value={l.name} onChange={e=>update({lines:draft.lines.map((x,j)=>j===i?{...x,name:e.target.value}:x)})}/>
       <input aria-label={"Cantidad "+(i+1)} className={field+" mt-0"} inputMode="decimal" value={l.qty} onChange={e=>update({lines:draft.lines.map((x,j)=>j===i?{...x,qty:e.target.value}:x)})}/>
       <input aria-label={"Precio "+(i+1)} className={field+" mt-0"} inputMode="decimal" value={l.price} onChange={e=>update({lines:draft.lines.map((x,j)=>j===i?{...x,price:e.target.value}:x)})}/>
       <button type="button" aria-label={"Quitar producto "+(i+1)} className="btn-ghost min-h-9 justify-self-start px-2" onClick={()=>update({lines:draft.lines.filter((_,j)=>j!==i)})}><Trash2 className="h-4 w-4"/></button>
      </div>)}
      {!!lines.length&&<p className={"mt-1 text-xs "+(diff?"text-gym":"text-muted-foreground")} data-testid="receipt-diff">Suma {eur.format(itemsSum(lines))}{diff?` · no cuadra con el total (${diff>0?"+":""}${eur.format(diff)})`:" · cuadra con el total"}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
       <button type="button" className="btn-ghost min-h-9 px-3" onClick={()=>update({lines:[...draft.lines,{name:"",qty:"1",price:""}]})}><Plus className="h-4 w-4"/>Añadir producto</button>
       {aiOn.data&&<>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Enviar esta foto a OpenRouter (modelo gratuito) para leer los productos</label>
        <button type="button" className="btn-ghost min-h-9 px-3" disabled={!consent||aiBusy||draft.reading} onClick={()=>void readItems(false)}><Sparkles className="h-4 w-4"/>{aiBusy?"Leyendo…":"Leer productos"}</button>
       </>}
      </div>
      {needsCollection&&<div role="alert" className="mt-2 rounded-xl border border-gold/40 p-3 text-xs">
       <p>Ningún modelo gratuito que no guarde datos está disponible ahora. Puedes reintentar más tarde, escribirlos a mano, o aceptar un modelo que <strong>puede guardar la foto</strong>.</p>
       <button type="button" className="btn-ghost mt-2 min-h-9 px-3" disabled={aiBusy} onClick={()=>void readItems(true)}>Aceptar y leer igualmente</button>
      </div>}
     </fieldset>

     <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-gold min-h-11 px-4" disabled={draft.reading||save.isPending||!draft.store.trim()||!(total>0)} onClick={()=>{setError("");save.mutate();}}>{save.isPending?"Guardando…":"Guardar ticket"}</button>
      <button type="button" className="btn-ghost min-h-11 px-4" disabled={save.isPending} onClick={()=>{setDraft(null);setError("");setStatus("");}}>Descartar</button>
     </div>
    </div>
   </div>}
   {status&&<p role="status" className="text-sm">{status}</p>}
   {error&&<p role="alert" className="text-sm text-gym">{error}</p>}

   <div>
    <h3 className="text-xs uppercase tracking-wide text-muted-foreground">Guardados en {month||"este mes"}</h3>
    {receipts.isLoading&&<p className="text-sm">Cargando tickets…</p>}
    {receipts.error&&<p role="alert" className="text-sm text-gym">No se pudieron cargar los tickets.</p>}
    {receipts.data&&!monthRows.length&&<p className="text-sm text-muted-foreground">Aún no hay tickets este mes.</p>}
    <ul className="divide-y divide-hairline">{monthRows.map(r=><li key={r.id} className="py-3 text-sm">
     <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="min-w-0"><strong>{r.payload.store}</strong> · {r.payload.date} · {eur.format(r.payload.total)}{r.payload.items?.length?` · ${r.payload.items.length} productos`:""}</span>
      {r.payload.photo&&<button type="button" className="btn-ghost min-h-9 px-3 text-xs" onClick={()=>void openPhoto(r)}><ImageIcon className="h-4 w-4"/>Foto</button>}
     </div>
     <p className="mt-1 text-xs text-muted-foreground">{r.payload.bank_tx_id?("Enlazado: "+(txName(r.payload.bank_tx_id)||"movimiento de otro mes")):"Sin enlazar con el banco"}</p>
     {photo?.id===r.id&&<img src={photo.url} alt={"Ticket de "+r.payload.store} className="mt-2 max-h-96 rounded-xl"/>}
    </li>)}</ul>
   </div>
  </div>
 </SectionCard>;
}
