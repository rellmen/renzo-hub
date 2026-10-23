import type {SupabaseClient} from "@supabase/supabase-js";
export type AssetValuation={kind:"investment"|"debt";name:string;value:number;date:string};
export declare function cleanAssetValuation(input:{kind:string;name:string;value:string|number;date:string},options?:{today?:Date}):AssetValuation;
export declare function saveAssetValuation(client:SupabaseClient,uid:string,input:{kind:string;name:string;value:string|number;date:string},options?:{today?:Date}):Promise<{id:string;owner_id:string;domain:string;record_type:string;payload:AssetValuation}>;
