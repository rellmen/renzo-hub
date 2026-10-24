// Nocturne · separa el INGRESO REAL (nómina, toeslagen, otros ingresos) del dinero
// "Recibido de personas" (reembolsos, regalos, préstamos). La categorización Classic
// se reutiliza intacta; aquí solo se reparte lo que ya está categorizado.
// El balance de caja del mes NO cambia: lo recibido de personas sigue entrando en la cuenta.
const PEOPLE="personas_recibido";
const LOAN=/prestad|pr[eé]stamo|\blening\b|\bgeleend\b|\bloan\b|\bdevolver\b/i;
const round=n=>Math.round(n*100)/100;

/** Ingresos de personas de un mes, con los préstamos aparte. */
export function peopleReceived(items=[],month){
 let total=0,loans=0,count=0;
 for(const i of items){
  if(!i||i.category!==PEOPLE||!(i.amount>0)||!String(i.date||"").startsWith(month))continue;
  total+=i.amount;count++;
  if(LOAN.test(String(i.description||"")+" "+String(i.name||"")))loans+=i.amount;
 }
 return{total:round(total),loans:round(loans),count};
}

/**
 * Ajusta un resumen mensual Classic (monthInsights o monthSummary):
 * earned = solo ingresos reales; received = recibido de personas; cash = balance real del mes.
 */
export function withRealIncome(summary,items,month){
 if(!summary)return summary;
 const people=peopleReceived(items,month);
 const legacyEarned=Number(summary.earned)||0;
 const earned=round(Math.max(0,legacyEarned-people.total));
 const cash=round(legacyEarned-(Number(summary.spent)||0));
 return{...summary,earned,received:people.total,loans:people.loans,receivedCount:people.count,
  cash,savings:cash,rate:earned>0?Math.round((earned-(Number(summary.spent)||0))/earned*100):null};
}
