export interface PayMonthSlip {
 id:string;label:string;number:string|number|null;date:string;estimated:boolean;
 net:number|null;gross:number|null;hours:number|null;status:string|null;running:number;
}
export interface PayMonth {
 month:string;slips:PayMonthSlip[];net:number;gross:number;hours:number;estimated:number;pending:number;
}
export declare function payDateOf(p:{payment_date?:string|null;period_end?:string|null}):{date:string|null;estimated:boolean};
export declare function expectedPayDate(p:{payment_date?:string|null;period_end?:string|null}):string|null;
export declare function payrollByPayMonth(rows:Array<Record<string,any>>):PayMonth[];
