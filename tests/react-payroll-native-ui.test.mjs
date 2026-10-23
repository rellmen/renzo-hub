import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {dirname,join,resolve} from "node:path";
import payrollHandler from "../apps/rise-react/api/payroll-upload.js";
import classicHandler from "../api/payroll-upload.js";
import {parseSdWorx as classicParse} from "../payroll-pdf.js";
import {parseSdWorx as reactParse} from "../apps/rise-react/src/lib/payroll-pdf-parser.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const src=path=>readFileSync(join(root,path),"utf8");
const rows=JSON.parse(src("tests/fixtures/nomina-sdworx-ficticia.rows.json"));
const hash=b=>createHash("sha256").update(b).digest("hex");

test("Payroll endpoint reuses classic private JWT/storage/review handler",()=>{
 assert.strictEqual(payrollHandler,classicHandler);
 const api=src("apps/rise-react/api/payroll-upload.js");
 const server=src("apps/rise-react/src/server.ts");
 assert.match(api,/\.\.\/\.\.\/\.\.\/api\/payroll-upload\.js/);
 assert.match(server,/serveNodeHandler\(request,payrollUploadHandler,\{maxBodyBytes:/);
 assert.match(server,/\/api\/payroll-upload/);
});

test("Client PDF rules are bit-for-bit equivalent to legacy parser except Vite dynamic-import hint",()=>{
 const classic=src("payroll-pdf.js").trim();
 const react=src("apps/rise-react/src/lib/payroll-pdf-parser.mjs")
  .replace(/^\/\/ Nocturne browser-safe adapter[^\n]*\n\/\/ Equivalent[^\n]*\n/,"")
  .replace('/* @vite-ignore */ ["/vendor","pdfjs","pdf.min.js"].join("/")','"/vendor/pdfjs/pdf.min.js"').trim();
 assert.equal(react,classic,"React and Classic payroll parsing rules have diverged");
 assert.deepEqual(reactParse(rows),classicParse(rows));
 assert.equal(reactParse(rows).validation_status,"review_required");
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
