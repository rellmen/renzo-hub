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
export declare function wednesdaysOf(month:string):string[];
export interface PayWeek {date:string;state:"paid"|"missing"|"upcoming";net:number|null;running:number|null}
export interface PayMonthToDate {
 month:string;net:number;gross:number;hours:number;slips:number;weeks:PayWeek[];offCycle:PayMonthSlip[];
 missing:number;paidWeeks:number;totalWeeks:number;nextPayday:string|null;pending:number;estimated:number;
 previous:{month:string;net:number;samePoint:number|null}|null;ytd:number;lastSlip:PayMonthSlip|null;paidDates:string[];
}
export declare function payrollMonthToDate(rows:Array<Record<string,any>>,today:string):PayMonthToDate|null;
