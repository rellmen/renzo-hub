import type {SupabaseClient} from '@supabase/supabase-js';
import type {LearningRecord} from './selflearn-snapshot.mjs';
export type ReviewGrade='again'|'hard'|'good'|'easy';
export declare function planVocabularyReview(item:LearningRecord,grade:ReviewGrade,options?:{at?:Date}):LearningRecord;
export declare function saveVocabularyReview(client:SupabaseClient,uid:string,item:LearningRecord,grade:ReviewGrade,
 options:{at?:Date;reviewId:string}):Promise<{id:string;reviewId:string;repetitions:number}>;
