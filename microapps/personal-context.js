// Suggestions come from earlier conversations. They are NOT confirmed current facts.
// Use only for an explicit user review. No automatic writes or outbound AI prompts.
export const PERSONAL_CONTEXT_SUGGESTIONS=Object.freeze({
 residence:{value:'Leende, Países Bajos',source:'Conversaciones anteriores',sensitive:false},
 nativeLanguages:{value:'Español, catalán',source:'Conversaciones anteriores',sensitive:false},
 englishGoal:{value:'',source:'Meta de inglés introducida por el usuario',sensitive:false},
 dutchGoal:{value:'A1–A2 → B1',source:'Conversaciones anteriores',sensitive:false},
 career:{value:'Logística en entorno ASML; objetivo Logistics Data Analyst',source:'Conversaciones anteriores',sensitive:false},
 workShifts:{value:'Semanas alternas 06:00–15:00 / 15:00–00:00',source:'Conversaciones anteriores',sensitive:false}
});
export const PERSONAL_CONTEXT_KEYS=Object.freeze(Object.keys(PERSONAL_CONTEXT_SUGGESTIONS));
export function sanitizePersonalContext(input){
 const now={};
 for(const key of PERSONAL_CONTEXT_KEYS){
  const row=input?.[key];
  if(row?.confirmed!==true||typeof row.value!=='string')continue;
  const value=row.value.trim().slice(0,240);
  if(value)now[key]={value,confirmed:true,confirmedAt:typeof row.confirmedAt==='string'?row.confirmedAt:null,source:typeof row.source==='string'?row.source.slice(0,120):'Introducido por el usuario'};
 }
 return now;
}
