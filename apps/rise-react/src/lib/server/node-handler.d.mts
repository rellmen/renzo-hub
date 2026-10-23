export declare const DEFAULT_MAX_JSON_BYTES:number;
export declare function serveNodeHandler(request:Request,handler:(request:any,response:any)=>unknown,options?:{maxBodyBytes?:number}):Promise<Response>;
