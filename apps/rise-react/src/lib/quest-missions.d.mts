export interface QuestItem {id:string;title:string;route:string;done:boolean}
export interface QuestDay {day:string;items:QuestItem[];done:number;total:number}
export declare const QUESTS:readonly {id:string;title:string;route:string}[];
export declare function localDay(d?:Date):string;
export declare function shiftDay(day:string,delta:number):string;
export declare function questsForDay(day:string,events?:any[],money?:any[]):QuestDay;
export declare function summarizeQuests(today:string,events:any[],money:any[],days?:number):{today:QuestDay;week:QuestDay[];streak:number};
export declare function loadDailyQuests(client:import('@supabase/supabase-js').SupabaseClient,uid:string,today?:string):Promise<{today:QuestDay;week:QuestDay[];streak:number}>;
