// Home uses only authenticated, persisted records. No invented progress.
export function summarizeBodyHome(sessions=[],skinLogs=[]){
 const completed=sessions.filter(s=>s?.completed_at&&/^\d{4}-\d{2}-\d{2}$/.test(s.workout_date||'')).sort((a,b)=>b.workout_date.localeCompare(a.workout_date));
 const gym=completed[0]?{date:completed[0].workout_date,title:completed[0].title||'Entrenamiento registrado'}:null;
 const skin={am:0,pm:0};
 for(const row of skinLogs){if((row.session==='am'||row.session==='pm')&&Array.isArray(row.completed_steps))skin[row.session]=row.completed_steps.filter(n=>Number.isInteger(n)&&n>=0).length;}
 return {gym,skin};
}
export function mountHomeBodySummary(root,db,getUser){
 const render=(data)=>{
  if(!root)return;root.replaceChildren();root.hidden=!data;
  if(!data)return;
  const heading=document.createElement('b');heading.textContent='Actividad registrada';root.append(heading);
  for(const value of [data.gym?'Último entrenamiento: '+data.gym.date+' · '+data.gym.title:'Gym: sin sesiones completadas','Skin hoy: mañana '+data.skin.am+' pasos · noche '+data.skin.pm+' pasos']){
   const p=document.createElement('p');p.className='small';p.textContent=value;root.append(p);
  }
 };
 async function load(){
  const user=getUser();if(!user){render(null);return;}
  const uid=user.id,now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  const [gym,skin]=await Promise.all([
   db.from('gym_sessions').select('workout_date,title,completed_at').eq('user_id',uid).not('completed_at','is',null).order('workout_date',{ascending:false}).limit(5),
   db.from('skin_routine_logs').select('session,completed_steps').eq('user_id',uid).eq('routine_date',today)
  ]);
  if(getUser()?.id!==uid)return;
  if(gym.error||skin.error){render(null);return;}
  render(summarizeBodyHome(gym.data||[],skin.data||[]));
 }
 return {load,reset(){render(null);}};
}
