// Dedicated Nocturne QA frontend: public Supabase config for the SAME environment.
// This endpoint returns only the URL and the publishable (anonymous) key.
// Never export a secret/service-role key or use this function for migrations.
export default function handler(request,response){
  response.setHeader("Cache-Control","no-store, max-age=0");
  response.setHeader("X-Content-Type-Options","nosniff");
  if(request.method!=="GET"){
    response.setHeader("Allow","GET");
    return response.status(405).json({error:"Method not allowed"});
  }
  const url=String(process.env.SUPABASE_URL||"").trim().replace(/\/$/,"");
  const key=String(process.env.SUPABASE_PUBLISHABLE_KEY||"").trim();
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)||
     key.length<20||/sb_secret_|service_role/i.test(key)){
    return response.status(503).json({error:"El acceso de este entorno QA no está configurado."});
  }
  return response.status(200).json({supabaseUrl:url,publishableKey:key});
}
