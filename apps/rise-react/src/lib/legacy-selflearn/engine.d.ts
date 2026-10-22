export interface CourseUnit {id:string;level:string;topic:string;title:string;goal:string;words:string[][];sentences:string[][];grammar:{title:string;text:string};dialogue:string[][]}
export interface CourseLevel{id:string;label?:string;name?:string;[key:string]:unknown}
export interface Course {id:string;name:string;label:string;tagline:string;units:CourseUnit[];levels:CourseLevel[];examNote:string}
export declare const COURSES:Record<"nl"|"en",Course>;
export declare const LANGUAGE_GOALS:Readonly<Record<"nl"|"en",string>>;
export declare function courseUnits(courseId:"nl"|"en"):CourseUnit[];
export declare function completedUnitIds(entries:Record<string,unknown>[],courseId:"nl"|"en"):Set<string>;
export declare function levelProgress(courseId:"nl"|"en",entries:Record<string,unknown>[]):Array<CourseLevel&{total:number;done:number}>;
export declare function nextUnit(courseId:"nl"|"en",entries:Record<string,unknown>[],settings:Record<string,unknown>):CourseUnit;
