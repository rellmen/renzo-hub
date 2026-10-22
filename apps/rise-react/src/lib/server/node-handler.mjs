// Server-only adapter: reuse classic handlers without HTTP proxying or duplicating auth.
export async function serveNodeHandler(request,handler){
 const headers=Object.fromEntries(request.headers);
 headers.host=new URL(request.url).host;
 let body;
 if(request.method==='POST'){
  if(!headers['content-type']?.toLowerCase().startsWith('application/json'))
   return Response.json({error:'Expected JSON'},{status:415});
  const reader=request.body?.getReader();let size=0;const chunks=[];
  if(reader)try{while(true){const {done,value}=await reader.read();if(done)break;
   size+=value.length;if(size>16384){await reader.cancel();return Response.json({error:'Body too large'},{status:413});}chunks.push(value);
  }}finally{reader.releaseLock();}
  try{body=JSON.parse(new TextDecoder().decode(Uint8Array.from(chunks.flatMap(c=>Array.from(c)))));}catch{
   return Response.json({error:'Invalid JSON'},{status:400});
  }
 }
 let status=200;const responseHeaders=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
 let response;
 const res={setHeader(k,v){responseHeaders.set(k,String(v));return res;},status(code){status=code;return res;},
 json(data){response=Response.json(data,{status,headers:responseHeaders});return res;}};
 try{await handler({method:request.method,headers,body},res);
  return response||Response.json({error:'Empty response'},{status:502,headers:responseHeaders});
 }catch{return Response.json({error:'Service unavailable'},{status:502,headers:responseHeaders});}
}
