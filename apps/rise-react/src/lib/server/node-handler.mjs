// Server-only adapter: reuse classic handlers without HTTP proxying or duplicating auth.
// The 16 KiB default is intentionally preserved for Ares, tutor, and other JSON APIs.
export const DEFAULT_MAX_JSON_BYTES = 16_384;

export async function serveNodeHandler(request, handler, { maxBodyBytes = DEFAULT_MAX_JSON_BYTES } = {}) {
 const headers = Object.fromEntries(request.headers);
 headers.host = new URL(request.url).host;
 let body;
 if (request.method === 'POST') {
  if (!headers['content-type']?.toLowerCase().startsWith('application/json'))
   return Response.json({error:'Expected JSON'},{status:415,headers:{'Cache-Control':'no-store'}});
  if (!Number.isSafeInteger(maxBodyBytes) || maxBodyBytes <= 0)
   throw new RangeError('maxBodyBytes must be a positive integer');
  const declared = Number(headers['content-length']);
  if (headers['content-length'] && Number.isFinite(declared) && declared > maxBodyBytes)
   return Response.json({error:'Body too large'},{status:413,headers:{'Cache-Control':'no-store'}});
  const reader = request.body?.getReader();
  let size = 0;
  const chunks = [];
  if (reader) try {
   while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBodyBytes) {
     await reader.cancel();
     return Response.json({error:'Body too large'},{status:413,headers:{'Cache-Control':'no-store'}});
    }
    chunks.push(value);
   }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { body = JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes)); }
  catch { return Response.json({error:'Invalid JSON'},{status:400,headers:{'Cache-Control':'no-store'}}); }
 }
 let status=200;
 const responseHeaders=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
 let response;
 const res={setHeader(k,v){responseHeaders.set(k,String(v));return res;},status(code){status=code;return res;},
 json(data){response=Response.json(data,{status,headers:responseHeaders});return res;}};
 try{await handler({method:request.method,headers,body},res);
  return response||Response.json({error:'Empty response'},{status:502,headers:responseHeaders});
 }catch{return Response.json({error:'Service unavailable'},{status:502,headers:responseHeaders});}
}
