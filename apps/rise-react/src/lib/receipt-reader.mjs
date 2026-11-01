// Tickets · solo navegador. Comprime la foto, la lee en el dispositivo (tesseract.js en /vendor/tesseract,
// sin CDN ni servidor) y, solo si Renzo lo pide, consulta /api/receipt-items.
const BASE="/vendor/tesseract";
let libPromise=null,workerPromise=null;

function loadLib(){
 if(globalThis.Tesseract)return Promise.resolve(globalThis.Tesseract);
 if(!libPromise)libPromise=new Promise((ok,ko)=>{
  const s=document.createElement("script");
  s.src=BASE+"/tesseract.min.js";s.async=true;
  s.onload=()=>globalThis.Tesseract?ok(globalThis.Tesseract):ko(Error("Lector no disponible."));
  s.onerror=()=>{libPromise=null;ko(Error("No se pudo cargar el lector de tickets."));};
  document.head.appendChild(s);
 });
 return libPromise;
}
let progressCb=null;
async function getWorker(){
 if(!workerPromise)workerPromise=loadLib().then(T=>T.createWorker("nld",1,{
  workerPath:BASE+"/worker.min.js",corePath:BASE+"/core",langPath:BASE+"/lang",gzip:true,workerBlobURL:false,
  logger:m=>{if(progressCb&&m?.status==="recognizing text")progressCb(Math.round((m.progress||0)*100));}
 })).catch(e=>{workerPromise=null;throw e;});
 return workerPromise;
}

// JPEG de como mucho 1600 px de lado: legible para el lector y por debajo de 2 MB para la IA.
export async function compressPhoto(file,max=1600,quality=0.82){
 if(!file||!/^image\//.test(file.type))throw Error("Elige una foto.");
 if(file.size>25*1024*1024)throw Error("La foto pesa demasiado.");
 const bitmap=await createImageBitmap(file,{imageOrientation:"from-image"}).catch(()=>null);
 if(!bitmap)throw Error("No se pudo abrir la foto. Prueba con JPEG o PNG.");
 const scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement("canvas");
 canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 canvas.getContext("2d").drawImage(bitmap,0,0,canvas.width,canvas.height);
 bitmap.close?.();
 let q=quality,blob;
 do{blob=await new Promise(r=>canvas.toBlob(r,"image/jpeg",q));q-=0.12;}while(blob&&blob.size>1.9*1024*1024&&q>0.4);
 if(!blob)throw Error("No se pudo preparar la foto.");
 return blob;
}

export async function readOnDevice(blob,onProgress){
 const worker=await getWorker();
 progressCb=onProgress||null;
 try{const {data}=await worker.recognize(blob);return String(data?.text||"");}
 finally{progressCb=null;}
}

export const blobToDataUrl=blob=>new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result));r.onerror=()=>ko(Error("No se pudo preparar la foto."));r.readAsDataURL(blob);});

export async function receiptAiStatus(fetcher=fetch){
 try{const r=await fetcher("/api/receipt-items",{cache:"no-store",credentials:"same-origin"});if(!r.ok)return false;return (await r.json())?.enabled===true;}
 catch{return false;}
}

export async function askReceiptItems(token,dataUrl,{allowCollection=false,fetcher=fetch}={}){
 if(!token)throw Error("Sesión necesaria.");
 const r=await fetcher("/api/receipt-items",{method:"POST",credentials:"same-origin",cache:"no-store",
  headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({image:dataUrl,allowCollection})});
 let data;try{data=await r.json();}catch{throw Error("Respuesta no válida del servidor.");}
 if(r.status===409&&data?.needsConsent){const e=Error(String(data.error||""));e.needsConsent=true;throw e;}
 if(!r.ok)throw Error(String(data?.error||"La lectura con IA no está disponible."));
 return data;
}
