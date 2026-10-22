export type PayrollParseResult={
  employer?:Record<string,unknown>;
  payslip:{payslip_number:string;period_year:number;period_number:number;gross_salary:number;net_salary:number;net_payment:number;loonheffing?:number;document_date?:string|null};
  checks:Array<{passed:boolean;message:string}>;
  line_items:Array<Record<string,unknown>>;
  [key:string]:unknown;
};
export declare class PayslipParseError extends Error {}
export declare function extractRows(data:Uint8Array):Promise<Array<{page:number;y:number;items:Array<{s:string;x:number}>}>>;
export declare function parseSdWorx(rows:Array<{page:number;y:number;items:Array<{s:string;x:number}>}>):PayrollParseResult;
