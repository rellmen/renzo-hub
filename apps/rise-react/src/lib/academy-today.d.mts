export type AcademyToday={
  languages:{nlDue:number;enDue:number;nlDone:number;enDone:number}|null;
  exam:{due:number;next:{course:string;lesson:{id:string;title:string;estimated_minutes?:number};inProgress:boolean}[]}|null;
  totalDue:number|null;partial:boolean;
};
export declare function academyToday(src?:{
  learning?:{reviewDue:{nl:number;en:number};completed:{nl:string[];en:string[]}}|null;
  uoc?:{due:unknown[];next:{course:string;lesson:{id:string;title:string;estimated_minutes?:number};inProgress:boolean}[]}|null;
}):AcademyToday;
export type QueueItem={id:string;source:"uoc"|"nl"|"en";label:string;detail:string;count:number;minutes:number;due_on?:string;
  to:"/academia"|"/aprender";search:{leccion?:string;idioma?:"nl"|"en"}};
export declare function localDay(d?:Date):string;
export declare function weekRange(now?:Date):{start:string;end:string};
export declare function reviewQueue(src?:{learning?:{reviewDue:{nl:number;en:number}}|null;uocDue?:{lesson_id:string;due_on:string;step:number}[]|null|undefined;
  lessonInfo?:(id:string)=>({title:string;course_title?:string}|null)}):{items:QueueItem[];total:number|null;partial:boolean};
export type Weekly={start:string;end:string;selflearn:number|null;uocTimed:number|null;uocLessonsEstimate:number|null;total:number|null;goal:number|null;pct:number|null;partial:boolean};
export declare function weeklyMinutes(src?:{entries?:{kind?:string;date?:string;minutes?:number}[]|null;mocks?:{started_at:string;submitted_at:string|null;duration_minutes:number}[]|null;
  exams?:{started_at:string;submitted_at:string|null;duration_minutes:number}[]|null;progress?:{lesson_id:string;status:string;completed_at?:string|null}[]|null;
  lessonMinutes?:(id:string)=>number;goal?:number|null;now?:Date}):Weekly;
export type Slot={shift:string;work:boolean|null;moment:string;budget:number};
export declare function studySlot(shift:string|undefined,sessionMinutes?:number|null):Slot;
export type NextStep={kind:"uoc-review"|"vocab"|"uoc-lesson"|"done"|"idioma";title:string;detail:string;minutes:number|null;
  to:"/academia"|"/aprender";search:{leccion?:string;idioma?:"nl"|"en"};reason:string};
export declare function nextStep(src?:{queue?:{items:QueueItem[]}|null;uocNext?:{course:string;courseTitle?:string;lesson:{id:string;title:string;estimated_minutes?:number};inProgress:boolean}[]|null;
  slot?:Slot|null;weekly?:Weekly|null;uocOn?:boolean;preferCourses?:string[]}):NextStep;
