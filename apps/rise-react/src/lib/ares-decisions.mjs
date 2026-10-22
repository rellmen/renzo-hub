// A decision changes only the stored approval record. No dispatch/network execution.
export async function reviewAresRequest(client,uid,row,decision,{now=()=>new Date()}={}){
 if(!uid||row?.owner_id!==uid)throw Error('La solicitud no pertenece a la cuenta activa.');
 const operation=row.record_type==='ares_operation'&&row.status==='pending_approval';
 const simple=row.record_type==='ares_decision'&&row.status==='pending';
 if(!['approved','rejected'].includes(decision)||(!operation&&!simple)||row.domain!=='system'||!row.id||!row.updated_at)
  throw Error('Esta revisión no está permitida. Actualiza los registros.');
 const stamp=now().toISOString();
 const payload={...(row.payload||{}),...(operation
  ?{approvedBy:'owner',reviewedAt:stamp,executionStatus:'not_connected',executed:false}
  :{decidedAt:stamp,decisionBy:'owner'})};
 const {data,error}=await client.from('hub_records').update({status:decision,requires_review:false,payload})
  .eq('id',row.id).eq('owner_id',uid).eq('domain','system').eq('record_type',row.record_type)
  .eq('status',row.status).eq('updated_at',row.updated_at).select('*').maybeSingle();
 if(error)throw Error(error.message||'No se pudo guardar la decisión.');
 if(!data)throw Error('La solicitud ha cambiado en otro dispositivo. Actualiza antes de decidir.');
 return data;
}
