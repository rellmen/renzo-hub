export interface CareerRow {id:string;owner_id:string;title:string|null;status:string|null;occurred_at?:string|null;updated_at?:string;payload:any}
export type CareerKind='course'|'skill'|'project';
export declare const CAREER_KINDS:Record<CareerKind,{label:string;statuses:string[]}>;
export declare const STATUS_LABEL:Record<string,string>;
export declare const SKILL_AREAS:readonly string[];
export declare function careerPayload(kind:string,v:Record<string,any>,previous?:any):any;
export declare function sortCareer(rows:CareerRow[]):CareerRow[];
export declare function careerSummary(rows:CareerRow[]):{courses:CareerRow[];completed:number;skills:CareerRow[];projects:CareerRow[];archived:number};
export declare function loadCareer(client:any,uid:string):Promise<CareerRow[]>;
export declare function addCareerItem(client:any,uid:string,kind:CareerKind,v:Record<string,any>,id?:string):Promise<CareerRow>;
export declare function updateCareerItem(client:any,uid:string,row:CareerRow,v:Record<string,any>):Promise<CareerRow>;
export declare function archiveCareerItem(client:any,uid:string,row:CareerRow,archived?:boolean):Promise<CareerRow>;
export declare function evidencePath(uid:string,path:string):string;
export declare function attachEvidence(client:any,uid:string,row:CareerRow,file:File):Promise<CareerRow>;
export declare function downloadEvidence(client:any,uid:string,e:any):Promise<{blob:Blob;name:string}>;
