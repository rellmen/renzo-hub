// Notificaciones push · cliente. La suscripción del dispositivo se guarda en public.push_subscriptions (RLS por dueño).
// La clave pública VAPID la da la función push-notify; la privada nunca sale de la base de datos.
export function pushSupport(nav=globalThis.navigator,win=globalThis.window){
 const ua=String(nav?.userAgent||"");
 const ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&Number(nav?.maxTouchPoints)>1);
 const standalone=Boolean(win?.matchMedia?.("(display-mode: standalone)")?.matches||nav?.standalone);
 const supported=Boolean(nav&&"serviceWorker" in nav&&win&&"PushManager" in win&&"Notification" in win);
 return {supported,ios,standalone,needsInstall:ios&&!standalone,permission:supported?win.Notification.permission:"unsupported"};
}
export function b64uToBytes(s){
 const pad="=".repeat((4-String(s).length%4)%4);
 const bin=atob(String(s).replace(/-/g,"+").replace(/_/g,"/")+pad);
 return Uint8Array.from(bin,c=>c.charCodeAt(0));
}
export function deviceLabel(ua=String(globalThis.navigator?.userAgent||"")){
 if(/iPhone/.test(ua))return "iPhone";
 if(/iPad/.test(ua))return "iPad";
 if(/Android/.test(ua))return "Android";
 if(/Macintosh/.test(ua))return "Mac";
 if(/Windows/.test(ua))return "Windows";
 return "Navegador";
}
export function subscriptionRow(sub,label){
 const j=typeof sub?.toJSON==="function"?sub.toJSON():sub;
 if(!j?.endpoint||!/^https:\/\//.test(j.endpoint)||!j.keys?.p256dh||!j.keys?.auth)throw Error("El navegador no devolvió una suscripción válida.");
 return {endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,label:String(label||"").slice(0,80)};
}
async function publicKey(client){
 const {data,error}=await client.functions.invoke("push-notify",{method:"GET"});
 if(error||!data?.publicKey)throw Error("No se pudo preparar el servidor de avisos.");
 return data.publicKey;
}
export async function enablePush(client){
 const s=pushSupport();
 if(!s.supported)throw Error("Este navegador no admite notificaciones.");
 if(s.needsInstall)throw Error("En iPhone, primero añade Rise a la pantalla de inicio y ábrelo desde allí.");
 const perm=await Notification.requestPermission();
 if(perm!=="granted")throw Error(perm==="denied"?"Has bloqueado las notificaciones. Actívalas en Ajustes del sistema > Notificaciones > Rise.":"No se concedió el permiso.");
 const reg=await navigator.serviceWorker.ready;
 let sub=await reg.pushManager.getSubscription();
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64uToBytes(await publicKey(client))});
 const row=subscriptionRow(sub,deviceLabel());
 const {error}=await client.from("push_subscriptions").insert(row);
 // 23505: este dispositivo ya estaba activado.
 if(error&&error.code!=="23505")throw Error("No se pudo guardar este dispositivo.");
 return row;
}
export async function disablePush(client){
 const reg=await navigator.serviceWorker.ready;
 const sub=await reg.pushManager.getSubscription();
 if(sub){await client.from("push_subscriptions").delete().eq("endpoint",sub.endpoint);await sub.unsubscribe();}
}
export async function currentEndpoint(){
 if(!pushSupport().supported)return null;
 const reg=await navigator.serviceWorker.getRegistration();
 return (await reg?.pushManager.getSubscription())?.endpoint||null;
}
export async function listDevices(client){
 const {data,error}=await client.from("push_subscriptions").select("id,endpoint,label,created_at,last_ok_at").order("created_at",{ascending:false});
 if(error)throw Error("No se pudieron cargar los dispositivos.");
 return data||[];
}
export async function sendTest(client){
 const {data,error}=await client.functions.invoke("push-notify",{body:{action:"test"}});
 if(error)throw Error("No se pudo enviar la prueba.");
 if(!data?.delivered)throw Error("El servicio de avisos no aceptó el envío. Desactiva y vuelve a activar.");
 return data;
}
