// Reuse only load/repetition/RIR from a logged set; side and completion always require confirmation.
export function quickSetValues(source){
 if(!source)return null;
 const weight=Number(source.weight),reps=Number(source.reps),rir=Number(source.rir);
 if(source.weight===null||source.reps===null||source.rir===null)return null;
 if(!Number.isFinite(weight)||weight<0||!Number.isInteger(reps)||reps<1||reps>100||!Number.isFinite(rir)||rir<0||rir>10)return null;
 return {weight,reps,rir};
}
