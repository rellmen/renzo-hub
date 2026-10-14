// Ares AI · read-only project-development status, staging and production.
// GitHub repository data is public; access to this endpoint still requires a
// valid RISE HUB session. No GitHub token, no Vercel token, no write API.
const REPO="rellmen/renzo-hub";
const GH="https://api.github.com/repos/"+REPO;
const json=(res,code,data)=>{res.setHeader("Cache-Control","no-store, max-age=0");return res.status(code).json(data);};
const clean=(value,size=100)=>String(value??"").replace(/[\u0000-\u001f]/g," ").trim().slice(0,size);
const isPublicTitle=t=>!/(nodalys|password|credential|secret|token|api.key|n[oó]mina|salary|payroll)/i.test(String(t||""));
async function ghGet(path){
 const response=await fetch(GH+path,{method:"GET",headers:{"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"RISE-HUB-Ares-ReadOnly"},redirect:"error",signal:AbortSignal.timeout(6500)});
 if(!response.ok)throw Error(response.status===403?"GitHub API rate limit or permission":"GitHub "+response.status);
 return response.json();
}
export function simplifyGitHub({commits=[],pulls=[],issues=[]}={}){
 return {
   commits:Array.isArray(commits)?commits.filter(c=>isPublicTitle(c?.commit?.message)).slice(0,5).map(c=>({sha:clean(c.sha,12),title:clean(c.commit?.message?.split("\n")[0],110),date:c.commit?.committer?.date||null,url:c.html_url})):[],
   pullRequests:Array.isArray(pulls)?pulls.filter(p=>isPublicTitle(p?.title)).slice(0,8).map(p=>({number:p.number,title:clean(p.title,110),base:clean(p.base?.ref,65),head:clean(p.head?.ref,65),url:p.html_url})):[],
   issues:Array.isArray(issues)?issues.filter(i=>!i.pull_request&&isPublicTitle(i.title)).slice(0,8).map(i=>({number:i.number,title:clean(i.title,110),url:i.html_url})):[]
 };
}
export default async function handler(req,res){
 if(req.method!=="GET"){res.setHeader("Allow","GET");return json(res,405,{error:"Method not allowed"});}
 if(!["preview","production"].includes(process.env.VERCEL_ENV))return json(res,403,{error:"Entorno de despliegue no admitido."});
 if(req.headers?.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return json(res,403,{error:"Origen no autorizado"});}catch{return json(res,403,{error:"Origen no autorizado"});}}
 const bearer=req.headers?.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
 if(!bearer)return json(res,401,{error:"Necesitas iniciar sesión."});
 const base=String(process.env.SUPABASE_URL||"").replace(/\/$/,"");
 const key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base)||!key)return json(res,503,{error:"Supabase no está configurado."});
 try{
   const auth=await fetch(base+"/auth/v1/user",{headers:{apikey:key,authorization:"Bearer "+bearer},redirect:"error",signal:AbortSignal.timeout(6500)});
   if(!auth.ok)return json(res,401,{error:"Sesión inválida."});
   const u=await auth.json();
   if(!/^[0-9a-f-]{36}$/i.test(String(u.id||"")))return json(res,401,{error:"Sesión inválida."});
 }catch{return json(res,502,{error:"No se pudo verificar la sesión."});}
 const queries=[
   ghGet("/commits?sha=staging&per_page=5"),
   ghGet("/pulls?state=open&per_page=12"),
   ghGet("/issues?state=open&per_page=12")
 ];
 const results=await Promise.allSettled(queries);
 const present=results.filter(r=>r.status==="fulfilled").length;
 // If GitHub is made private or its public API fails, report unavailable sections.
 // Deployment metadata can still be returned without inventing missing commits/PRs.

 const pick=i=>results[i].status==="fulfilled"?results[i].value:[];
 const github=simplifyGitHub({commits:pick(0),pulls:pick(1),issues:pick(2)});
 return json(res,200,{
   source:present>0?"GitHub API pública y metadatos del despliegue actual de Vercel":"Metadatos del despliegue actual de Vercel (GitHub no accesible)",
   checkedAt:new Date().toISOString(),
   github:{repository:REPO,repositoryUrl:"https://github.com/"+REPO,branch:"staging",...github,
     available:{commits:results[0].status==="fulfilled",pullRequests:results[1].status==="fulfilled",issues:results[2].status==="fulfilled"}},
   vercel:{project:clean(process.env.VERCEL_PROJECT_NAME||"sin datos",90),environment:clean(process.env.VERCEL_ENV||"desconocido",20),
     deploymentBranch:clean(process.env.VERCEL_GIT_COMMIT_REF||"",90)||null,deploymentCommit:clean(process.env.VERCEL_GIT_COMMIT_SHA||"",40)||null,
     scope:"Despliegue que sirve esta respuesta; no incluye histórico de despliegues ni registros de fallos."},
   limitations:"Commits, PRs e issues NO equivalen a tareas completas, porcentaje de progreso, fases ni actividad en vivo de agentes. Datos de GitHub no disponibles si el repositorio es privado o la API rechaza la consulta."
 });
}
