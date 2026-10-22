// Offline comparison only. Never connects to a backend or applies a migration.
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'
 ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
function validate(snapshot){
 if(snapshot?.format!=='renzo-hub-export'||snapshot.version!==1||!snapshot.user_id||!snapshot.project||
  !snapshot.tables||typeof snapshot.tables!=='object'||Array.isArray(snapshot.tables)||snapshot.errors?.length)
  throw Error('Copia incompleta, sin identidad o sin entorno. Exporta de nuevo desde la cuenta original.');
}
function index(rows){
 if(!Array.isArray(rows))throw Error('Formato de tabla no válido.');
 const result=new Map();
 for(const row of rows){
  const id=row?.id??row?.owner_id??row?.user_id;
  if(typeof id!=='string'||!id||result.has(id))throw Error('Identificador ausente o repetido; revisión manual necesaria.');
  result.set(id,JSON.stringify(stable(row)));
 }
 return result;
}
export function planLocalMigration(local,cloud){
 validate(local);validate(cloud);
 if(local.user_id!==cloud.user_id)throw Error('Las copias pertenecen a cuentas diferentes.');
 if(local.project!==cloud.project)throw Error('Las copias pertenecen a entornos diferentes.');
 const tables={};let requiresReview=false;
 for(const name of [...new Set([...Object.keys(local.tables),...Object.keys(cloud.tables)])].sort()){
  const a=index(local.tables[name]||[]),b=index(cloud.tables[name]||[]);
  const item={identical:0,localOnly:[],conflicts:[],cloudOnly:[]};
  for(const [id,value] of a){
   if(!b.has(id))item.localOnly.push(id);
   else if(b.get(id)===value)item.identical++;
   else item.conflicts.push(id);
  }
  for(const id of b.keys())if(!a.has(id))item.cloudOnly.push(id);
  for(const key of ['localOnly','conflicts','cloudOnly'])item[key].sort();
  if(item.localOnly.length||item.conflicts.length)requiresReview=true;
  tables[name]=item;
 }
 return {format:'rise-hub-local-migration-plan',version:1,canAutoApply:false,requiresReview,tables,
  limitations:['Compara solo las copias aportadas; no accede a navegadores.','No compara archivos binarios ni borradores ajenos a la exportación.','Un plan sin conflictos no acredita por sí solo el corte.']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const arg=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1];};
 try{
  const local=arg('--local'),cloud=arg('--cloud'),out=arg('--out');
  if(!local||!cloud||!out)throw Error('Uso: node tools/nocturne-local-data-audit.mjs --local copia-dispositivo.json --cloud copia-actual.json --out plan-privado.json');
  const plan=planLocalMigration(JSON.parse(readFileSync(local)),JSON.parse(readFileSync(cloud)));
  writeFileSync(out,JSON.stringify(plan,null,2),{flag:'wx',mode:0o600});
  console.log(JSON.stringify({written:true,canAutoApply:false,requiresReview:plan.requiresReview,tables:Object.keys(plan.tables).length}));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
