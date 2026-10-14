// Values are transcribed at runtime from the owner's document, never embedded in source.
const esc=x=>String(x??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
export function parseBalanceConfirmation(v){
 if(v.confirmed!=='on')throw Error('Confirma que has contrastado ambos saldos con el PDF.');
 if(!/^\d{1,3}$/.test(v.hours)||!/^\d{1,2}$/.test(v.minutes)||Number(v.minutes)>59)throw Error('Indica horas enteras y minutos entre 0 y 59.');
 const leaveMinutes=Number(v.hours)*60+Number(v.minutes);
 if(leaveMinutes>24000)throw Error('Saldo de vacaciones fuera de rango.');
 if(!/^\d{1,7}([.,]\d{1,2})?$/.test(v.euros))throw Error('Indica el Keuzebudget en euros con hasta dos decimales.');
 const keuzebudgetCents=Math.round(Number(v.euros.replace(',','.'))*100);
 if(keuzebudgetCents>100000000)throw Error('Keuzebudget fuera de rango.');
 return {leaveMinutes,keuzebudgetCents};
}
export function balanceSnapshotHTML(s){
 return `<div class="card" data-balance-snapshot><h3>Saldos documentados al ${esc(s.as_of)}</h3><p>Vacaciones: <strong>${Math.floor(s.leave_minutes/60)} h ${s.leave_minutes%60} min</strong> al cierre.</p><p>Keuzebudget: <strong>${new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(s.keuzebudget_cents/100)}</strong> · instantánea independiente, no ingreso ni horas.</p><p class="small">Transcripción confirmada del PDF. Los movimientos de vacaciones hasta esta fecha ya están incluidos. Solo los posteriores modifican el saldo estimado.</p><button type="button" data-payslip="${esc(s.payslip_id)}">Ver nómina de origen</button></div>`;
}
export function balanceImportHTML(p,doc,imports){
 if(imports===undefined)return '<div class="card" role="alert">No se pudo comprobar el saldo importado. Actualiza antes de continuar.</div>';
 if(imports.length)return balanceSnapshotHTML(imports[0]);
 if(!p?.period_end||!doc?.file_sha256||!(doc.storage_path_raw||doc.storage_path_archive)||p.review_status==='rejected'||p.validation_status==='failed')return '';
 return `<details class="card"><summary>Importar saldos del PDF</summary><p>Nómina nº ${esc(p.payslip_number)} · semana ${esc(p.period_number)} · cierre ${esc(p.period_end)}.</p><p>Abre el PDF original y transcribe <b>Vakantiedagen → Saldo uren</b> y <b>Keuzebudget → Saldo</b>. Esta confirmación no aprueba el resto de la nómina.</p><p>Es un saldo al cierre: las vacaciones y festivos anteriores ya están incluidos. No se volverán a descontar.</p><form data-balance-import data-payslip-id="${esc(p.id)}" data-revision="${esc(p.updated_at)}"><div class="shift-fields"><label>Vacaciones · horas<input name="hours" type="number" min="0" max="400" step="1" required></label><label>Vacaciones · minutos<input name="minutes" type="number" min="0" max="59" step="1" required></label><label>Keuzebudget · euros<input name="euros" inputmode="decimal" required placeholder="0,00"></label></div><label><input name="confirmed" type="checkbox" required> He comprobado ambos saldos en el PDF de esta nómina y confirmo su importación al cierre indicado.</label><p data-balance-feedback role="status" aria-live="polite"></p><button class="primary" type="submit">Confirmar e importar ambos saldos</button></form></details>`;
}
