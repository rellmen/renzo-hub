export type SkinSession="am"|"pm";
export type SkinLog={routine_date:string;session:SkinSession;completed_steps:number[]};
export type SkinState={today:string;barrierFirst:boolean;inventory:Record<string,string>;settings:{skinPhase:string};note:string;logs:SkinLog[];current:Record<SkinSession,number[]>};
export declare function loadSkinState(client:import('@supabase/supabase-js').SupabaseClient,uid:string,at?:Date):Promise<SkinState>;
export declare function setSkinSteps(client:import('@supabase/supabase-js').SupabaseClient,uid:string,day:string,session:SkinSession,indices:number[],stepCount:number):Promise<SkinLog>;
export declare function setSkinNote(client:import('@supabase/supabase-js').SupabaseClient,uid:string,day:string,value:string):Promise<{note_date:string;note:string}>;
export declare function weekSkinProgress(logs:SkinLog[],at?:Date,barrierFirst?:boolean):{day:string;display:string;done:number;total:number;pct:number}[];
export declare function setSkinInventoryStatus(client:import('@supabase/supabase-js').SupabaseClient,uid:string,productId:string,status:"unknown"|"available"|"paused"|"finished"):Promise<Record<string,string>>;
