import type {SupabaseClient} from "@supabase/supabase-js";
export declare function setFixedMerchant(client:SupabaseClient,uid:string,merchant:string,fixed:boolean):Promise<{id:string;payload:Record<string,unknown>}>;
