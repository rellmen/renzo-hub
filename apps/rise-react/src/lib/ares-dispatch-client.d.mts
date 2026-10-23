import type {AresRecord} from './ares-records.mjs';
export interface AresToolContract {enabled:boolean;tools:Array<{id:string;enabled:boolean;description?:string}>}
export declare function aresToolContract(opts?:{fetcher?:typeof fetch}):Promise<AresToolContract>;
export declare function canHandOff(row:AresRecord):boolean;
export declare function dispatchAresOperation(operationId:string,accessToken:string,opts?:{fetcher?:typeof fetch}):Promise<{ok:boolean;submitted:boolean;executed:false;status:string}>;
