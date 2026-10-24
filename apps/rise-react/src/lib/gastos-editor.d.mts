import type {SupabaseClient} from "@supabase/supabase-js";
export interface BankTransaction {id:string;payload:Record<string,unknown>;updated_at:string}
export interface MoneyRule {id:string;title:string|null;payload:{merchant?:string;category?:string;[k:string]:unknown};updated_at:string}
export interface GastosItem {id:string;date:string;name:string;amount:number;merchant:string;category:string;source:string;bank:string;description:string;contribution:boolean}
export declare const GASTOS_CATEGORIES:readonly {id:string;name:string;kind:string;icon:string}[];
export declare function loadGastos(client:SupabaseClient,uid:string):Promise<{items:GastosItem[];transactions:BankTransaction[];rules:MoneyRule[];categories:typeof GASTOS_CATEGORIES;months:string[];summary:(month:string)=>{month:string;count:number;spent:number;earned:number;net:number;uncategorized:number;received:number;loans:number;cash:number}}>;
export declare function categoryPayload(original:Record<string,unknown>,category:string):Record<string,unknown>;
export declare function saveGastosCategory(client:SupabaseClient,uid:string,row:Pick<BankTransaction,"id"|"updated_at">,category:string):Promise<BankTransaction>;
export declare function saveMerchantRule(client:SupabaseClient,uid:string,input:{merchant:string;txRow?:BankTransaction},category:string,rules?:MoneyRule[],opts?:{id?:string}):Promise<string>;
export declare function deleteMerchantRule(client:SupabaseClient,uid:string,rule:MoneyRule):Promise<true>;
