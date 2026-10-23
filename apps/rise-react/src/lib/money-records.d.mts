import type {SupabaseClient} from '@supabase/supabase-js';
export interface MoneyCategory{id:string;name:string;total:number;count:number;share:number}
export interface MoneyMonth{month:string;count:number;earned:number;spent:number;savings:number;rate:number|null;uncategorized:number;categories:MoneyCategory[];prev:null|{month:string;earned:number;spent:number;savings:number}}
export interface MoneyWorth{total:number|null;cash:number;invested:number;owed:number;stale:number;accounts:{key:string;bank:string;balance:number;date:string;stale:boolean}[];investments:{name:string;value:number;stale:boolean}[];debts:{name:string;value:number;stale:boolean}[]}
export interface MoneySummary{months:string[];month:string|null;txCount:number;monthSummary:MoneyMonth|null;items:unknown[];worth:MoneyWorth;bankUpdatedThrough:Record<string,string>;noRevolutStatement:boolean;possibleRevolutGap:number|null;goals:{id:string;title:string;type:string|null;status:string;updated_at:string;payload:Record<string,unknown>;progress:{status:string;pct?:number|null;current?:number;missing?:number;reason?:string;perWeek?:number|null}|null}[];budget:unknown}
export declare function summarizeMoney(fin:unknown,assets:unknown[],goals:unknown[],opts?:{at?:Date}):MoneySummary;
export declare function loadRealMoney(client:SupabaseClient,uid:string,opts?:{at?:Date}):Promise<MoneySummary>;
export declare function moneyMonthView(summary:MoneySummary,month:string):MoneyMonth|null;
