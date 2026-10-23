import type {SupabaseClient} from "@supabase/supabase-js";
export type WeeklyBudgetRecord={id:string;owner_id:string;domain:string;record_type:string;payload:{weekly?:Record<string,number>;[key:string]:unknown};updated_at:string};
export declare const VARIABLE_BUDGET_CATEGORIES:ReadonlyArray<{id:string;name:string}>;
export declare function loadWeeklyBudget(client:SupabaseClient,uid:string):Promise<WeeklyBudgetRecord|null>;
export declare function cleanWeeklyLimits(values:Record<string,string|number|null|undefined>,previous?:Record<string,number>):Record<string,number>;
export declare function saveWeeklyBudget(client:SupabaseClient,uid:string,original:WeeklyBudgetRecord|null,values:Record<string,string|number|null|undefined>):Promise<WeeklyBudgetRecord>;
