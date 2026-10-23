import type {HubNote} from './legacy-records.mjs';
export declare function loadAllNotes(client:any,uid:string,o?:{max?:number}):Promise<{rows:HubNote[];partial:boolean}>;
export declare function searchNotes(rows:HubNote[],q:string):HubNote[];
export declare function updateNote(client:any,uid:string,note:HubNote,v:{title:string;body:string}):Promise<HubNote>;
export declare function removeNote(client:any,uid:string,note:HubNote):Promise<true>;
