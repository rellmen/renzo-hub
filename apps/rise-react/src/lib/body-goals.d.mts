import type {GymGoals} from './legacy-gym/goals.js';
export declare function validateGymGoals(raw:any):GymGoals;
export declare function sanitizeBodyProfile(input?:Record<string,unknown>):Record<string,any>;
export declare function checkRanges(p:Record<string,any>):Record<string,any>;
export interface SettingsSnap {settings:Record<string,any>;updated_at:string|null;exists:boolean}
export declare function loadSettings(client:any,uid:string):Promise<SettingsSnap>;
export declare function saveSettingsKey(client:any,uid:string,snap:SettingsSnap,key:string,value:unknown):Promise<any>;
export declare function saveBodyProfile(client:any,uid:string,snap:SettingsSnap,input:Record<string,unknown>):Promise<any>;
export declare function saveGymGoals(client:any,raw:any):Promise<GymGoals>;
export declare function loadWeightHistory(client:any,uid:string,limit?:number):Promise<{id:string;owner_id:string;payload:any;occurred_at:string;updated_at:string}[]>;
export declare function correctWeight(client:any,uid:string,row:any,raw:string,at?:Date):Promise<any>;
export declare function deleteWeight(client:any,uid:string,row:any):Promise<true>;
