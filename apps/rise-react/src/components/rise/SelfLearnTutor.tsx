import {useEffect,useState,type FormEvent} from "react";
import {ShieldCheck,Send} from "lucide-react";
import {useAuth} from "@/lib/auth/AuthProvider";
import {SectionCard} from "@/components/rise/primitives";

type Course="nl"|"en";
type Mode="writing"|"conversation";
export function SelfLearnTutor({course}:{course:Course}){
 const {session}=useAuth();
 const [enabled,setEnabled]=useState(false);
 const [status,setStatus]=useState("Comprobando disponibilidad del tutor…");
 const [mode,setMode]=useState<Mode>("writing");
 const [answer,setAnswer]=useState("");
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [result,setResult]=useState("");
 const [error,setError]=useState("");
 useEffect(()=>{
  let alive=true;
  setEnabled(false);setStatus("Comprobando disponibilidad del tutor…");
  fetch("/api/selflearn-tutor",{credentials:"same-origin",cache:"no-store"})
   .then(async r=>r.ok?await r.json():{enabled:false})
   .then(data=>{if(!alive)return;setEnabled(data?.enabled===true);
    setStatus(data?.enabled===true?"Disponible con 12 consultas compartidas al día.":"Tutor remoto no activado en este entorno.");})
   .catch(()=>{if(alive)setStatus("No se pudo comprobar el tutor remoto.");});
  return()=>{alive=false;};
 },[]);
 useEffect(()=>{setResult("");setError("");setConsent(false);},[course]);
 async function send(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!session?.access_token||!enabled||!consent||!answer.trim())return;
  setBusy(true);setError("");setResult("");
  try{
   const response=await fetch("/api/selflearn-tutor",{method:"POST",credentials:"same-origin",cache:"no-store",
    headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},
    body:JSON.stringify({course,mode,answer:answer.trim(),consent:true})});
   const data=await response.json();
   if(!response.ok)throw Error(typeof data?.error==="string"?data.error:"El tutor no está disponible.");
   const text=String(data?.text??data?.feedback??"").slice(0,3500);
   if(!text.trim())throw Error("El tutor no ha generado ninguna corrección.");
   setResult(text);setConsent(false);
  }catch(ex){setError(ex instanceof Error?ex.message:"No se pudo consultar el tutor.");}
  finally{setBusy(false);}
 }
 return <SectionCard eyebrow="SELFLEARN · CORRECCIÓN GUIADA" title="Tutor IA de idiomas" accent="var(--learn)">
  <p className="text-sm text-platinum/80">Redacta un texto en {course==="nl"?"neerlandés":"inglés"} y recibe observaciones. El tutor solo recibe el texto que envíes expresamente; no accede al resto de tus microapps.</p>
  <p className="mt-2 text-xs text-muted-foreground" role="status">{status}</p>
  {enabled&&<form onSubmit={e=>void send(e)} className="mt-4 space-y-3">
   <label className="block text-xs text-muted-foreground">Actividad
    <select value={mode} onChange={e=>setMode(e.target.value as Mode)}
     className="mt-1 min-h-11 w-full rounded-xl border border-hairline bg-obsidian px-3 text-foreground">
     <option value="writing">Escritura</option><option value="conversation">Conversación escrita</option>
    </select>
   </label>
   <label className="block text-xs text-muted-foreground">Tu texto (máximo 1200 caracteres)
    <textarea value={answer} maxLength={1200} rows={4} onChange={e=>setAnswer(e.target.value)}
     placeholder="Escribe aquí tu respuesta en el idioma elegido"
     className="mt-1 min-h-28 w-full rounded-xl border border-hairline bg-obsidian p-3 text-foreground"/>
   </label>
   <label className="flex items-start gap-3 text-xs text-platinum/80">
    <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/>
    <span>Autorizo enviar <strong>este texto</strong> a OpenRouter para obtener una corrección. No se enviarán mis datos financieros, médicos ni conversaciones anteriores.</span>
   </label>
   <button type="submit" className="btn-gold" disabled={!consent||!answer.trim()||busy}>
    <Send className="h-4 w-4"/> {busy?"Corrigiendo…":"Solicitar corrección"}</button>
  </form>}
  {error&&<p role="alert" className="mt-3 text-sm text-gym">{error}</p>}
  {result&&<div className="mt-3 whitespace-pre-wrap rounded-xl border border-hairline p-4 text-sm text-platinum/90" role="status">{result}</div>}
  <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0"/>
   Requiere consentimiento en cada consulta, sesión válida y cuota verificada en Supabase. No evalúa pronunciación ni certifica niveles.</p>
 </SectionCard>;
}
