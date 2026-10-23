import type {SupabaseClient} from '@supabase/supabase-js';
export type Payslip={id:string;period_label:string|null;period_start:string|null;period_end:string|null;payment_date:string|null;currency:string|null;worked_hours:number|string|null;gross_salary:number|string|null;net_payment:number|string|null;review_status:string|null;validation_status:string|null};
export type ShiftRecord={id:string;title:string|null;payload:{hourlyRate?:number;date?:string;start?:string;end?:string;[key:string]:unknown};updated_at:string};
export function loadPayrollRecords(client:SupabaseClient,uid:string):Promise<{payslips:Payslip[];contracts:ShiftRecord[];shifts:ShiftRecord[]}>;
export function payrollTotals(rows:Payslip[]):Record<string,{amount:number;count:number;missing:number}>;
