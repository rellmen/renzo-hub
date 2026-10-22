import {useRef,useState} from 'react';
import {useMutation,useQueryClient} from '@tanstack/react-query';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {LearningRecord} from '@/lib/selflearn-snapshot.mjs';
import {saveVocabularyReview,type ReviewGrade} from '@/lib/selflearn-review.mjs';
import {officialSelfLearnAwardsEnabled} from '@/lib/nocturne-environment.mjs';

export function SelfLearnVocabularyReview({client,uid,course,cards,legacyActive}:{
 client:SupabaseClient|null;uid:string;course:'nl'|'en';cards:LearningRecord[];legacyActive:boolean
}){
 const qc=useQueryClient();
 const [revealed,setRevealed]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 // Keep the same intent after a lost response, including grade and timestamp.
 const intent=useRef<{key:string;id:string;grade:ReviewGrade;at:Date}|null>(null);
 const now=new Date();
 const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 const due=cards.filter(c=>(c.course||(c['area']==='English'?'en':'nl'))===course)
  .filter(c=>c.fsrsCard?.due?Date.parse(c.fsrsCard.due)<=now.getTime():!c.nextReview||c.nextReview<=today);
 const card=due[0];
 const revision=card?card.id+':'+String(card['updatedAt']):'';
 const save=useMutation({mutationFn:async(grade:ReviewGrade)=>{
   if(!client||!card||legacyActive)throw Error('Termina primero la sesión clásica y recarga los repasos.');
   const key=uid+':'+revision;
   if(intent.current?.key!==key)intent.current={key,id:crypto.randomUUID(),grade,at:new Date()};
   if(intent.current.grade!==grade)throw Error('Reintenta la misma calificación para confirmar el repaso pendiente.');
   return saveVocabularyReview(client,uid,card,grade,{reviewId:intent.current.id,at:intent.current.at});
  },onSuccess:async()=>{
   setMessage('Repaso confirmado y próxima fecha guardada.');setRevealed(null);
   await qc.invalidateQueries({queryKey:['selflearn-snapshot',uid]});
  }});
 if(!officialSelfLearnAwardsEnabled(import.meta.env['VITE_ENABLE_SELFLEARN_AWARDS']==='true',{
   hostname:typeof window==='undefined'?'':window.location.hostname,
   releaseTarget:import.meta.env['VITE_NOCTURNE_RELEASE_TARGET']||''
 }))return null;
 return <section className="surface rim space-y-4 p-5 sm:p-6" aria-label="Repaso de vocabulario">
  <h2 className="font-display text-2xl">Vocabulario para repasar</h2>
  <p className="text-sm text-muted-foreground">{due.length} tarjetas pendientes. Valora cuánto has recordado después de ver la respuesta.</p>
  {legacyActive?<p role="status">Termina tu sesión clásica antes de repasar aquí.</p>:card?<div className="space-y-4">
   <p className="font-display text-3xl">{String(card['front']||'')}</p>
   {revealed===revision?<><p className="text-lg">{String(card['back']||'')}</p>
    <div className="flex flex-wrap gap-2">{([
      ['again','Otra vez'],['hard','Difícil'],['good','Bien'],['easy','Fácil']
    ] as const).map(([grade,label])=><button key={grade} type="button" className="btn-ghost min-h-11"
      disabled={save.isPending} onClick={()=>save.mutate(grade)}>{label}</button>)}</div>
   </>:<button type="button" className="btn-gold min-h-11" onClick={()=>{setRevealed(revision);setMessage('');save.reset();}}>Mostrar respuesta</button>}
  </div>:<p>Sin tarjetas pendientes en este idioma.</p>}
  {message&&<p role="status" className="text-sm">{message}</p>}
  {save.error&&<p role="alert" className="text-sm text-gym">{save.error instanceof Error?save.error.message:'No se ha confirmado el repaso.'}</p>}
 </section>;
}
