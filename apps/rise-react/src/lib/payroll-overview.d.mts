import type {SupabaseClient} from "@supabase/supabase-js";
export type PayrollDocument={id:string;user_id:string;original_file_name?:string|null;status?:string|null;storage_path_raw?:string|null;storage_path_archive?:string|null;doc_class?:string|null};
export type PayrollRow={id:string;document_id?:string|null;period_end?:string|null;period_label?:string|null;gross_salary?:number|null;net_salary?:number|null;net_payment?:number|null;worked_hours?:number|null;review_status?:string|null;validation_status?:string|null;currency?:string|null;document:PayrollDocument|null;unresolved:number;failedValidations:number};
export type PayrollOverview={rows:PayrollRow[];documentCount:number;anomalyCount:number;unresolvedAnomalies:number;failedValidations:number;approvedCount:number;latestNet:number|null};
export declare function summarizePayroll(payslips?:Record<string,unknown>[],documents?:Record<string,unknown>[],anomalies?:Record<string,unknown>[],validations?:Record<string,unknown>[]):PayrollOverview;
export declare function loadPayrollOverview(client:SupabaseClient,uid:string):Promise<PayrollOverview>;
export declare function downloadPayrollDocument(client:SupabaseClient,uid:string,doc:PayrollDocument):Promise<{blob:Blob;name:string}>;
