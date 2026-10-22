// Same FSRS implementation as classic; dates remain JSON-compatible in hub_records.
import {fsrs,createEmptyCard,Rating} from '../../../../microapps/selflearn/fsrs-bundle.js';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ratings={again:Rating.Again,hard:Rating.Hard,good:Rating.Good,easy:Rating.Easy};
const day=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
export function planVocabularyReview(item,grade,{at=new Date()}={}){
 if(!Object.hasOwn(ratings,grade))throw Error('Selecciona una calificación válida.');
 if(!UUID.test(item?.id||'')||!item.front||!item.back||!Number.isFinite(at?.getTime()))throw Error('Tarjeta o fecha inválida.');
 const old=item.fsrsCard;
 if(old&&(!Number.isFinite(Date.parse(old.due))||
   !['stability','difficulty','elapsed_days','scheduled_days','reps','lapses','state'].every(k=>Number.isFinite(old[k])&&old[k]>=0)||
   (old.last_review&&!Number.isFinite(Date.parse(old.last_review)))))
   throw Error('La tarjeta FSRS necesita revisión antes de reprogramarse.');
 const card=old?{...old,due:new Date(old.due),last_review:old.last_review?new Date(old.last_review):undefined}:createEmptyCard(at);
 const result=fsrs().next(card,at,ratings[grade]).card;
 return {...structuredClone(item),fsrsCard:JSON.parse(JSON.stringify(result)),nextReview:day(result.due),
   intervalDays:Number(result.scheduled_days)||0,repetitions:(Number(item.repetitions)||0)+1,
   lastReviewed:day(at),reviewHistory:[...(item.reviewHistory||[]),{date:day(at),grade,stability:Number(result.stability)||0}].slice(-100),
   updatedAt:at.toISOString()};
}
export async function saveVocabularyReview(client,uid,item,grade,{at=new Date(),reviewId}={}){
 if(!UUID.test(uid||''))throw Error('Inicia sesión para guardar el repaso.');
 if(!item?.updatedAt||!Number.isFinite(Date.parse(item.updatedAt)))throw Error('Recarga la versión actual de la tarjeta.');
 if(!UUID.test(reviewId||''))throw Error('Identificador de repaso inválido.');
 if(!client?.rpc)throw Error('El repaso atómico aún no está disponible.');
 const payload=planVocabularyReview(item,grade,{at});
 const result=await client.rpc('selflearn_review_vocabulary',{
   p_card:item.id,p_expected_updated_at:item.updatedAt,p_review:reviewId,p_payload:payload,p_grade:grade
 });
 if(result?.error)throw Error(result.error.message||'No se ha guardado el repaso.');
 if(result?.data?.id!==item.id||result?.data?.reviewId!==reviewId)throw Error('Supabase no confirmó el repaso.');
 return result.data;
}
