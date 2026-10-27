export type Urgency="P0"|"P1"|"P2"|"P3";
export type DeadlineType="real"|"interna";
export type Origin="manual"|"chatgpt"|"claude";
export type PriorityEvidence={proposalId?:string;sourceRef?:string;evidenceSummary?:string;evidenceCheckedAt?:string};
export type PriorityInput=PriorityEvidence&{
 title:string;urgency?:Urgency;dueDate?:string;deadlineType?:DeadlineType;why?:string;origin?:Origin;
};
export type ValidPriority=Required<PriorityInput>;
export type PriorityTask=PriorityInput&{
 id:string;status:string;priority?:string;_cloudUpdatedAt:string;project?:string;reopenStatus?:string;
 proposalEvidence?:PriorityEvidence;[field:string]:unknown;
};
export type ProposalReview={
 index:number;id:string;input:ValidPriority;selected:boolean;duplicateOf:PriorityTask|"batch"|null;
 noDateConfirmed:boolean;claimedCheckedAt:string;warnings:string[];attempted:boolean;
 state:"draft"|"saving"|"saved"|"failed";error:string;
};
export declare const URGENCIES:readonly Urgency[];
export declare const DEADLINE_TYPES:readonly DeadlineType[];
export declare const ORIGINS:readonly Origin[];
export declare const RISE_TIME_ZONE:string;
export declare const WORK_LOAD_LIMIT:number;
export declare class PriorityConflictError extends Error{code:"CONFLICT";remote:PriorityTask;constructor(remote:PriorityTask);}
export declare function riseToday(now?:Date):string;
export declare function isCivilDate(s:unknown):boolean;
export declare function normalizePriority(task:Partial<PriorityTask>):Omit<ValidPriority,"title">;
export declare function sortPriorityTasks<T extends PriorityTask>(tasks:T[],now?:string):T[];
export declare function reopenStatusFor(task:Partial<PriorityTask>):string;
export declare function validatePriorityInput(input:PriorityInput,options?:{requireWhy?:boolean;allowUnverifiedReal?:boolean}):ValidPriority;
export declare function findPriorityTask(client:any,uid:string,id:string):Promise<PriorityTask|null>;
export declare function createPriorityTask(client:any,uid:string,input:PriorityInput,options?:{id?:string}):Promise<PriorityTask>;
export declare function persistProposal(client:any,uid:string,item:{id:string;input:PriorityInput;attempted:boolean}):Promise<{task:PriorityTask;recovered:boolean}>;
export declare function patchPriorityTask(client:any,uid:string,task:PriorityTask,changes:Partial<PriorityInput>&{status?:string}):Promise<PriorityTask>;
export declare function parsePriorityProposal(raw:string):ValidPriority[];
export declare function uniquePriorityProposals(proposals:ValidPriority[],current:PriorityTask[]):ValidPriority[];
export declare function reviewPriorityProposals(raw:string,current:PriorityTask[]):ProposalReview[];
export declare function proposalBlockers(item:Pick<ProposalReview,"input"|"noDateConfirmed">):string[];
