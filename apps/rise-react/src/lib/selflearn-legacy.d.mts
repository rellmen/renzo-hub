import type {SupabaseClient} from "@supabase/supabase-js";
import type {LearningRun} from "./selflearn-checkpoints.mjs";
export type LegacyRunInfo={resumable:boolean;complete:boolean;valid:boolean;unitId:string|null;step:number;total:number};
export declare function legacyRunInfo(run:unknown):LegacyRunInfo|null;
export declare function adoptLegacyRun(client:SupabaseClient,uid:string,course:"nl"|"en"):Promise<{adopted:{id:string;sessionId:string;run:LearningRun}|null;cleared:boolean}>;
export declare function discardLegacyRun(client:SupabaseClient,uid:string,course:"nl"|"en"):Promise<{cleared:boolean;run:unknown}>;
