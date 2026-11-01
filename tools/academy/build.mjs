#!/usr/bin/env node
// RISE HUB Academia +25 · genera el contenido público de la app y el seed privado de claves.
// Fuente: content/academia (lecciones .md, preguntas .json con claves, kit original).
// Salidas: apps/rise-react/src/content/academia/** (SIN claves) y supabase/seed/academy_question_keys.sql.
// Uso: node tools/academy/build.mjs          (escribe)
//      node tools/academy/build.mjs --check  (falla si las salidas están desactualizadas o el contenido es inválido)
import {readFileSync,writeFileSync,readdirSync,mkdirSync,existsSync,rmSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=join(dirname(fileURLToPath(import.meta.url)),"..","..");
const SRC=join(ROOT,"content","academia");
const OUT=join(ROOT,"apps","rise-react","src","content","academia");
const SEED=join(ROOT,"supabase","seed","academy_question_keys.sql");
const MOCK_SEED=join(ROOT,"supabase","seed","academy_mock_keys.sql");
const CHECK=process.argv.includes("--check");

const COURSE_META={
  matematicas:{title:"Matemáticas",role:"especifica",role_label:"Específica 1 · troncal",exam_profile:"math_2026_cat_ref",models_url:"https://universitats.gencat.cat/ca/proves-majors/25-anys/models-examen/matematiques/"},
  economia:{title:"Economía de la Empresa",role:"especifica",role_label:"Específica 2 · opción E de la prueba catalana (Matemáticas + Economía)",exam_profile:"economia_2026_cat_ref",models_url:"https://universitats.gencat.cat/es/proves-majors/25-anys/models-examen/"},
  castellano:{title:"Lengua castellana",role:"general",role_label:"Fase general",exam_profile:"castellano_2026_cat_ref",models_url:"https://universitats.gencat.cat/ca/proves-majors/25-anys/models-examen/llengua-castellana/"},
  comentario:{title:"Comentario de texto",role:"general",role_label:"Fase general",exam_profile:"comment_2026_cat_ref",models_url:"https://universitats.gencat.cat/ca/proves-majors/25-anys/models-examen/comentari-de-text/"},
  ingles:{title:"Inglés",role:"general",role_label:"Fase general",exam_profile:"english_2026_cat_ref",models_url:"https://universitats.gencat.cat/ca/proves-majors/25-anys/models-examen/angles/"},
  catalan:{title:"Llengua catalana",role:"general",role_label:"Fase general · prova catalana",exam_profile:"catalan_2026_cat_ref",models_url:"https://universitats.gencat.cat/ca/proves-majors/25-anys/models-examen/"},
  fisica:{title:"Física",role:"complementaria",role_label:"Complementaria · ruta anterior (prueba UOC en español)",exam_profile:"physics_2026_cat_ref",models_url:"https://universitats.gencat.cat/ca/proves-majors/25-anys/models-examen/fisica/"},
};
const COURSE_ORDER=["matematicas","economia","catalan","castellano","comentario","ingles","fisica"];
const STATUSES=["planned","draft","reviewed","ready","published"];
const KINDS=["multiple_choice","numeric","short_text","essay"];
const ID_RE=/^[a-z0-9-]{3,64}$/;
const errors=[];const warn=[];
const fail=m=>errors.push(m);

// ---------- frontmatter (subconjunto YAML: escalares, listas "- x" y "[a, b]") ----------
export function parseFrontmatter(text){
  const m=/^---\n([\s\S]*?)\n---\n?/.exec(text);
  if(!m)return {meta:{},body:text};
  const meta={};let key=null;
  for(const raw of m[1].split("\n")){
    if(!raw.trim())continue;
    const item=/^\s+-\s+(.*)$/.exec(raw);
    if(item&&key){(meta[key]??=[]).push(unq(item[1]));continue;}
    const kv=/^([A-Za-z_][\w]*):\s*(.*)$/.exec(raw);
    if(!kv)continue;key=kv[1];const v=kv[2].trim();
    if(v==="")meta[key]=[];
    else if(/^\[.*\]$/.test(v))meta[key]=v.slice(1,-1).split(",").map(s=>unq(s.trim())).filter(Boolean);
    else meta[key]=/^\d+$/.test(v)?Number(v):unq(v);
  }
  return {meta,body:text.slice(m[0].length)};
}
const unq=s=>s.replace(/^"(.*)"$/,"$1").replace(/^'(.*)'$/,"$1");

// ---------- métricas de calidad según tecnico/CONTRATOS_CONTENIDO.md ----------
function sections(body){
  const out={};let cur=null;
  for(const line of body.split("\n")){
    const h=/^##\s+(\d+)\.\s+(.*)$/.exec(line);
    if(h){cur=Number(h[1]);out[cur]={title:h[2],lines:[]};continue;}
    if(cur!==null)out[cur].lines.push(line);
  }
  return out;
}
export function countWords(md){
  const t=md.replace(/^:::.*$/gm," ").replace(/\$\$[\s\S]*?\$\$/g," fórmula ").replace(/\$[^$\n]+\$/g," x ")
    .replace(/[|*_`>#\\-]+/g," ").replace(/\s+/g," ").trim();
  return t?t.split(" ").filter(w=>/[\p{L}\p{N}]/u.test(w)).length:0;
}
export function lessonQuality(body,exitCount){
  const s=sections(body);
  const theoryIdx=[1,2,3,4,8,10];
  const theory=theoryIdx.reduce((n,i)=>n+(s[i]?countWords(s[i].lines.join("\n")):0),0);
  const examples=(body.match(/^:::ejemplo\b/gm)||[]).length;
  const errorBlocks=(body.match(/^:::error\b/gm)||[]).length;
  let practice=0,inSol=false;
  for(const l of s[7]?.lines||[]){
    if(/^:::solucion/.test(l))inSol=true;else if(/^:::\s*$/.test(l))inSol=false;
    else if(!inSol&&/^\d+\.\s/.test(l))practice++;
  }
  const practiceSolved=!!s[7]&&s[7].lines.some(l=>/^:::solucion/.test(l));
  const guided=!!s[6]&&s[6].lines.some(l=>/^:::pista/.test(l))&&s[6].lines.some(l=>/^:::solucion/.test(l));
  const missing=[...Array(11)].map((_,i)=>i+1).filter(i=>!s[i]);
  const reasons=[];
  if(missing.length)reasons.push("faltan secciones "+missing.join(", "));
  if(theory<600)reasons.push(`teoría ${theory} palabras (<600)`);
  if(examples<2)reasons.push(`${examples} ejemplos resueltos (<2)`);
  if(errorBlocks<1)reasons.push("sin bloque de error típico");
  if(!guided)reasons.push("sin ejercicio guiado con pista y solución");
  if(practice<6||!practiceSolved)reasons.push(`${practice} prácticas${practiceSolved?"":" sin soluciones"} (<6)`);
  if(exitCount<5)reasons.push(`${exitCount} preguntas de salida (<5)`);
  if(!/^::evaluacion\s*$/m.test(body))reasons.push("sin marcador ::evaluacion");
  return {theory_words:theory,examples,error_blocks:errorBlocks,practice_items:practice,guided,exit_questions:exitCount,missing_sections:missing,meets_standard:reasons.length===0,gaps:reasons};
}

// ---------- preguntas ----------
function validateQuestion(q,where){
  const p=`${where}:${q.id||"?"}`;
  if(!ID_RE.test(q.id||""))fail(`${p} id inválido`);
  if(!KINDS.includes(q.kind))fail(`${p} tipo no soportado ${q.kind}`);
  if(!q.prompt_md)fail(`${p} sin enunciado`);
  if(!Array.isArray(q.skill_ids)||!q.skill_ids.length)fail(`${p} sin skill_ids`);
  if(q.kind==="multiple_choice"){
    const ids=(q.choices||[]).map(c=>c.id);
    if(ids.length<3||ids.length>4)fail(`${p} debe tener 3–4 opciones`);
    if(new Set(ids).size!==ids.length)fail(`${p} opciones duplicadas`);
    if(!ids.includes(q.key?.correct_choice_id))fail(`${p} clave fuera de las opciones`);
  }
  if(q.kind==="numeric"&&(typeof q.key?.value!=="number"||!Number.isFinite(q.key.value)))fail(`${p} clave numérica inválida`);
  if(q.kind==="numeric"&&q.key.tolerance!==undefined&&!(q.key.tolerance>=0))fail(`${p} tolerancia inválida`);
  if(q.kind==="short_text"&&!(Array.isArray(q.key?.accepted)&&q.key.accepted.length))fail(`${p} sin respuestas aceptadas`);
  if(q.kind!=="essay"&&!q.explanation_md)fail(`${p} sin explicación`);
}
function fromKit(q){
  const g=q.grading_private||{};
  let key;
  if(q.kind==="multiple_choice")key={correct_choice_id:g.correct_choice_id};
  else if(q.kind==="numeric")key={value:Number(g.correct_value),tolerance:Number(g.absolute_tolerance??0)};
  else key={rubric:g.rubric||null,words:g.words_range||null};
  // Las preguntas de fracciones del kit apuntaban a M00-L02; el catálogo sitúa fracciones en M00-L04.
  const lesson=q.lesson_id==="matematicas-m00-l02"&&q.skill_ids.some(s=>s.startsWith("fraction"))?"matematicas-m00-l04":q.lesson_id;
  return {id:q.id,lesson_id:lesson,course:q.course,kind:q.kind,difficulty:q.difficulty||1,skill_ids:q.skill_ids,
    prompt_md:q.prompt_md,choices:q.choices,unit:g.unit||undefined,key,explanation_md:g.explanation_md||"",
    words:g.words_range||undefined,rubric:g.rubric||undefined,model_md:g.model_response||undefined,role:"bank",origin:"kit-v0.1"};
}
const publicQ=q=>{
  const o={id:q.id,lesson_id:q.lesson_id,course:q.course,kind:q.kind,difficulty:q.difficulty,skill_ids:q.skill_ids,prompt_md:q.prompt_md,role:q.role};
  if(q.choices)o.choices=q.choices.map(c=>({id:c.id,text:c.text}));
  if(q.hint_md)o.hint_md=q.hint_md;
  if(q.unit)o.unit=q.unit;
  if(q.kind==="essay"){o.words=q.words||null;o.rubric=q.rubric||null;o.model_md=q.model_md||null;}
  return o;
};
const sqlStr=s=>"'"+String(s).replace(/'/g,"''")+"'";


// ---------- simulacros originales (content/academia/mocks) ----------
const MOCK_KINDS=["multiple_choice","numeric","short_text","open"];
const ITEM_RE=/^[a-z0-9-]{1,40}$/;
const near=(a,b)=>Math.abs(a-b)<1e-9;
export function buildMocks(){
  const dir=join(SRC,"mocks");
  const files=existsSync(dir)?readdirSync(dir).filter(f=>f.endsWith(".json")).sort():[];
  const pub=[];const sql=[];
  for(const f of files){
    const m=JSON.parse(readFileSync(join(dir,f),"utf8"));
    const where=`mocks/${f}`;
    if(!ID_RE.test(m.mock_id||""))fail(`${where}: mock_id inválido`);
    if(f!==m.mock_id+".json")fail(`${where}: el nombre debe ser ${m.mock_id}.json`);
    if(!COURSE_ORDER.includes(m.course))fail(`${where}: curso ${m.course}`);
    if(!(m.duration_minutes>=10&&m.duration_minutes<=240))fail(`${where}: duración`);
    const seen=new Set();const items=[];let total=0;
    const structure={sections:[],word_rules:m.word_rules||{}};
    const pubSections=[];
    for(const sec of m.sections||[]){
      const groupIds=new Set();const sGroups=[];const pGroups=[];
      for(const g of sec.groups||[]){
        if(!ITEM_RE.test(g.id)||groupIds.has(g.id))fail(`${where}: grupo ${g.id}`);groupIds.add(g.id);
        if(!["sum","deduct"].includes(g.mode))fail(`${where}: modo ${g.mode}`);
        let sum=0;
        for(const it of g.items){
          if(!ITEM_RE.test(it.id)||seen.has(it.id))fail(`${where}: pregunta ${it.id} inválida o repetida`);seen.add(it.id);
          if(!MOCK_KINDS.includes(it.kind))fail(`${where}: ${it.id} tipo ${it.kind}`);
          if(!(it.points>0&&it.points<=10))fail(`${where}: ${it.id} puntos`);
          if(!it.prompt_md)fail(`${where}: ${it.id} sin enunciado`);
          if(!it.solution_md)fail(`${where}: ${it.id} sin solución`);
          if(it.kind==="open"&&!it.rubric_md)fail(`${where}: ${it.id} abierta sin rúbrica`);
          if(it.kind==="multiple_choice"&&!(it.choices||[]).some(c=>c.id===it.key?.correct))fail(`${where}: ${it.id} clave fuera de las opciones`);
          if(it.kind==="numeric"&&(typeof it.key?.value!=="number"||!Number.isFinite(it.key.value)||!it.key.display))fail(`${where}: ${it.id} clave numérica`);
          if(it.kind==="numeric"&&it.unit_required&&!(it.key.units||[]).length)fail(`${where}: ${it.id} sin unidades aceptadas`);
          if(it.kind==="short_text"&&!(it.key?.accepted||[]).length)fail(`${where}: ${it.id} sin respuestas aceptadas`);
          if(g.mode==="deduct"&&!(it.penalty>0))fail(`${where}: ${it.id} en grupo de descuento sin descuento`);
          if(g.mode==="deduct"&&it.kind==="open")fail(`${where}: ${it.id} abierta en grupo de descuento`);
          if(it.words&&!m.word_rules?.[it.id])fail(`${where}: ${it.id} indica palabras sin regla`);
          sum+=it.points;
          items.push(it);
        }
        if(g.mode==="sum"&&!near(sum,g.points))fail(`${where}: ${g.id} suma ${sum} y declara ${g.points}`);
        sGroups.push({id:g.id,points:g.points,mode:g.mode,floor0:!!g.floor0,items:g.items.map(i=>i.id)});
        pGroups.push({id:g.id,label:g.label,points:g.points,mode:g.mode,floor0:!!g.floor0,stem_md:g.stem_md||"",
          items:g.items.map(i=>{const o={id:i.id,kind:i.kind,points:i.points,penalty:i.penalty||0,prompt_md:i.prompt_md};
            if(i.choices)o.choices=i.choices.map(c=>({id:c.id,text:c.text}));
            if(i.unit_required)o.unit_required=true;if(i.unit_label)o.unit_label=i.unit_label;if(i.words)o.words=i.words;return o;})});
      }
      const pts=sGroups.map(g=>g.points);
      if(typeof sec.choose==="number"){
        if(!(sec.choose>=1&&sec.choose<=sGroups.length))fail(`${where}: ${sec.id} choose`);
        if(pts.some(p=>!near(p,pts[0])))fail(`${where}: ${sec.id} grupos elegibles con distinto valor`);
        total+=sec.choose*pts[0];
      }else total+=pts.reduce((a,b)=>a+b,0);
      structure.sections.push({id:sec.id,label:sec.label,choose:typeof sec.choose==="number"?sec.choose:null,groups:sGroups});
      pubSections.push({id:sec.id,label:sec.label,instructions_md:sec.instructions_md||"",choose:typeof sec.choose==="number"?sec.choose:null,groups:pGroups});
    }
    for(const k of Object.keys(m.word_rules||{}))if(!items.some(i=>i.id===k&&i.kind==="open"))fail(`${where}: regla de palabras para ${k} inexistente`);
    if(!near(total,10))fail(`${where}: la nota máxima es ${total}, no 10`);
    pub.push({mock_id:m.mock_id,course:m.course,title:m.title,duration_minutes:m.duration_minutes,content_version:m.content_version||1,
      intro_md:m.intro_md||"",data_md:m.data_md||"",text_md:m.text_md||"",sections:pubSections,word_rules:m.word_rules||{}});
    sql.push(`insert into public.academy_mock_defs(mock_id,course,title,duration_minutes,structure,content_version) values (${sqlStr(m.mock_id)},${sqlStr(m.course)},${sqlStr(m.title)},${Number(m.duration_minutes)},${sqlStr(JSON.stringify(structure))}::jsonb,${Number(m.content_version||1)}) on conflict (mock_id) do update set course=excluded.course,title=excluded.title,duration_minutes=excluded.duration_minutes,structure=excluded.structure,content_version=excluded.content_version,updated_at=now();`);
    sql.push(`delete from public.academy_mock_items where mock_id=${sqlStr(m.mock_id)} and item_id not in (${items.map(i=>sqlStr(i.id)).join(",")});`);
    for(const it of items)sql.push(`insert into public.academy_mock_items(mock_id,item_id,kind,key,points,wrong_penalty,solution_md,rubric_md) values (${sqlStr(m.mock_id)},${sqlStr(it.id)},${sqlStr(it.kind)},${sqlStr(JSON.stringify(it.key||{}))}::jsonb,${Number(it.points)},${Number(it.penalty||0)},${sqlStr(it.solution_md)},${sqlStr(it.rubric_md||"")}) on conflict (mock_id,item_id) do update set kind=excluded.kind,key=excluded.key,points=excluded.points,wrong_penalty=excluded.wrong_penalty,solution_md=excluded.solution_md,rubric_md=excluded.rubric_md;`);
  }
  const seed=["-- GENERADO por tools/academy/build.mjs desde content/academia/mocks. No editar a mano.",
    "-- Claves, soluciones y rúbricas privadas: sin acceso para anon/authenticated; solo las leen las funciones academy_mock_*.",
    "-- Idempotente.","begin;",...sql,"commit;",""].join("\n");
  return {pub,seed};
}

// ---------- construcción ----------
export function build(){
  const kitCatalog=JSON.parse(readFileSync(join(SRC,"kit","catalogo.json"),"utf8"));
  const kitQs=JSON.parse(readFileSync(join(SRC,"kit","preguntas_iniciales.json"),"utf8")).questions;
  const profiles=JSON.parse(readFileSync(join(SRC,"exam-profiles.json"),"utf8"));
  const lessonFiles={};
  // pilot/ guarda borradores del kit sin reescribir; puede no existir cuando todos están reescritos en lessons/.
  for(const dir of ["lessons","pilot"])for(const f of (existsSync(join(SRC,dir))?readdirSync(join(SRC,dir)):[]).filter(f=>f.endsWith(".md"))){
    const id=f.replace(/\.md$/,"");
    if(lessonFiles[id])fail(`lección duplicada ${id}`);
    lessonFiles[id]={dir,text:readFileSync(join(SRC,dir,f),"utf8")};
  }
  const exitQs={};
  for(const f of readdirSync(join(SRC,"questions")).filter(f=>f.endsWith(".json"))){
    const j=JSON.parse(readFileSync(join(SRC,"questions",f),"utf8"));
    exitQs[j.lesson_id]=j.questions.map(q=>({...q,lesson_id:j.lesson_id,course:j.lesson_id.split("-")[0],role:"exit",origin:"academia-v2",difficulty:q.difficulty||1}));
  }
  const allIds=new Set(kitCatalog.courses.flatMap(c=>c.modules.flatMap(m=>m.lessons.map(l=>l.id))));
  const lessonsOut={};const courses=[];
  const stats={by_status:Object.fromEntries(STATUSES.map(s=>[s,0])),lessons_total:0,meets_standard:0,courses:{}};
  for(const slug of COURSE_ORDER){
    const kc=kitCatalog.courses.find(c=>c.slug===slug);
    if(!kc){fail(`curso ${slug} ausente del kit`);continue;}
    const cs={total:0,with_content:0,meets_standard:0,by_status:Object.fromEntries(STATUSES.map(s=>[s,0]))};
    const modules=kc.modules.map(m=>({id:m.id,title:m.title,level:m.level,lessons:m.lessons.map(l=>{
      const file=lessonFiles[l.id];
      let meta={},body="",quality=null,title=l.topic_scope.charAt(0).toUpperCase()+l.topic_scope.slice(1);
      let status="planned";
      if(file){
        ({meta,body}=parseFrontmatter(file.text));
        if(meta.id&&meta.id!==l.id)fail(`${l.id}: id de frontmatter ${meta.id}`);
        status=meta.editorial_status||"draft";
        if(!STATUSES.includes(status))fail(`${l.id}: estado ${status}`);
        if(status!=="planned"&&status!=="draft"&&file.dir==="pilot")fail(`${l.id}: un piloto no puede pasar de draft sin reescritura`);
        title=meta.title||(/^#\s+(.+)$/m.exec(body)?.[1])||title;
        const ex=exitQs[l.id]||[];
        quality=lessonQuality(body,ex.length);
        if(["reviewed","ready","published"].includes(status)&&!quality.meets_standard)fail(`${l.id}: estado ${status} sin cumplir el estándar (${quality.gaps.join("; ")})`);
        for(const p of meta.prerequisites||[])if(!allIds.has(p))fail(`${l.id}: prerrequisito inexistente ${p}`);
        lessonsOut[l.id]={id:l.id,course:slug,module:m.id,level:meta.level||l.level,title,status,
          pilot:file.dir==="pilot",objectives:meta.learning_objectives||[],prerequisites:meta.prerequisites||l.prerequisites||[],
          skill_ids:meta.skill_ids||[],estimated_minutes:meta.estimated_minutes||l.estimated_minutes,content_version:meta.content_version||1,
          source_kind:meta.source_kind||"original",source_urls:meta.source_urls||(meta.aligned_syllabus?[meta.aligned_syllabus]:[]),
          body,exit:ex.map(publicQ),quality};
      }
      stats.by_status[status]++;cs.by_status[status]++;cs.total++;stats.lessons_total++;
      if(file)cs.with_content++;
      if(quality?.meets_standard){cs.meets_standard++;stats.meets_standard++;}
      return {id:l.id,title,topic_scope:l.topic_scope,level:l.level,status,estimated_minutes:l.estimated_minutes,
        prerequisites:lessonsOut[l.id]?.prerequisites||l.prerequisites,has_content:!!file,pilot:file?.dir==="pilot",
        meets_standard:!!quality?.meets_standard,gaps:quality?.gaps||(file?[]:["sin redactar"])};
    })}));
    stats.courses[slug]=cs;
    courses.push({slug,...COURSE_META[slug],official_syllabus_url:kc.official_syllabus_url,modules});
  }
  for(const id of Object.keys(lessonFiles))if(!allIds.has(id))fail(`lección ${id} no existe en el catálogo`);
  for(const id of Object.keys(exitQs))if(!lessonsOut[id])fail(`preguntas de salida para lección sin contenido ${id}`);
  const bank=kitQs.map(fromKit);
  const all=[...Object.values(exitQs).flat(),...bank];
  const seen=new Set();
  for(const q of all){if(seen.has(q.id))fail(`pregunta duplicada ${q.id}`);seen.add(q.id);validateQuestion(q,q.role);
    if(!allIds.has(q.lesson_id))fail(`${q.id}: lección ${q.lesson_id} inexistente`);}
  const catalog={schema_version:"academia-1",generated_from:"content/academia",exam_dates:{
      general:"2027-04-10",especifica:"2027-04-17",source:"https://universitats.gencat.cat/es/proves-majors/25-anys/",
      note:"Fechas de la Generalitat para 2027 (comprobadas el 01-11-2026); horarios pendientes de publicar."},
    elective:{chosen:"economia",alternative:"fisica",confirmed:true,note:"Decisión de Renzo 01-11-2026: PAU +25 común de Cataluña (presencial, con Llengua catalana), opción E con Matemáticas + Economía de la Empresa. La prueba en español de la UOC no admite Economía en Ingeniería; Física queda como complementaria."},
    courses,stats:{...stats,questions_total:all.length,exit_questions:Object.values(exitQs).flat().length,bank_questions:bank.length}};
  const files={};
  files["catalog.json"]=JSON.stringify(catalog,null,1)+"\n";
  for(const [id,l] of Object.entries(lessonsOut))files[`lessons/${id}.json`]=JSON.stringify(l)+"\n";
  files["bank.json"]=JSON.stringify({questions:bank.map(publicQ)})+"\n";
  files["exam-profiles.json"]=JSON.stringify(profiles,null,1)+"\n";
  const mocks=buildMocks();
  files["mocks.json"]=JSON.stringify({mocks:mocks.pub})+"\n";
  const gradable=all.filter(q=>q.kind!=="essay");
  const seed=["-- GENERADO por tools/academy/build.mjs. No editar a mano.",
    "-- Claves de corrección privadas: tabla sin políticas para anon/authenticated; solo la lee academy_grade (SECURITY DEFINER).",
    "-- Idempotente: upsert por question_id.","begin;",
    ...gradable.map(q=>`insert into public.academy_question_keys(question_id,lesson_id,course,kind,role,key,explanation_md,skill_ids,points,content_version) values (${sqlStr(q.id)},${sqlStr(q.lesson_id)},${sqlStr(q.course)},${sqlStr(q.kind)},${sqlStr(q.role)},${sqlStr(JSON.stringify(q.key))}::jsonb,${sqlStr(q.explanation_md)},array[${q.skill_ids.map(sqlStr).join(",")}]::text[],${Number(q.points||1)},${Number(q.content_version||1)}) on conflict (question_id) do update set lesson_id=excluded.lesson_id,course=excluded.course,kind=excluded.kind,role=excluded.role,key=excluded.key,explanation_md=excluded.explanation_md,skill_ids=excluded.skill_ids,points=excluded.points,content_version=excluded.content_version,updated_at=now();`),
    "commit;",""].join("\n");
  return {files,seed,catalog,mockSeed:mocks.seed,mockCount:mocks.pub.length};
}

const {files,seed,catalog,mockSeed,mockCount}=build();
for(const [name,content] of Object.entries(files))if(/"(key|correct_choice_id|accepted|explanation_md|grading_private)"/.test(content))fail(`${name} contiene campos de clave privada`);
if(/"(solution_md|rubric_md|correct|units|display|tol_abs|tol_rel)"/.test(files["mocks.json"]))fail("mocks.json contiene soluciones o claves");
if(errors.length){console.error("CONTENIDO INVÁLIDO:\n- "+errors.join("\n- "));process.exit(1);}
if(CHECK){
  const stale=[];
  for(const [name,content] of Object.entries(files)){const p=join(OUT,name);if(!existsSync(p)||readFileSync(p,"utf8")!==content)stale.push(name);}
  const existing=existsSync(join(OUT,"lessons"))?readdirSync(join(OUT,"lessons")).map(f=>"lessons/"+f):[];
  for(const f of existing)if(!files[f])stale.push(f+" (sobrante)");
  if(!existsSync(SEED)||readFileSync(SEED,"utf8")!==seed)stale.push("supabase/seed/academy_question_keys.sql");
  if(!existsSync(MOCK_SEED)||readFileSync(MOCK_SEED,"utf8")!==mockSeed)stale.push("supabase/seed/academy_mock_keys.sql");
  if(stale.length){console.error("Salidas desactualizadas; ejecuta node tools/academy/build.mjs:\n- "+stale.join("\n- "));process.exit(1);}
}else{
  rmSync(join(OUT,"lessons"),{recursive:true,force:true});
  for(const [name,content] of Object.entries(files)){const p=join(OUT,name);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,content);}
  mkdirSync(dirname(SEED),{recursive:true});writeFileSync(SEED,seed);writeFileSync(MOCK_SEED,mockSeed);
}
const s=catalog.stats;
console.log(`OK · ${s.lessons_total} lecciones en catálogo · ${JSON.stringify(s.by_status)} · ${s.meets_standard} cumplen el estándar · ${s.questions_total} preguntas (${s.exit_questions} de salida, ${s.bank_questions} banco)`);
for(const [c,v] of Object.entries(s.courses))console.log(`  ${c}: ${v.with_content}/${v.total} con contenido, ${v.meets_standard} al estándar`);
console.log(`  simulacros originales: ${mockCount}`);
