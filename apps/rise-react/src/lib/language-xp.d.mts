import type {SupabaseClient} from "@supabase/supabase-js";
export interface LanguageXPReport{points:number;events:Array<{id:string;course:"nl"|"en";lesson:string;date:string;xp:number}>;duplicates:number;lessonCount:number}
export declare function summarizeLanguageXP(rows?:Array<Record<string,unknown>>):LanguageXPReport;
export declare function loadLanguageXP(client:SupabaseClient,uid:string):Promise<LanguageXPReport>;
