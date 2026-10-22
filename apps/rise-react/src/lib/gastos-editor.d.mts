import type {SupabaseClient} from "@supabase/supabase-js";
export interface BankTransaction {id:string;payload:Record<string,unknown>;updated_at:string}
export interface GastosItem {id:string;date:string;name:string;amount:number;merchant:string;category:string;source:string;bank:string;description:string;contribution:boolean}
export declare const GASTOS_CATEGORIES:readonly {id:string;name:string;kind:string;icon:string}[];
export declare function loadGastos(client:SupabaseClient,uid:string):Promise<{items:GastosItem[];transactions:BankTransaction[];categories:typeof GASTOS_CATEGORIES;months:string[];summary:(month:string)=>{month:string;count:number;spent:number;earned:number;net:number;uncategorized:number}}>;
export declare function categoryPayload(original:Record<string,unknown>,category:string):Record<string,unknown>;
export declare function saveGastosCategory(client:SupabaseClient,uid:string,row:Pick<BankTransaction,"id"|"updated_at">,category:string):Promise<BankTransaction>;
