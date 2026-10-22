import type {LearningRun} from "./selflearn-checkpoints.mjs";
export interface PracticeStep { id:string;type:string;prompt?:string;answer?:string|string[];options?:string[];pairs?:string[][];rights?:string[];target?:string;es?:string;title?:string;text?:string;example?:{t:string;es:string}|null;audio?:string;sentence?:string;lines?:Array<{who:string;t:string;es:string}>;full?:string;hint?:string;tiles?:string[];word?:string[];t?:string;[key:string]:unknown }
export declare function makePractice(course:"nl"|"en",unit:string,options?:{minutes?:5|10|20;seed?:number}):LearningRun;
export declare function practicePrompt(run:LearningRun):{step:PracticeStep|null;progress:number;complete:boolean;score:{correct:number;total:number;pct:number}|null};
export declare function gradePractice(run:LearningRun,input:string|string[]):{run:LearningRun;correct:boolean;expected:string|null;stepType:string;complete:boolean;score:{correct:number;total:number;pct:number}|null};
export declare const supportedSelfLearnStepTypes:readonly string[];
