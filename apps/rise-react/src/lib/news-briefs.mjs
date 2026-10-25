// Rise Nocturne · News (port de news.js Classic): filtros por fuente, búsqueda y alta manual privada.
export const NEWS_SOURCES=Object.freeze(["Claude","ChatGPT","Codex"]);
export function safeUrl(value){
 try{if(!value)return null;const u=new URL(String(value));return u.protocol==="https:"?u.href:null;}catch{return null;}
}
export function filterBriefs(rows=[],{source="all",text=""}={}){
 const q=String(text||"").trim().toLowerCase();
 return rows.filter(r=>(source==="all"||r.source===source)&&(!q||[r.title,r.content,r.source].some(x=>String(x||"").toLowerCase().includes(q))));
}
export function newBrief(v){
 const source=String(v.source||"");if(!NEWS_SOURCES.includes(source))throw Error("Fuente no permitida.");
 const title=String(v.title||"").trim();if(!title||title.length>160)throw Error("Indica un título de hasta 160 caracteres.");
 const date=String(v.brief_date||"");if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+"T00:00:00Z").toISOString().slice(0,10)!==date)throw Error("Fecha no válida.");
 const content=String(v.content||"").trim();if(!content||content.length>60000)throw Error("El contenido es obligatorio (máx. 60.000 caracteres).");
 const raw=String(v.source_url||"").trim();const url=raw?safeUrl(raw):null;if(raw&&!url)throw Error("El enlace debe empezar por https://.");
 return {source,title,brief_date:date,content,source_url:url};
}
export async function loadBriefs(client,uid){
 if(!client||!uid)throw Error("Inicia sesión para ver tus noticias.");
 const {data,error}=await client.from("news_briefs").select("id,user_id,title,source,brief_date,content,source_url")
  .eq("user_id",uid).order("brief_date",{ascending:false}).limit(500);
 if(error||!Array.isArray(data))throw Error("No se pudieron cargar los briefings.");
 if(data.some(r=>r.user_id!==uid))throw Error("Respuesta de otra cuenta rechazada.");
 return data;
}
export async function saveBrief(client,uid,v,id=globalThis.crypto.randomUUID()){
 if(!client||!uid)throw Error("Sesión necesaria.");
 const row={...newBrief(v),id,user_id:uid};
 const {error}=await client.from("news_briefs").insert(row);
 if(error)throw Error("No se pudo guardar. El contenido sigue en el formulario.");
 return row;
}
