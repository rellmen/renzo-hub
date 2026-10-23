import {useEffect,useRef,useState} from 'react';
import {Download} from 'lucide-react';
import {useAuth} from '@/lib/auth/AuthProvider';
import {buildExport} from '@/lib/data-export.mjs';
import {SectionCard} from './primitives';

export function DataBackupPanel(){
 const {client,user}=useAuth();
 const identity=useRef(user?.id);
 identity.current=user?.id;
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState(false);
 useEffect(()=>()=>{identity.current=undefined;},[]);
 useEffect(()=>{setMessage('');setError(false);},[user?.id]);
 async function download(){
  const uid=user?.id;
  if(!client||!uid||busy)return;
  setBusy(true);setError(false);setMessage('Preparando tu copia…');
  try{
   const snapshot=await buildExport(client,uid,{onProgress:text=>{if(identity.current===uid)setMessage(text);}});
   if(identity.current!==uid)return;
   // Never label an incomplete backup as a successful migration checkpoint.
   if(snapshot.errors.length)throw Error(`Copia incompleta: ${snapshot.errors.join(' · ')}. No se ha descargado; vuelve a intentarlo o usa la versión clásica.`);
   const blob=new Blob([JSON.stringify(snapshot)],{type:'application/json'});
   const url=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=url;a.download=`rise-hub-copia-${snapshot.taken_at.slice(0,10)}.json`;
   document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60_000);
   const rows=Object.values(snapshot.tables).reduce((n,items)=>n+items.length,0);
   setMessage(`Copia preparada: ${rows} filas y ${snapshot.files.length} archivos. Comprueba que el archivo se ha guardado.`);
  }catch(e){if(identity.current===uid){setError(true);setMessage(e instanceof Error?e.message:'No se pudo preparar la copia.');}}
  finally{setBusy(false);}
 }
 return <SectionCard eyebrow="Copia personal" title="Exportar mis datos" accent="var(--gold)">
  <p className="text-sm leading-relaxed text-muted-foreground">Descarga tus registros privados y archivos de esta cuenta. Guarda la copia en un lugar privado. No incluye contraseñas, sesiones ni datos guardados únicamente en otros dispositivos.</p>
  <p className="mt-3 text-xs text-muted-foreground">Evita editar datos desde otros dispositivos mientras se prepara. La descarga admite hasta 60 MB de archivos y no modifica tu información.</p>
  <button type="button" className="btn-ghost mt-4 min-h-11" disabled={busy||!client||!user} onClick={()=>void download()}>
   <Download className="h-4 w-4"/>{busy?'Preparando copia…':'Descargar copia privada'}
  </button>
  {message&&<p role={error?'alert':'status'} className="mt-3 text-sm text-muted-foreground">{message}</p>}
 </SectionCard>;
}
