import type {SupabaseClient} from "@supabase/supabase-js";
import type {PayrollRow} from "./payroll-overview.mjs";
export declare const PAYROLL_REVIEW_FIELDS:Readonly<Record<string,string>>;
export declare function payrollReviewChanges(original:PayrollRow,form:Record<string,unknown>):Record<string,number|string|null>;
export declare function applyPayrollReview(client:SupabaseClient,uid:string,payslip:PayrollRow,form:Record<string,unknown>,decision:"approved"|"rejected",note?:string):Promise<{ok:boolean;payslip_id:string;review_status:string}>;
