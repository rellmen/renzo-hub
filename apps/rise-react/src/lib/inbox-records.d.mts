import type {SupabaseClient} from '@supabase/supabase-js';
export interface Capture {id:string;owner_id:string;domain:string;record_type:string;title:string|null;status:string;updated_at:string;occurred_at:string;payload:{category?:string;note?:string;status?:string;date?:string;source?:string;reviewReason?:string;extracted?:Record<string,unknown>;attachment?:{path:string;name:string;mime?:string;size?:number};[key:string]:unknown}}
export const CAPTURE_TYPES:readonly string[];
export const FINANCIAL_CAPTURE_TYPES:Set<string>;
export function captureStatus(row:Capture):string;
export function captureNeedsFinance(row:Capture):boolean;
export function captureReviewAvailable(row:Capture):boolean;
export function loadInbox(client:SupabaseClient,uid:string):Promise<Capture[]>;
export function captureRow(uid:string,input:{id:string;title:string;category?:string;note?:string},at?:Date):unknown;
export function createCapture(client:SupabaseClient,uid:string,input:{id:string;title:string;category?:string;note?:string}):Promise<Capture>;
export function changeCaptureStatus(client:SupabaseClient,uid:string,row:Capture,status:'archived'|'needs_review'):Promise<Capture>;
export function reviewCapture(client:SupabaseClient,uid:string,row:Capture):Promise<{ok:true}>;
export function privateCapturePath(uid:string,path:unknown):string;
export function attachCaptureFile(client:SupabaseClient,uid:string,row:Capture,file:File):Promise<Capture>;
export function downloadCaptureFile(client:SupabaseClient,uid:string,row:Capture):Promise<{blob:Blob;name:string}>;
