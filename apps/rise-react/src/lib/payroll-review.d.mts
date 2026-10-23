import type {SupabaseClient} from "@supabase/supabase-js";
export declare const PAYROLL_REVIEW_FIELDS:Readonly<Record<string,string>>;
export declare function payrollReviewChanges(original:Record<string,unknown>,form:Record<string,unknown>):Record<string,number|string|null>;
export declare function applyPayrollReview(client:SupabaseClient,uid:string,payslip:Record<string,unknown>,form:Record<string,unknown>,decision:"approved"|"rejected",note?:string):Promise<{ok:boolean;payslip_id:string;review_status:string}>;
