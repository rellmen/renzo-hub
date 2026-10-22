import type {SupabaseClient} from "@supabase/supabase-js";
import type {LearningRun} from "./selflearn-checkpoints.mjs";
import type {LearningSnapshot} from "./selflearn-snapshot.mjs";
export interface AwardPlan {
 unit:{id:string;title:string;level:string;words:string[][]};
 area:string;event:{kind:string;area:string;course:string;title:string;stage:string;practice:string;courseLessonId:string;
 level:string;passed:boolean;score:number;totalQuestions:number;xp:number;minutes:number;date:string};
 already:boolean;newWords:string[][];newVocabulary:Array<{course:string;front:string;back:string;area:string;unitId:string;date:string;nextReview:string;intervalDays:number;repetitions:number}>;
}
export declare function stableRecordId(key:string):Promise<string>;
export declare function lessonAward(run:LearningRun,existing:LearningSnapshot,options:{at?:Date;uid:string}):AwardPlan;
export declare function finalizeOfficialLesson(client:SupabaseClient,uid:string,
 checkpoint:{id:string;sessionId:string;run:LearningRun},
 options?:{at?:Date;legacyActive?:boolean}):Promise<{already:boolean;xp:number;addedCards:number;unitId:string}>;
