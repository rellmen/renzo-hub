export type Urgency="P0"|"P1"|"P2"|"P3";
export type PriorityInput={
 title:string;urgency?:Urgency;dueDate?:string;deadlineType?:"real"|"interna";
 why?:string;origin?:"manual"|"chatgpt"|"claude";
};
export type PriorityTask=PriorityInput&{
 id:string;status:string;priority?:string;_cloudUpdatedAt:string;project?:string;[field:string]:unknown;
};
export declare const URGENCIES:readonly Urgency[];
export declare function normalizePriority(task:Partial<PriorityTask>):Required<Omit<PriorityInput,"title">>;
export declare function sortPriorityTasks<T extends PriorityTask>(tasks:T[],now?:string):T[];
export declare function validatePriorityInput(input:PriorityInput):Required<PriorityInput>;
export declare function createPriorityTask(client:any,uid:string,input:PriorityInput):Promise<any>;
export declare function patchPriorityTask(client:any,uid:string,task:PriorityTask,changes:Partial<PriorityInput>&{status?:string}):Promise<any>;
export declare function parsePriorityProposal(raw:string):Required<PriorityInput>[];
export declare function uniquePriorityProposals(proposals:Required<PriorityInput>[],current:PriorityTask[]):Required<PriorityInput>[];
