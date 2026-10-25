export declare const PRODUCTS:readonly (readonly [string,string,string,string])[];
export declare const AM:readonly (readonly [string,string])[];
export declare const PM:Record<number,readonly (readonly [string,string])[]>;
export declare function stepsFor(date:Date,session:"am"|"pm",barrierFirst?:boolean):[string,string][];
export declare function dateKeyLocal(date:Date):string;
export declare const SKIN_DAY_START_HOUR:number;
export declare function skinRoutineDay(at?:Date,startHour?:number):Date;
