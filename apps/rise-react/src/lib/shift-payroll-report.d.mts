import type {SupabaseClient} from "@supabase/supabase-js";
export type ContractualWeek={week:string;agency:string;minutes:number;overtimeMinutes:number;gross:number;byPercentage:Array<{kind:string;percent:number;minutes:number;amount:number}>};
export type ContractualReport={weeks:ContractualWeek[];shifts:unknown[];count:number;unverified:number;warning:string};
export declare function loadSavedShifts(client:SupabaseClient,uid:string):Promise<Array<{id:string;owner_id:string;domain:string;record_type:string;title:string|null;occurred_at:string|null;payload:Record<string,unknown>}>>;
export declare function buildContractualReport(rows:Array<{id:string;payload:Record<string,unknown>}>):ContractualReport;
