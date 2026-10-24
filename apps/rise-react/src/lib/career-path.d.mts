export interface PathStep{id:string;label:string;auto?:string}
export interface PathMission{id:string;kind:"session"|"exam";day:string;weekday:number;subject:string;source:string;minutes:number;title:string;detail:string;chapter:number;week:number;steps:readonly PathStep[]}
export interface Milestone{id:string;group:string;due:string;title:string;detail:string;steps:readonly PathStep[];day?:undefined;kind?:undefined;subject?:undefined;minutes?:undefined}
export type PathItem=PathMission|Milestone;
export interface PathRow{id:string;owner_id:string;status:string;updated_at:string;payload:{taskId?:string;steps?:string[];plannedDay?:string;minutes?:number;roadmapVersion?:string;confirmedAt?:string|null;[key:string]:unknown}}
export interface PathChapter{name:string;subtitle:string;detail:string}
export interface FutureStage{year:string;name:string;detail:string;deliverable:string}
export interface StepState extends PathStep{done:boolean;isAuto:boolean}
export interface ItemState{steps:StepState[];doneSteps:number;totalSteps:number;done:boolean;pct:number}
export type WithState<T>=Omit<T,"steps">&Omit<ItemState,"steps">&{steps:StepState[]};
export type ItemRef={id:string};
export type AcademyProgressLite={lesson_id:string;status:string;completed_at?:string|null};
export declare const PATH_VERSION:string;
export declare const START_DAY:string;
export declare const LAST_WEEK:number;
export declare const DIRECTION:readonly string[];
export declare const SPECIFIC_SUBJECTS:readonly string[];
export declare const BOSSES:readonly PathMission[];
export declare const CHAPTERS:readonly PathChapter[];
export declare const FUTURE_STAGES:readonly FutureStage[];
export declare const MILESTONES:readonly Milestone[];
export declare function localDate(d?:Date):string;
export declare function dayOffset(day:string,n:number):string;
export declare function weekForDate(day:string):number;
export declare function weekStart(week:number):string;
export declare function tasksForWeek(week:number):PathMission[];
export declare function tasksForDay(day:string):PathMission[];
export declare function allTasks():PathMission[];
export declare function findItem(id:string):PathItem|null;
export declare function autoSteps(item:PathItem,academyProgress:AcademyProgressLite[]|null|undefined):Set<string>;
export declare function itemState(item:PathItem,row?:PathRow|null,auto?:Set<string>):ItemState;
export declare function rowsByTask(rows?:PathRow[]):Map<string,PathRow>;
export declare function pathMetrics(rows?:PathRow[],opts?:{today?:string;academyProgress?:AcademyProgressLite[]|null}):{done:number;total:number;percent:number;completeWeeks:number;
  due:number;dueDone:number;sessionRate:number|null;chapters:{done:number;total:number;pct:number}[];milestonesDone:number;milestonesTotal:number};
export interface TodayView{today:string;week:number;chapter:number;beforeStart:boolean;afterExams:boolean;todayItems:WithState<PathMission>[];overdue:WithState<PathMission>[];
  nextDay:string|null;nextItems:WithState<PathMission>[];weekDone:number;weekTotal:number;nextMilestone:WithState<Milestone>|null;openMilestones:WithState<Milestone>[]}
export declare function todayView(rows?:PathRow[],opts?:{today?:string;academyProgress?:AcademyProgressLite[]|null}):TodayView;
export declare function studyWindow(shift:string|undefined,day:string):{label:string;deep:string|null;review:string|null};
export declare function loadPathProgress(client:any,uid:string):Promise<PathRow[]>;
export declare function saveItemSteps(client:any,uid:string,item:ItemRef,steps:string[],oldRow?:PathRow,opts?:{auto?:Set<string>}):Promise<PathRow|null>;
export declare function setPathTask(client:any,uid:string,task:ItemRef&{day?:string},done:boolean,oldRow?:PathRow,opts?:{auto?:Set<string>}):Promise<PathRow|null>;
