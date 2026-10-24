import type {SupabaseClient} from "@supabase/supabase-js";
import type {AttemptRow,Prefs,ProgressRow,ReviewRow} from "./engine.mjs";
export type ExamRow={id:string;client_session_id:string;profile_id:string;course:string;source_url:string|null;source_label:string|null;duration_minutes:number;
  status:"in_progress"|"submitted";scores:Record<string,unknown>;notes:string;total_score:number|null;revision:number;started_at:string;submitted_at:string|null};
export type EditorialRow={lesson_id:string;content_version:number;decision:"reviewed"|"changes_requested";comment:string;created_at:string};
export type AcademyState={progress:ProgressRow[];reviews:ReviewRow[];attempts:AttemptRow[];prefs:Prefs|null;exams:ExamRow[];editorial:EditorialRow[];attemptsPartial:boolean};
export type GradeResult={attempt_id:string;question_id:string;is_correct:boolean;score:number;max_score:number;correct:string|null;explanation_md:string;duplicate:boolean;session_id:string|null};
export type FinishResult={lesson_id:string;context:string;pct:number;correct:number;total:number;band:"dominio"|"practica"|"rescate";status:string;next_review:string|null;duplicate:boolean};
export class AcademyBackendMissing extends Error{}
export function loadAcademyState(c:SupabaseClient,uid:string):Promise<AcademyState>;
export function openLesson(c:SupabaseClient,uid:string,lessonId:string,section?:string):Promise<ProgressRow|null>;
export function saveLessonDraft(c:SupabaseClient,uid:string,row:ProgressRow,o:{draft?:Record<string,unknown>;lastSection?:string}):Promise<ProgressRow>;
export function gradeAnswer(c:SupabaseClient,o:{attemptId:string;questionId:string;answer:Record<string,unknown>;context:"practice"|"exit"|"review"|"diagnostic";sessionId?:string|null}):Promise<GradeResult>;
export function finishQuiz(c:SupabaseClient,o:{lessonId:string;sessionId:string;context:"exit"|"review"}):Promise<FinishResult>;
export function savePreferences(c:SupabaseClient,uid:string,current:Prefs|null,next:Omit<Prefs,"revision">):Promise<Prefs>;
export function startExam(c:SupabaseClient,uid:string,o:{clientSessionId:string;profileId:string;course:string;sourceUrl?:string|undefined;sourceLabel?:string|undefined;durationMinutes:number}):Promise<ExamRow>;
export function saveExam(c:SupabaseClient,uid:string,row:ExamRow,o:{scores:Record<string,unknown>;notes:string;total?:number;submit?:boolean}):Promise<ExamRow>;
export function recordEditorialReview(c:SupabaseClient,uid:string,o:{lessonId:string;contentVersion:number;decision:"reviewed"|"changes_requested";comment?:string}):Promise<boolean>;
