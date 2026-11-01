import {useEffect,useState} from "react";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {Bell,BellOff,Send} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";
import {pushSupport,enablePush,disablePush,currentEndpoint,listDevices,sendTest,type PushSupport} from "@/lib/push-client.mjs";

// Avisos: al momento con cada cosa nueva (bandeja, nóminas) y un resumen diario de lo pendiente.
export function NotificationsPanel(){
 const {client,user}=useAuth(),uid=user?.id||"";
 const qc=useQueryClient();
 const [support,setSupport]=useState<PushSupport|null>(null);
 const [mine,setMine]=useState<string|null>(null);
 const [msg,setMsg]=useState("");
 useEffect(()=>{setSupport(pushSupport());void currentEndpoint().then(setMine).catch(()=>setMine(null));},[]);
 const devices=useQuery({queryKey:["push-devices",uid],enabled:!!client&&!!uid,queryFn:()=>listDevices(client!)});
 const act=useMutation({mutationFn:async(what:"on"|"off"|"test")=>{
  if(!client)throw Error("Sesión necesaria.");
  if(what==="on"){const r=await enablePush(client);setMine(r.endpoint);return "Activadas en este dispositivo. Pulsa «Enviar prueba» para comprobarlo.";}
  if(what==="off"){await disablePush(client);setMine(null);return "Desactivadas en este dispositivo.";}
  const r=await sendTest(client);return `Prueba enviada a ${r.delivered} de ${r.devices} dispositivo(s).`;
 },onSuccess:async t=>{setMsg(t);await qc.invalidateQueries({queryKey:["push-devices",uid]});},onError:e=>setMsg(e instanceof Error?e.message:"No se pudo completar.")});
 const here=!!mine&&(devices.data||[]).some(d=>d.endpoint===mine);
 return <SectionCard eyebrow="Avisos" title="Notificaciones" accent="var(--gold)">
  <div data-testid="notifications" className="space-y-3 text-sm">
   <p className="text-muted-foreground">Te avisa al momento cuando llega algo nuevo a la bandeja o una nómina, y una vez al día con lo que siga pendiente (bandeja, nóminas sin revisar y extractos del cierre de mes). Solo el título y un resumen; nunca importes de cuentas.</p>
   {support&&!support.supported&&<p role="status">Este navegador no admite notificaciones.</p>}
   {support?.needsInstall&&<p role="status" className="rounded-xl border border-gold/40 p-3">En iPhone (iOS 16.4 o posterior): abre Rise en Safari, pulsa Compartir y «Añadir a pantalla de inicio». Después abre Rise desde ese icono y vuelve aquí.</p>}
   {support?.permission==="denied"&&!support.needsInstall&&<p role="alert" className="text-gym">Las notificaciones están bloqueadas para Rise. Actívalas en Ajustes del sistema &gt; Notificaciones &gt; Rise.</p>}
   <div className="flex flex-wrap gap-2">
    {!here&&<button type="button" className="btn-gold min-h-11 px-4" disabled={!support?.supported||support.needsInstall||act.isPending} onClick={()=>{setMsg("");act.mutate("on");}}><Bell className="h-4 w-4"/>Activar en este dispositivo</button>}
    {here&&<button type="button" className="btn-ghost min-h-11 px-4" disabled={act.isPending} onClick={()=>{setMsg("");act.mutate("test");}}><Send className="h-4 w-4"/>Enviar prueba</button>}
    {here&&<button type="button" className="btn-ghost min-h-11 px-4" disabled={act.isPending} onClick={()=>{setMsg("");act.mutate("off");}}><BellOff className="h-4 w-4"/>Desactivar aquí</button>}
   </div>
   {msg&&<p role="status">{msg}</p>}
   {!!devices.data?.length&&<ul className="divide-y divide-hairline text-xs text-muted-foreground">{devices.data.map(d=><li key={d.id} className="py-2">
    {d.label||"Dispositivo"}{d.endpoint===mine?" (este)":""} · activado {d.created_at.slice(0,10)}{d.last_ok_at?` · último aviso ${d.last_ok_at.slice(0,16).replace("T"," ")}`:""}
   </li>)}</ul>}
  </div>
 </SectionCard>;
}
