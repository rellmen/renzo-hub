import type {SupabaseClient} from "@supabase/supabase-js";
export declare const GOAL_TYPES:Readonly<Record<"emergency"|"target"|"invest",string>>;
export interface GoalInput {type:string;name?:string;months?:string|number;amount?:string|number;date?:string;start?:string;monthly?:string|number}
export interface GoalRecord {id:string;title:string;type:string|null;status:string;updated_at:string;payload:Record<string,unknown>;progress?:{status:string;pct?:number|null;current?:number;missing?:number;reason?:string;perWeek?:number|null}|null}
export declare function buildFinancialGoal(input:GoalInput):Record<string,unknown>;
export declare function goalProgress(goal:Record<string,unknown>,ctx:{items:unknown[];today:string;month:string;cash:number|null;fixedMonthly:number|null;months:string[]}):{status:string;pct?:number|null;current?:number;missing?:number;reason?:string;perWeek?:number|null};
export declare function saveFinancialGoal(client:SupabaseClient,uid:string,input:GoalInput):Promise<{id:string;owner_id:string;record_type:string;payload:Record<string,unknown>;status:string}>;
export declare function archiveFinancialGoal(client:SupabaseClient,uid:string,goal:GoalRecord):Promise<{id:string;status:string}>;
