import type {SupabaseClient} from '@supabase/supabase-js';
export type LanguageCourse="nl"|"en";
export interface LearningRun {
 version:number;mode:string;course:LanguageCourse;unitId:string;
 steps:Array<{id:string;type:string;[key:string]:unknown}>;
 queue:string[];index:number;firstTry:Record<string,boolean>;
 attempts:Record<string,number>;mistakes:string[];
 startedAt:number;updatedAt:number;[key:string]:unknown
}
export interface LearningCheckpoint {
 id:string;created_at:string;updated_at:string;
 payload:{course:LanguageCourse;unitId:string;sessionId:string;run:LearningRun}
}
export declare function safeCheckpoint(run:LearningRun,sessionId:string):LearningCheckpoint["payload"];
export declare function recentLearningCheckpoints(client:SupabaseClient,uid:string,options?:{limit?:number}):Promise<LearningCheckpoint[]>;
export declare function newestStudyRun(rows:LearningCheckpoint[],courseId:LanguageCourse):{id:string;createdAt:string;sessionId:string;run:LearningRun}|null;
export declare function appendStudyCheckpoint(client:SupabaseClient,uid:string,run:LearningRun,sessionId:string,options?:{previousId?:string|null}):Promise<LearningCheckpoint>;
export declare function resumedStudyRun(legacyRun:LearningRun|null,checkpoint:{run:LearningRun}|null):LearningRun|null;
