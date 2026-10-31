export type PayrollOutlier={level:"warning";cause:"fewer_hours"|"deductions"|"unknown";net:number;usualNet:number;ratio:number;hours:number|null;usualHours:number|null;references:number;question:string};
export declare const OUTLIER_RATIO:number;
export declare const MIN_REFERENCES:number;
export declare function payrollOutlier(row:Record<string,any>,rows:Array<Record<string,any>>):PayrollOutlier|null;
export declare function payrollOutliers(rows?:Array<Record<string,any>>):Array<{id:string;outlier:PayrollOutlier}>;
