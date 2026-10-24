import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {dirname,join,resolve} from "node:path";
import payrollHandler from "../apps/rise-react/api/payroll-upload.js";
import localHandler,{validatePayload} from "../apps/rise-react/server/payroll-upload.mjs";
import {parseSdWorx as classicParse} from "../payroll-pdf.js";
import {parseSdWorx as reactParse} from "../apps/rise-react/src/lib/payroll-pdf-parser.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const src=path=>readFileSync(join(root,path),"utf8");
const rows=JSON.parse(src("tests/fixtures/nomina-sdworx-ficticia.rows.json"));
const hash=b=>createHash("sha256").update(b).digest("hex");

test("Payroll endpoint reuses classic private JWT/storage/review handler",()=>{
 assert.strictEqual(payrollHandler,localHandler);
 const legacy=src("api/payroll-upload.js").trim();
 const react=src("apps/rise-react/server/payroll-upload.mjs").replace(/^\/\/ Local server-only copy[^\n]*\n\/\/ Same audited validation[^\n]*\n/,"").trim();
 assert.equal(react,legacy,"Vercel handler must remain equivalent to Classic");
 const api=src("apps/rise-react/api/payroll-upload.js");
 const server=src("apps/rise-react/src/server.ts");
 assert.match(api,/\.\.\/server\/payroll-upload\.mjs/);
 assert.match(server,/serveNodeHandler\(request,payrollUploadHandler,\{maxBodyBytes:/);
 assert.match(server,/\/api\/payroll-upload/);
});

test("Nocturne PDF reader keeps Classic results on normal payslips (v2 flexible)",()=>{
 const {prompt_version:v2,...react}=reactParse(rows);
 const {prompt_version:v1,...classic}=classicParse(rows);
 assert.equal(v2,"sdworx-v2");
 assert.deepEqual(react,classic);
 assert.equal(reactParse(rows).validation_status,"review_required");
});

// Variantes FICTICIAS del formato SD Worx vistas en nóminas reales (sin datos personales).
const clone=()=>structuredClone(rows);
const drop=(r,name)=>{const i=r.findIndex(x=>x.items[0].s===name);assert.ok(i>=0,name);r.splice(i,1);};
const setAll=(r,name,from,to)=>r.find(x=>x.items[0].s===name).items.forEach(i=>{if(i.s===from)i.s=to;});

test("Semana sin 'Netto loon' (vacaciones sin gastos de viaje): calcula el neto y valida",()=>{
 const r=clone();
 drop(r,"Netto loon");drop(r,"Reiskostenvergoeding");
 setAll(r,"Netto te betalen","493,88","473,88");
 const p=reactParse(r),s=p.payslip;
 assert.equal(s.net_salary,473.88);assert.equal(s.net_payment,473.88);assert.equal(s.travel_allowance,null);
 assert.ok(p.checks.filter(c=>c.severity!=="info").every(c=>c.passed),JSON.stringify(p.checks));
 assert.match(p.checks.find(c=>c.rule==="derived_totals").message,/neto/);
 assert.equal(p.validation_status,"review_required");
 assert.equal(validatePayload(p),null);
});

test("Sin 'Loon voor loonbelasting': la base fiscal se deduce del bruto menos AZV/PAWW/pensión",()=>{
 const r=clone();drop(r,"Loon voor loonbelasting en premies");
 const p=reactParse(r);
 assert.equal(p.payslip.loon_voor_loonheffing,556.34);
 assert.ok(p.checks.filter(c=>c.severity!=="info").every(c=>c.passed));
});

test("Etiquetas partidas, números sin separador de miles y tabla desplazada siguen leyéndose",()=>{
 const r=clone();
 const row=r.find(x=>x.items[0].s==="Netto loon");
 row.items.splice(0,1,{...row.items[0],s:"Netto"},{...row.items[0],s:"loon",x:row.items[0].x+25});
 const shift=8,head=r.findIndex(x=>/^Omschrijving/.test(x.items[0].s));
 const end=r.findIndex(x=>x.items[0].s==="Netto te betalen");
 for(const x of r.slice(head,end+1))for(const i of x.items)if(i.x>=160)i.x+=shift;
 const p=reactParse(r);
 assert.equal(p.payslip.net_salary,473.88);assert.equal(p.payslip.gross_salary,583.2);
 assert.ok(p.checks.every(c=>c.passed),JSON.stringify(p.checks));
});

test("Sin columna Mutatie usa Totaal tijdvak",()=>{
 const r=clone();
 const head=r.findIndex(x=>/^Omschrijving/.test(x.items[0].s));
 const end=r.findIndex(x=>x.items[0].s==="Netto te betalen");
 for(const x of r.slice(head+1,end+1))x.items=x.items.filter(i=>!(i.x>=260&&i.x<352&&/\d,\d{2}$/.test(i.s)));
 const p=reactParse(r);
 assert.equal(p.payslip.net_payment,493.88);assert.equal(p.payslip.gross_salary,583.2);
 assert.ok(p.checks.every(c=>c.passed),JSON.stringify(p.checks));
});

test("Sin neto ni pagado no inventa importes",()=>{
 const r=clone();drop(r,"Netto loon");
 r.find(x=>x.items[0].s==="Netto te betalen").items.splice(1);
 assert.throws(()=>reactParse(r),/Netto te betalen|calcularlo/);
});

test("Local PDF asset script copies the existing vetted PDF.js distribution and license",()=>{
 execFileSync(process.execPath,[join(root,"apps/rise-react/copy-payroll-assets.mjs")],{stdio:"pipe"});
 for(const name of ["pdf.min.js","pdf.worker.min.js","LICENSE"]){
  const original=readFileSync(join(root,"vendor/pdfjs",name));
  const copy=readFileSync(join(root,"apps/rise-react/public/vendor/pdfjs",name));
  assert.equal(hash(copy),hash(original));
 }
});

test("Native payroll UX does not transmit a PDF until explicit user confirmation",()=>{
 const ui=src("apps/rise-react/src/components/rise/PayrollUpload.tsx");
 const route=src("apps/rise-react/src/routes/nominas.tsx");
 assert.match(route,/<PayrollUpload\/>/);
 assert.match(ui,/mode==="preview"/);
 assert.match(ui,/onClick=\{\(\)=>void upload\(\)\}/);
 assert.match(ui,/fetch\("\/api\/payroll-upload"/);
 assert.match(ui,/parseSdWorx\(await extractRows\(/);
 assert.match(ui,/payload\?\.checks\.some\(c=>!c\.passed\)/);
 assert.match(ui,/query\.invalidateQueries\(\{queryKey:\["payroll-overview",uid\]\}\)/);
 assert.doesNotMatch(ui,/OPENROUTER_API_KEY|SUPABASE_SECRET_KEY/);
});

test("Money, Gastos, Nóminas and Turnos preserve URLs and share the same financial nav",()=>{
 const nav=src("apps/rise-react/src/components/rise/FinanceSections.tsx");
 for(const [path,route] of [["dinero.tsx","dinero"],["gastos.tsx","gastos"],["nominas.tsx","nominas"],["turnos.tsx","turnos"]]){
  const code=src("apps/rise-react/src/routes/"+path);
  assert.match(code,/<FinanceSections\/>/);
  assert.match(code,new RegExp('createFileRoute\\("/'+route+'"\\)'));
  assert.match(nav,new RegExp('to:"/'+route+'"'));
 }
});
