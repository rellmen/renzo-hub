export interface Brief {id:string;user_id?:string;title:string|null;source:string|null;brief_date:string|null;content:string|null;source_url:string|null}
export declare const NEWS_SOURCES:readonly string[];
export declare function safeUrl(v:unknown):string|null;
export declare function filterBriefs(rows:Brief[],opts?:{source?:string;text?:string}):Brief[];
export declare function newBrief(v:Record<string,unknown>):Omit<Brief,'id'|'user_id'>;
export declare function loadBriefs(client:import('@supabase/supabase-js').SupabaseClient,uid:string):Promise<Brief[]>;
export declare function saveBrief(client:any,uid:string,v:Record<string,unknown>,id?:string):Promise<Brief>;
