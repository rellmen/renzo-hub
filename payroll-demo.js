// Datos sintéticos. Se activan exclusivamente en los dos hostnames de staging (renzo-hub-2-1-staging y renzo-hub-2-1-staging-renzojesus99-1996) con ?demo=1.
export function createPayrollDemo(user_id){
 const year=new Date().getFullYear(),id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
 const f={documents:[],payslips:[],employers:[{id:id(900),name:'Empresa de demostración',normalized_code:'DEMO'}],anomalies:[],events:[],lines:[],validations:[],versions:[],rates:[{employer_code:'DEMO',hourly_rate:18,from_period:`${year}-W30`,to_period:`${year}-W41`,payslips:12}],queue:[]};
 for(let i=0;i<12;i++){
  const day=new Date(Date.UTC(year,6,20+i*7)).toISOString(),pending=i===11;
  f.documents.unshift({id:id(i+1),user_id,original_file_name:`demo-semana-${30+i}.pdf`,source:'telegram',storage_path_raw:`${user_id}/demo-${i+1}.pdf`,status:pending?'review_required':'processed',attempt_count:1,created_at:day});
  f.payslips.unshift({id:id(i+101),user_id,document_id:id(i+1),employer_id:id(900),period_year:year,period_type:'weekly',period_label:`${year}-W${30+i}`,period_number:30+i,period_start:day.slice(0,10),payment_date:day.slice(0,10),net_salary:500+i*5,gross_salary:720,loonheffing:220-i*5,worked_hours:40,hourly_rate:18,review_status:pending?'pending':'approved',validation_status:pending?'review_required':'verified',confidence_overall:pending?.82:.98,field_confidence:{net_salary:pending?.78:.99},summary:'Nómina ficticia para probar el módulo.'});
  f.events.push({id:id(300+i),document_id:id(i+1),event_type:'registered',detail:{source:'telegram'},created_at:day},{id:id(400+i),document_id:id(i+1),event_type:'ingested',detail:{demo:true},created_at:day});
  f.lines.push({payslip_id:id(i+101),category:'income',label_original:'Salario ordinario (demo)',quantity:40,rate:18,amount:720,sort_order:1});
  f.validations.push({payslip_id:id(i+101),rule_code:'R01',severity:pending?'medium':'low',passed:!pending,message:pending?'Comprobar el neto contra el PDF':'Importes coherentes',expected:555,actual:555,difference:0});
 }
 f.documents.unshift({id:id(800),user_id,original_file_name:'demo-procesando.pdf',source:'telegram',status:'processing',attempt_count:1,created_at:new Date().toISOString()},{id:id(801),user_id,original_file_name:'demo-error.pdf',source:'telegram',status:'failed',attempt_count:2,last_error_code:'DEMO_OCR',last_error_message:'No se pudo leer el documento de demostración.',created_at:new Date().toISOString()});
 f.anomalies=[{id:id(700),payslip_id:id(112),document_id:id(12),severity:'medium',status:'open',title:'Revisar importe neto (demo)',details:'Confianza baja en el importe extraído.'}];
 const recalculate=()=>{f.confirmed=f.payslips.filter(p=>['approved','not_required'].includes(p.review_status)).map(p=>({...p,ref_date:p.payment_date,employer_name:'Empresa de demostración'}));const sum=k=>f.confirmed.reduce((n,p)=>n+Number(p[k]||0),0);f.ytd=[{year,user_id,net_ytd:sum('net_salary'),gross_ytd:sum('gross_salary'),tax_ytd:sum('loonheffing'),hours_ytd:sum('worked_hours'),effective_net_hourly:sum('net_salary')/sum('worked_hours')}];f.monthly=[];for(const p of f.confirmed){const month=p.payment_date.slice(0,7)+'-01';let m=f.monthly.find(x=>x.month===month);if(!m){m={month,user_id,gross:0,net:0,tax:0,hours:0};f.monthly.push(m);}m.gross+=p.gross_salary;m.net+=p.net_salary;m.tax+=p.loonheffing;m.hours+=p.worked_hours;}};
 f.applyReview=(pid,changes,decision)=>{const p=f.payslips.find(p=>p.id===pid);f.versions.push({payslip_id:pid,previous:{...p},created_at:new Date().toISOString()});Object.assign(p,changes,{review_status:decision});f.documents.find(d=>d.id===p.document_id).status='processed';f.anomalies.filter(a=>a.payslip_id===pid&&a.status==='open').forEach(a=>a.status='acknowledged');recalculate();};
 // Agregados mensuales independientes, enteramente ficticios, por fecha de pago.
 f.monthly_nl=[9,8,7].map((month,i)=>{
  const bruto=3000-i*300,loonheffing=400-i*50,pensioen=100,premies=20,neto=bruto-loonheffing-pensioen-premies,extra=i===0?4:0;
  return {user_id,mes:`${year}-${String(month).padStart(2,'0')}-01`,mes_label:`${year}-${String(month).padStart(2,'0')}`,pagos:i===0?5:4,correcciones:i===0?1:0,pendientes_revision:i===0?1:0,
   bruto,neto,loonheffing,pensioen,premies,total_retenciones:loonheffing+pensioen+premies,allowances_netas:100,cobrado_banco:neto+100,
   horas_trabajadas:144+extra,horas_normales:136,horas_ort:8,horas_extra:extra,salario_base:bruto-200-extra*25,toeslagen:200,pago_horas_extra:extra*25,feestdagen:0,vakantiegeld_pagado:0,verlof_pagado:0,ziekte_pagado:0,otros_ingresos:0,
   neto_por_hora:neto/(144+extra),bruto_por_hora:bruto/(144+extra),tipo_retencion:loonheffing/bruto,bruto_mensual_equivalente:bruto/4*13/3,neto_mensual_equivalente:neto/4*13/3,vakantiegeld_reservado:600-i*100,vakantiedagen_uren:48-i*8,keuzebudget_saldo:150-i*25};
 });
 // La jaaropgave ficticia distingue lo registrado del acumulado oficial.
 const demoYear=(jaar,months,completo)=>{
  const sum=key=>months.reduce((total,m)=>total+Number(m[key]||0),0),bruto=sum('bruto'),tax=sum('loonheffing'),difference=completo?0:250;
  return {user_id,jaar,nominas:sum('pagos'),correcciones:sum('correcciones'),pendientes_revision:sum('pendientes_revision'),primer_pago:`${jaar}-07-03`,ultimo_pago:`${jaar}-09-25`,
   bruto_registrado:bruto,loon_lh_registrado:bruto,loonheffing_registrada:tax,bruto_acumulado_oficial:bruto+difference,loon_lh_acumulado_oficial:bruto+difference,loonheffing_acumulada_oficial:tax+(completo?0:35),diferencia_bruto:difference,
   neto:sum('neto'),cobrado_banco:sum('cobrado_banco'),reiskosten_onbelast:sum('allowances_netas'),pensioen:sum('pensioen'),premies:sum('premies'),horas:sum('horas_trabajadas'),horas_extra:sum('horas_extra'),pago_horas_extra:sum('pago_horas_extra'),toeslagen:sum('toeslagen'),vakantiegeld_pagado:sum('vakantiegeld_pagado'),vakantiegeld_reservado:months[0].vakantiegeld_reservado,completo};
 };
 f.year_nl=[demoYear(year,f.monthly_nl,false),demoYear(year-1,f.monthly_nl.slice(1),true)];
 // PDF mínimo válido con tabla xref calculada; no contiene información real.
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];const content='BT /F1 18 Tf 30 140 Td (Nomina DEMO - sin datos reales) Tj ET';objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);let pdf='%PDF-1.4\n',offsets=[0];objects.forEach((o,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=pdf.length;pdf+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;f.pdf=pdf;recalculate();return f;
}
