export type WorkStatus="Today"|"This Week"|"Blocked"|"Waiting"|"Backlog"|"Completed";
export type WorkPriority="Normal"|"High"|"Strategic";
export type WorkColumn="todo"|"doing"|"done";
export interface WorkTask {
  id:string;title:string;status:WorkStatus;priority:WorkPriority;project:string;
  dueDate?:string;nextAction?:string;blocker?:string;
  aiCanDo?:boolean;renzoMustDo?:boolean;date?:string;
  updatedAt:string;_cloudUpdatedAt:string;
  [key:string]:unknown;
}
export interface WorkProject {id:string;title:string;status?:string;slot?:string;[key:string]:unknown}
export declare const WORK_STATUSES:readonly WorkStatus[];
export declare const WORK_PRIORITIES:readonly WorkPriority[];
export declare function mapTaskRow(row:Record<string,unknown>):WorkTask;
export declare function mapProjectRow(row:Record<string,unknown>):WorkProject;
export declare function statusColumn(status:WorkStatus):WorkColumn;
export declare function columnTargetStatus(column:WorkColumn):WorkStatus;
export declare function loadWorkRecords(client:import('@supabase/supabase-js').SupabaseClient,uid:string,options?:{limit?:number}):Promise<{tasks:WorkTask[];projects:WorkProject[]}>;
export declare function createWorkTask(client:import('@supabase/supabase-js').SupabaseClient,uid:string,input:{title:string;status?:WorkStatus;priority?:WorkPriority;project?:string}):Promise<WorkTask>;
export declare function updateWorkTaskStatus(client:import('@supabase/supabase-js').SupabaseClient,uid:string,task:WorkTask,status:WorkStatus):Promise<WorkTask>;
