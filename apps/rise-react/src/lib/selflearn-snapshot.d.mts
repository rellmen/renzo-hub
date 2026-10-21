export interface LearningRecord {id:string;course?:string;kind?:string;practice?:string;courseLessonId?:string;fsrsCard?:{due?:string};nextReview?:string;[key:string]:unknown}
export interface LearningSnapshot {
  entries:LearningRecord[];vocabulary:LearningRecord[];
  completed:{nl:string[];en:string[]};
  reviewDue:{nl:number;en:number};
  learningRuns:{nl:Record<string,unknown>|null;en:Record<string,unknown>|null};
  learningSettings:Record<string,unknown>;
  goals:{nl:"B2";en:"C1"};note:string;
}
export declare function summarizeLearningSnapshot(opts?:{state?:Record<string,unknown>;rows?:Array<Record<string,unknown>>}):LearningSnapshot;
export declare function loadLearningSnapshot(client:import('@supabase/supabase-js').SupabaseClient,uid:string,options?:{maxPages?:number}):Promise<LearningSnapshot>;
