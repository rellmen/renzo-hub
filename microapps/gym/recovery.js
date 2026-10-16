// Recovery signals are self-reported trends, not measured physiological readiness.
function validScore(value){return Number.isFinite(Number(value))&&Number(value)>=1&&Number(value)<=10?Number(value):null;}
export function recoveryInsights(sessions,referenceDate=new Date()){
 const now=new Date(referenceDate);now.setHours(12,0,0,0);
 const earliest=new Date(now);earliest.setDate(earliest.getDate()-13);
 const recent=(sessions||[]).filter(s=>s?.completed_at&&/^\d{4}-\d{2}-\d{2}$/.test(s.workout_date||'')).filter(s=>{
  const d=new Date(s.workout_date+'T12:00:00');return !Number.isNaN(d.getTime())&&d>=earliest&&d<=now;
 }).sort((a,b)=>a.workout_date.localeCompare(b.workout_date));
 const scored=recent.map(s=>({date:s.workout_date,energy:validScore(s.energy),fatigue:validScore(s.fatigue)}));
 const mean=values=>values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length*10)/10:null;
 const energies=scored.map(s=>s.energy).filter(v=>v!==null);
 const fatigues=scored.map(s=>s.fatigue).filter(v=>v!==null);
 const averageEnergy=mean(energies),averageFatigue=mean(fatigues);
 const hasEnough=energies.length>=3&&fatigues.length>=3;
 let interpretation='Datos insuficientes: registra energía y fatiga en al menos tres sesiones.';
 if(hasEnough){
  if(averageFatigue>=7||averageEnergy<=4) interpretation='Los registros reflejan fatiga alta o energía baja. Considera una sesión suave o descanso y revisa sueño y molestias.';
  else if(averageFatigue>=5||averageEnergy<=6) interpretation='Señales mixtas: valora reducir intensidad o volumen según cómo te sientas.';
  else interpretation='Tus registros recientes son favorables, pero no garantizan recuperación muscular.';
 }
 const latest=recent.at(-1)?.workout_date||null;
 return {sessions:recent.length,scoredSessions:Math.min(energies.length,fatigues.length),averageEnergy,averageFatigue,hasEnough,interpretation,latest,scored};
}
