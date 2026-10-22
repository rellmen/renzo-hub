import type {SupabaseClient} from '@supabase/supabase-js';
import type {GymSession,GymPlanDay,GymSet} from './gym-records.mjs';
export type GymDraftSet=GymSet&{notes?:string;side?:'left'|'right'|null};
export declare function planToSession(plan:GymPlanDay[],day:number,uid:string,at?:Date):GymSession;
export declare function startGymDraft(client:SupabaseClient,uid:string,plan:GymPlanDay[],day:number,at?:Date):Promise<GymSession>;
export declare function prepareGymSave(base:GymSession,updates:GymDraftSet[][],options?:{finish?:boolean;at?:Date}):GymSession;
export declare function saveGymDraft(client:SupabaseClient,uid:string,base:GymSession,updates:GymDraftSet[][],options?:{finish?:boolean;at?:Date}):Promise<GymSession>;
