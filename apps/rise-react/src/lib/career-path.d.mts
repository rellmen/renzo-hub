export interface PathMission{id:string;day:string;weekday:number;subject:string;minutes:number;title:string;detail:string;chapter:number;week:number}
export interface PathRow{id:string;owner_id:string;status:string;updated_at:string;payload:{taskId?:string;plannedDay?:string;minutes?:number;roadmapVersion?:string;confirmedAt?:string|null;[key:string]:unknown}}
export interface PathChapter{name:string;subtitle:string;detail:string;color:string}
export interface FutureStage{year:string;name:string;detail:string}
export declare const PATH_VERSION:string;
export declare const START_DAY:string;
export declare const LAST_WEEK:number;
export declare const CHAPTERS:readonly PathChapter[];
export declare const FUTURE_STAGES:readonly FutureStage[];
export declare function localDate(d?:Date):string;
export declare function dayOffset(day:string,n:number):string;
export declare function weekForDate(day:string):number;
export declare function weekStart(week:number):string;
export declare function tasksForWeek(week:number):PathMission[];
export declare function allTasks():PathMission[];
export declare function pathMetrics(rows?:PathRow[]):{done:number;total:number;percent:number;completeWeeks:number};
export declare function loadPathProgress(client:any,uid:string):Promise<PathRow[]>;
export declare function setPathTask(client:any,uid:string,task:PathMission,done:boolean,oldRow?:PathRow):Promise<PathRow|null>;
