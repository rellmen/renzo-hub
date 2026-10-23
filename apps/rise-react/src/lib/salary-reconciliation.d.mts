export interface SalaryMatch {
 id:string;date:string;amount:number;numbers:Array<string|number>;status:"confirmed"|"difference"|"review"|"unlinked";expected:number|null;diff:number|null;payslipIds:string[];
}
export interface SalaryBreakdown {
 month:string;earned:number;salary:number;confirmed:number;unverified:number;other:number;
 rows:SalaryMatch[];missing:Array<{id:string;number:string;period:string|null;date:string;net:number}>;
 notImported:Array<{id:string;number:string;period:string|null;date:string;net:number}>;complete:boolean;
}
export declare function incomeBreakdown(input:{
 items:Array<{id:string;date:string;category:string;amount:number;merchant:string}>;
 txs:Array<{id:string;payload:{date:string;amount:number;payslip_numbers:number[];bank:string}}>;
 payslips:Array<Record<string,unknown>>;
 month:string;
 expectedDate:(p:{payment_date?:string|null})=>string|null;
 lastImport:string|null;
}):SalaryBreakdown;
export declare function isConfirmedPayslip(value:Record<string,unknown>):boolean;
